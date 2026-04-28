require("dotenv").config();
const Facture = require("../models/Facture");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const sendEmail = require("../utils/sendMail");
const path = require("path");
const fs = require("fs");
const axios = require("axios")

exports.getFactures = async (req, res) => {
  try {
    const { id, role } = req.user;
    const query = role === "admin" ? {} : { userId: id };

    const getFactures = await Facture.find(query)
      .populate("userId")
      .populate("payId")
      .populate({
        path: "registrationIds",
        populate: {
          path: "rentalId",
          model: "Rental",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(getFactures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error on fetching Facture" });
  }
};

exports.sendFacture = async (req, res) => {
  try {
    const { userId, data } = req.body;
    const getUser = await User.findById(userId);
    const getAdmin = await User.findOne({ role: "admin", mainAccount: true });
    const factureMail = getAdmin?.email;

    const file = req.file;
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    const dataRental = JSON.parse(data);

    const fileName = file.path.replace(/\\/g, "/").split("/")?.pop();
    const baseLien = (process.env.BACKEND_LIEN || '').replace(/\/api\/?$/, '');
    const fileUrl = `${baseLien}/api/product/pdf/${fileName}`;
    const payId =
      dataRental?.payId ||
      dataRental?._id ||
      dataRental?.facture?.payId?._id ||
      dataRental?.facture?.payId;

    if (!payId) {
      return res.status(400).json({ message: "Missing payId in invoice payload" });
    }

    const getFacture = await Facture.findOne({ payId });

    if (getUser.nTva && getUser.country === "BE" && dataRental.peppolSend) {
      // reseau peppol
      const billit = axios.create({
        baseURL: "https://api.sandbox.billit.be",
        headers: {
          "ApiKey": process.env.BILLIT_API_KEY,
          "Content-Type": "application/json"
        }
      });

      // Read the file into a buffer
      const fileBuffer = fs.readFileSync(`uploads\\${fileName}`);

      // Convert to Base64
      const fileBase64 = fileBuffer.toString('base64');

      const licensesList = dataRental.registerInfos || dataRental.licenses || [];
      const orderLines = licensesList.map((item) => ({
        Quantity: 1,
        UnitPriceExcl:
          (dataRental.totalPricePay / (1 + dataRental.tva)) /
          dataRental.registerInfos.length,
        Description: item.computerName || "Item",
        DescriptionExtended: `Auth Code: ${item.authCode}`,
        VATPercentage: dataRental.tva * 100
      }));

      // Add discount line only this facture
      if (getFacture.factureId === "N°202601/001") {
        orderLines.push({
          Quantity: 1,
          UnitPriceExcl: -31.5,
          Description: "Remise pour première connexion",
          VATPercentage: 0,
          AllowanceChargeIndicator: true // discount
        });
      }
      const originalId = getFacture.id; // "N°202601/007"
      const renamedId = originalId.replace(/^N°/, '').replace('/', '-');

      // Assuming `data` is the object you posted
      const invoiceData = {
        OrderType: "Invoice",
        OrderDirection: "Income",
        OrderNumber: getFacture.factureId,
        OrderDate: new Date(dataRental.startFrom).toISOString().split("T")[0], // YYYY-MM-DD
        DeliveryDate: new Date(dataRental.startFrom).toISOString().split("T")[0], // same as startFrom
        ExpiryDate: new Date(dataRental.endAt).toISOString().split("T")[0], // endAt
        OrderPDF: {
          FileName: `${renamedId}.pdf`,
          FileContent: fileBase64
        },
        Attachments: [
          {
            FileName: `${renamedId}.pdf`,
            FileContent: fileBase64
          },
        ],
        Customer: {
          Name: getUser.company || getUser.name,
          VATNumber: getUser?.nTva || "",
          PartyType: "Customer",
          Addresses: [
            {
              AddressType: "InvoiceAddress",
              Name: getUser.address,
              City: getUser.city || "",
              Zipcode: getUser.postal || "",
              Email: getUser.email,
              CountryCode: getUser.country || "BE"
            },
            {
              AddressType: "DeliveryAddress",
              Name: getUser.address,
              City: getUser.city || "",
              Zipcode: getUser.postal || "",
              CountryCode: getUser.country || "BE"
            }
          ]
        },
        orderLines
      };

      const filePath = path.join(__dirname, "..", file.path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        } else {
          console.log("File deleted successfully:", filePath);
        }
      });
      try {
        const response = await billit.post("/v1/orders", invoiceData);

        if (response.status === 200) {
          return res.status(200).json({ message: "Facture sent successfully via peppol" });
        } else {
          return res.status(400).json({ message: "Peppol Error", })
        }
      } catch (error) {
        return res.status(500).json({ message: "Peppol Error", })
      }
    }

    await sendEmail({
      type: "send-facture",
      email: getUser.email,
      code: "",
      data: { file, path: fileUrl, dataRental: dataRental },
      user: getUser,
    });

    /*     if(factureMail) {
          await sendEmail({
            type: "send-facture",
            email: factureMail,
            code: "",
            data: { file, path: fileUrl, dataRental: dataRental },
            user: getUser
          })
        } */

    const filePath = path.join(__dirname, "..", file.path);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting the file:", err);
      } else {
        console.log("File deleted successfully:", filePath);
      }
    });

    return res.status(200).json({ message: "Facture sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error on sending Facture" });
  }
};

exports.deleteFacture = async (req, res) => {
  try {
    const factureId = req.params.id;

    // Validation de l'ID
    if (!factureId) {
      return res.status(400).json({ message: "L'ID de la facture est requis" });
    }

    // Rechercher la facture
    const facture = await Facture.findById(factureId);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Supprimer le paiement associé s'il existe
    if (facture.payId) {
      await Payment.deleteOne({ _id: facture.payId });
    }

    // Supprimer la facture
    await Facture.deleteOne({ _id: factureId });

    return res.status(200).json({
      message: "Facture supprimée avec succès",
      deletedFactureId: factureId
    });
  } catch (err) {
    console.error("Erreur lors de la suppression de la facture :", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression de la facture",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};