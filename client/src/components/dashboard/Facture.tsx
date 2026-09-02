import { IoClose } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTotalLicenseDays } from "@/utils/getTotalLicenseDays";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { dataAdmin, facturesData } from "@/data/mockData";
import Loading from "../elements/Loading";
import apiClient from "@/services/api";
import { toast } from "sonner";
import LogoFerracad from "@/assets/ferracad-logo.png"
import { useLanguage } from "@/lang/LanguageProvider";
import countries from "@/data/countries.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { enrichedUser } from "@/data/dataUser";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

const matchPayId = (facturePayId: any, paymentId: any) => {
  const left = facturePayId?._id ?? facturePayId;
  if (left == null || paymentId == null) return false;
  return String(left) === String(paymentId);
};

/** Date de fin de contrat affichée sur la facture (jamais la date provisoire). */
const getInvoiceExpirationDate = (regis: any, fallback?: any) => {
  let expDate = regis?.expirationDate;
  if (regis?.realExpirationDate) expDate = regis.realExpirationDate;
  if (regis?.isProvisional && fallback) return fallback;
  
  // Si la date d'expiration actuelle est supérieure à la date de fin de cette facture,
  // cela signifie que la licence a été renouvelée ultérieurement. On utilise alors la date de fin de la facture.
  if (fallback && expDate && new Date(expDate) > new Date(fallback)) {
    return fallback;
  }
  
  return expDate || fallback;
};

const getFactureContractEndAt = (registrations: any[], factureEndAt: any) => {
  const dates = (registrations || [])
    .map((reg) => getInvoiceExpirationDate(reg, factureEndAt))
    .filter(Boolean);
  if (!dates.length) return factureEndAt;
  return dates.reduce((latest, date) =>
    new Date(date) > new Date(latest) ? date : latest
  );
};

const formatInvoiceDate = (value: any) => {
  if (!value) return "";
  const iso =
    typeof value === "string"
      ? value.split("T")[0]
      : new Date(value).toISOString().split("T")[0];
  return format(parseISO(iso), "dd/MM/yyyy");
};

const Facture = ({
  payment,
  setOpenFacture,
  isFromPay = true,
  isHide = false,
  setisHide = null,
  sendAsReminder = false,
  sendAsCreditNote = false,
  onCancelPayment,
}: any) => {
  const { t } = useLanguage();
  const user: any = enrichedUser();
  const [factureData, setFactureData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [AdminData, setAdminData] = useState<any>({})
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"email" | "peppol">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const isSendingRef = useRef(false);
  // const autoSendDoneRef = useRef<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const getFactures = await facturesData();
        const getDataAdmin = await dataAdmin();

        setAdminData(getDataAdmin)
        let dataTarget;
        if (isFromPay) {
          dataTarget = getFactures.find((e: { payId: any }) =>
            matchPayId(e.payId, payment?._id)
          );
        } else {
          dataTarget = getFactures.find((e: { payId: any }) =>
            matchPayId(e.payId, payment.paiements?._id)
          );
        }

        if (!dataTarget?.payId) {
          toast.error(t("dashboard_invoice_sendInvoiceError"));
          setOpenFacture({});
          return;
        }

        const payId = dataTarget.payId;
        const firstRegistration = dataTarget.registrationIds?.[0];
        const rental = firstRegistration?.rentalId;
        const contractEndAt = getFactureContractEndAt(
          dataTarget.registrationIds,
          dataTarget.endAt
        );

        setFactureData({
          id: `${dataTarget.factureId}`,
          creditNoteId: dataTarget.creditNoteId || "",
          name: dataTarget.userId?.name || "",
          createdAt: payId.createdAt
            ? format(parseISO(payId.createdAt), "dd/MM/yyyy")
            : "",
          address: dataTarget.userId?.address || "",
          pays: dataTarget.userId?.country || "",
          registerInfos: dataTarget.registrationIds || [],
          couponId: payId.couponId || "",
          coupon: dataTarget.coupon || {},
          totalPricePay: Number(payId.totalPricePay ?? payment?.totalPricePay ?? 0),
          endAt: contractEndAt,
          userData: dataTarget.userData,
          startFrom: dataTarget.startFrom,
          company: dataTarget.userId?.company,
          tva: Number(payId.tva ?? payment?.tva ?? 0) / 100,
          tvaAcheteur: dataTarget.userId?.nTva || "",
          isPaymentSuccess: payId.status === "success",
          isPaymentOnline: payId.type === "stripe",
          paymentType: payId.type,
          isAutoPay: rental?.deductionAuto ?? false,
          totalDays: rental?.duration ?? 0,
          isSent: dataTarget.isSent ?? false,
          sentAt: dataTarget.sentAt ? format(parseISO(dataTarget.sentAt), "dd/MM/yyyy HH:mm") : "",
        });
      } catch (error) {
        // console.error('Failed to fetch facture:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [payment]);

  const sendFacture = async (peppolSend: any = false) => {
    const facture = document.getElementById("card");
    if (!facture) {
      isSendingRef.current = false;
      return;
    }

    if (isSendingRef.current) return;
    isSendingRef.current = true;

    // const countrySupport = countries.find((e)=> e.code === factureData.userData.country)?.isZero;
    // if(countrySupport) {
    //   return;
    // }

    if (payment?.freeTrial) {
      if (typeof setisHide === "function") {
        setisHide(null);
      }
      setOpenFacture({});
      isSendingRef.current = false;
      return;
    }

    const facturePromise = (async () => {
      const canvas = await html2canvas(facture, {
        scale: 1,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Remove oklch colors that crash html2canvas
          const elements = clonedDoc.getElementsByTagName("*");
          for (let i = 0; i < elements.length; i++) {
            const style = window.getComputedStyle(elements[i]);
            if (style.color.includes("oklch") || style.backgroundColor.includes("oklch")) {
              (elements[i] as HTMLElement).style.color = "black";
              (elements[i] as HTMLElement).style.backgroundColor = "transparent";
            }
          }
        }
      });
      const imgData = canvas.toDataURL("image/jpeg");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      const dataFacture = { ...payment, ...factureData };
      const originalId = factureData.id || "N/A"; // "N°202601/007"
      const renamedId = originalId.replace(/^N°/, '').replace('/', '-');
      const renamedCreditNoteId = (factureData.creditNoteId || "NC").replace('/', '-');
      const filename = sendAsCreditNote ? `Note_de_credit_${renamedCreditNoteId}.pdf` : `${renamedId}.pdf`;
      formData.append(
        "facture",
        pdfBlob,
        filename
      );

      formData.append("userId", payment?.userData?._id ? payment?.userData?._id : (payment?.user?._id || payment.userId));
      formData.append("freetrial", payment?.freeTrial ? "true" : "false");
      formData.append("data", JSON.stringify({ ...dataFacture, peppolSend, sendAsReminder, sendAsCreditNote }));

      const res = await apiClient.post("/facture/send", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status !== 200) {
        throw new Error(res.data.message || t('dashboard_invoice_sendError'));
      }

      return { name: factureData?.name || "Facture" };
    })();

    toast.promise(facturePromise, {
      loading: sendAsCreditNote ? "Envoi de la note de crédit..." : t('dashboard_invoice_sending'),
      success: () => sendAsCreditNote ? "Note de crédit envoyée avec succès !" : t('dashboard_invoice_sendSuccess'),
      error: (err) => {
        const msg = err.response?.data?.message;
        if (msg) return msg;
        return err.message || (sendAsCreditNote ? "Erreur lors de l'envoi de la note de crédit" : t('dashboard_invoice_sendInvoiceError'));
      },
    });

    try {
      setIsLoading(true)
      await facturePromise;
      setFactureData((prev: any) => ({
        ...prev,
        isSent: true,
        sentAt: format(new Date(), "dd/MM/yyyy HH:mm")
      }));
    } catch (err) {
      // console.error("Erreur envoi facture :", err);
    } finally {
      if (typeof setisHide === "function") {
        setisHide(null);
      }
      setIsLoading(false)
      isSendingRef.current = false;
      setOpenFacture({});
    }
  };

  const exportPDF = () => {
    const facture = document.getElementById("card");
    if (!facture) return;
    html2canvas(facture, {
      scale: 1,
      useCORS: true,
      onclone: (clonedDoc) => {
        const elements = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < elements.length; i++) {
          const style = window.getComputedStyle(elements[i]);
          if (style.color.includes("oklch") || style.backgroundColor.includes("oklch")) {
            (elements[i] as HTMLElement).style.color = "black";
            (elements[i] as HTMLElement).style.backgroundColor = "transparent";
          }
        }
      }
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg", 0.8); // compress
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      const originalId = factureData.id || "N/A";
      const renamedId = originalId.replace(/^N°/, '').replace('/', '-');
      const renamedCreditNoteId = (factureData.creditNoteId || "NC").replace('/', '-');
      const filename = sendAsCreditNote ? `Note_de_credit_${renamedCreditNoteId}.pdf` : `${renamedId}.pdf`;
      pdf.save(filename);
    });
  };

  if (!payment) {
    setOpenFacture({});
    return;
  }

  // if (!factureData.id) {
  //   return <>search</>;
  // }

  const reduce = factureData?.id === "N°202601/001" ? 31.50 : 0;
  const totalTTC = Number(factureData.totalPricePay ?? payment?.totalPricePay ?? 0);
  const tvaRate = Number(factureData.tva ?? 0);
  const totalHT = tvaRate > -1 ? totalTTC / (1 + tvaRate) : totalTTC;
  const totalTvaAmount = totalTTC - totalHT;

  if (loading) {
    return <Loading />
  }

  return (
    <div
      className={`fixed ${isHide
        ? "opacity-0 pointer-events-none z-0 bottom-[100%]"
        : "top-0 left-0 z-[150]"
        } bg-black/30 w-full h-screen flex justify-center items-center`}
    >
      <div className="bg-white p-3 w-[70%] rounded-lg">
        <div className="flex justify-between items-center pb-5 px-4">
          <h4 className="font-medium text-sm text-black/70">
            {t('dashboard_invoice_preview')} {factureData?.name}
          </h4>
          <button className="cursor-pointer" onClick={() => setOpenFacture({})}>
            <IoClose />
          </button>
        </div>
        <div className="border-y border-stone-100 py-2 overflow-auto max-h-[80vh]">
          <div id="card" className="p-10  relative rounded-lg">
            {/* En-tête avec logo et numéro de facture */}
            <div className="flex justify-between items-start mb-8 pb-6">
              <div>
                <img
                  src={LogoFerracad}
                  alt="ferracad"
                  className="w-36"
                />
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold">
                  {sendAsCreditNote
                    ? `NOTE DE CRÉDIT sur la facture ${factureData.id}`
                    : t('dashboard_invoice_invoice')}
                </h1>
                <p className="text-sm font-semibold mt-1">
                  {sendAsCreditNote
                    ? (factureData.creditNoteId || "NC...")
                    : factureData.id}
                </p>
                {sendAsCreditNote ? (
                  <p className="text-xs mt-1">
                    Date de note de crédit :{" "}
                    <span className="font-medium">{format(new Date(), "dd/MM/yyyy")}</span>
                  </p>
                ) : factureData.paymentType === "cash" ? (
                  <>
                    <p className="text-xs mt-1">
                      {t('dashboard_invoice_invoice_date')}{" "}
                      <span className="font-medium">{factureData.createdAt}</span>
                    </p>
                    <p className="text-xs mt-1">
                      {t('dashboard_invoice_limit_date')}{" "}
                      <span className="font-medium">{factureData.createdAt}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs mt-1">
                    {t('dashboard_invoice_paidOn')}{" "}
                    <span className="font-medium">{factureData.createdAt}</span>
                    {factureData.paymentType === "stripe" ? ` ${t('dashboard_invoice_via')} Stripe` : factureData.paymentType === "paypal" ? ` ${t('dashboard_invoice_via')} PayPal` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Informations vendeur et acheteur */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-5">
              {/* Vendeur */}
              <div className="p-4 rounded-lg">
                <h4 className="font-semibold  mb-3 border-b pb-2">
                  {t('dashboard_invoice_seller')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_company')}</span>
                    <span className="">{AdminData?.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_address')}</span>
                    <span className=" text-right">{AdminData?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_country')}</span>
                    <span className="">{countries.find((e) => e.code === AdminData?.country)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_phone')}</span>
                    <span className="">{AdminData?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_settings_email')}</span>
                    <span className="">support@ferracad.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_vat')}</span>
                    <span className=" font-mono">{AdminData?.nTva}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_website')}</span>
                    <span className="">www.ferracad.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">IBAN</span>
                    <span className=" font-mono">{AdminData?.iban}</span>
                  </div>
                </div>
              </div>

              {/* Acheteur */}
              <div className="p-4 rounded-lg">
                <h4 className="font-semibold  mb-3 border-b pb-2">
                  {t('dashboard_invoice_buyer')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_buyerName')}</span>
                    <span className="">{factureData.userData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_company')}</span>
                    <span className="">{factureData.userData?.company || "Non spécifié"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_buyerCountry')}</span>
                    <span className="">
                      {countries.find((e) => e.code === factureData.userData?.country)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_buyerAddress')}</span>
                    <span className=" text-right">{factureData.userData?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('dashboard_invoice_vat')}</span>
                    <span className=" font-mono">{factureData.userData?.vatNumber || "Non applicable"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations sur le produit */}
            <div className="p-2 rounded-lg mb-6">
              <h4 className="font-semibold  mb-3 border-b pb-2">
                {t('dashboard_invoice_details_product_title')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{t('dashboard_invoice_details_product')}:</span>
                  <span className="">FerraCAD</span>
                </div>
                {/*<div className="flex justify-between">
                  <span className="font-medium">{t('dashboard_invoice_details_type')}:</span>
                  <span className="">{t('dashboard_invoice_details_custumize')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">{t('dashboard_invoice_details_auto')}:</span>
                  <span className="">
                    {
                      factureData.isAutoPay ? (
                        `${t('dashboard_settings_every_days')} ${getTotalLicenseDays(factureData.startFrom, factureData.endAt)} ${t('pay_03_j')}`
                      ) : t('dashboard_invoice_one_time')
                    }
                  </span>
                </div>*/}
                <div className="flex justify-between">
                  <span className="font-medium">{t('dashboard_invoice_totalLicenses')}</span>
                  <span className=" font-semibold">
                    {factureData?.registerInfos?.length} {t('checkout_licence')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tableau des licences */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 border-b pb-2">
                {t('dashboard_invoice_details_licence_title')}
              </h4>
              <Table className="text-sm">
                <TableHeader className="">
                  <TableRow>
                    <TableHead className="font-semibold w-12">#</TableHead>
                    <TableHead className="font-semibold">{t('dashboard_invoice_computerName')}</TableHead>
                    <TableHead className="font-semibold">{t('dashboard_invoice_identificationCode')}</TableHead>
                    <TableHead className="font-semibold">{t('pay_01_exp_date')}</TableHead>
                    <TableHead className="font-semibold text-right w-24">Prix HT</TableHead>
                    <TableHead className="font-semibold text-right w-24">{t('checkout_tva')}</TableHead>
                    {/*<TableHead className="font-semibold text-right w-24">{t('dashboard_invoice_total')}</TableHead>*/}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factureData?.registerInfos?.map((regis: any, index: number) => {
                    // Recalculer chaque prix HT proportionnellement au total corrigé
                    const licenseCount = factureData.registerInfos?.length || 1;
                    const storedTotalHT = factureData.registerInfos?.reduce(
                      (acc: number, r: any) => acc + (Number(r.priceHT) || 0),
                      0
                    ) || 0;
                    const priceHT = Number(
                      storedTotalHT > 0
                        ? (totalHT * (Number(regis.priceHT) || 0)) / storedTotalHT
                        : totalHT / licenseCount
                    );
                    const tvaUnitaire = priceHT * tvaRate;
                    const licenseExpiration = getInvoiceExpirationDate(
                      regis,
                      factureData.endAt
                    );
                    const hasBeenRenewed = factureData.endAt && regis?.expirationDate && new Date(regis.expirationDate) > new Date(factureData.endAt);
                    const addedDays =
                      (regis.addedDays && !hasBeenRenewed)
                        ? regis.addedDays
                        : getTotalLicenseDays(factureData.startFrom, licenseExpiration) - 1;

                    return (
                      <TableRow key={index} className="">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {regis.computerName}
                          <span className="text-[10px] text-gray-400 ml-2">({addedDays} {t("pay_03_j")})</span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{regis.computerCode}</TableCell>
                        <TableCell className="font-medium text-xs">
                          {formatInvoiceDate(licenseExpiration)}
                        </TableCell>
                        <TableCell className="text-right">{sendAsCreditNote ? "- " : ""}€ {priceHT.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{sendAsCreditNote ? "- " : ""}€ {tvaUnitaire.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Total et mentions légales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 items-center p-3">
              {/* Total */}
              <div className="rounded-lg">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="font-semibold">{t('dashboard_invoice_priceht')}:</span>
                  <span className="font-semibold">
                    {sendAsCreditNote ? "- " : ""}€ {totalHT.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="font-semibold">{t('checkout_tva')} ({tvaRate * 100}%):</span>
                  <span className="font-semibold">
                    {sendAsCreditNote ? "- " : ""}€ {totalTvaAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <span className="font-semibold">Total TTC :</span>
                  <span className="font-semibold">
                    {sendAsCreditNote ? "- " : ""}€ {totalTTC.toFixed(2)}
                  </span>
                </div>
                {
                  factureData.id === "N°202601/001" && (
                    <>
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-semibold">Remise pour première connexion :</span>
                        <span className="font-semibold">{sendAsCreditNote ? "" : "- "}€ {reduce}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-bold text-lg">Total :</span>
                        <span className="font-bold text-lg">{sendAsCreditNote ? "- " : ""}€ {(totalTTC - reduce).toFixed(2)}</span>
                      </div>
                    </>
                  )
                }
              </div>

              {/* Mentions légales */}
              <div className="text-xs space-y-2">
                <p><strong>{t('dashboard_invoice_regle_pay')}:</strong> {factureData.isPaymentOnline ? t('dashboard_invoice_regle_pay_desc') : t('dashboard_settings_cash')}</p>
                <p><strong>{t('dashboard_invoice_regle_support')}:</strong> support@ferracad.com</p>
                <p><strong>{t('dashboard_invoice_regle_regleg')}:</strong> www.ferracad.com/conditions-generales</p>
                <p><strong>{t('dashboard_invoice_regle_msupport')}:</strong> {t('dashboard_invoice_regle_msupport_desc')}</p>
                {/*<p className="mt-4">
                  {t('dashboard_invoice_regle_regleeup')}
                </p>*/}
              </div>
            </div>

            {/* Pied de page */}
            <div className="mt-8 pt-6 text-center">
              <p className="text-xs">
                {t('VAT_AUTO_21_2_BE')}
              </p>
              <p className="text-xs my-1">
                {t('dashboard_invoice_regle_adress')}
              </p>
              <p className="text-xs">
                support@ferracad.com - www.ferracad.com
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-2 pt-5">
          <div>
            {factureData.isSent ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 font-medium text-xs py-1 px-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Facture envoyée {factureData.sentAt ? `(${factureData.sentAt})` : ""}
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1 font-medium text-xs py-1 px-2.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Facture non envoyée
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs font-medium bg-stone-800 transition-all duration-200 hover:bg-stone-900 text-white flex items-center gap-2 p-2 rounded-full cursor-pointer"
                  disabled={isLoading}
                >
                  <IoIosSend className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] z-[200]">
                <DialogHeader>
                  <DialogTitle>{sendAsCreditNote ? "Envoyer la note de crédit" : "Envoyer la facture"}</DialogTitle>
                  <DialogDescription>
                    {sendAsCreditNote ? "Choisissez la méthode d'envoi pour cette note de crédit" : "Choisissez la méthode d'envoi pour cette facture"}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                  <RadioGroup
                    value={selectedOption}
                    onValueChange={(value: "email" | "peppol") => setSelectedOption(value)}
                    className="space-y-4"
                  >
                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-stone-50 cursor-pointer"
                      onClick={() => setSelectedOption("email")}
                    >
                      <RadioGroupItem value="email" id="email" />
                      <Label
                        htmlFor="email"
                        className="flex-1 cursor-pointer flex flex-col space-y-1"
                      >
                        <span className="font-medium">Envoyer par email</span>
                        <span className="text-sm text-stone-500">
                          {sendAsCreditNote
                            ? "La note de crédit sera envoyée par email au client"
                            : "La facture sera envoyée par email au client"}
                        </span>
                      </Label>
                    </div>

                    <div
                      className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-stone-50 cursor-pointer"
                      onClick={() => setSelectedOption("peppol")}
                    >
                      <RadioGroupItem value="peppol" id="peppol" />
                      <Label
                        htmlFor="peppol"
                        className="flex-1 cursor-pointer flex flex-col space-y-1"
                      >
                        <span className="font-medium">Envoyer via Peppol</span>
                        <span className="text-sm text-stone-500">
                          {sendAsCreditNote
                            ? "La note de crédit sera transmise via le réseau Peppol (e-invoicing)"
                            : "La facture sera transmise via le réseau Peppol (e-invoicing)"}
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isLoading}
                  >
                    Annuler
                  </Button>
                  <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isLoading}
                        className="bg-stone-800 hover:bg-stone-900"
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <IoIosSend className="mr-2 h-4 w-4" />
                            {selectedOption === "peppol" ? "Envoyer via Peppol" : "Envoyer par email"}
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="z-[200]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer l'envoi</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir envoyer {sendAsCreditNote ? "cette note de crédit" : "cette facture"}{" "}
                          {selectedOption === "peppol" ? "via Peppol" : "par email"} ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-stone-800 hover:bg-stone-900"
                          onClick={() => {
                            sendFacture(selectedOption === "peppol");
                            setOpen(false);
                          }}
                        >
                          Confirmer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {onCancelPayment && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 p-1.5 px-4 rounded-xl cursor-pointer"
                >
                  Annuler la commande et envoyer note de crédit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[250]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir annuler cette commande ? Les accès et licences provisoires associés seront immédiatement désactivés et une note de crédit sera envoyée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Retour</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCancelPayment}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Confirmer l'annulation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <button
            onClick={exportPDF}
            className="text-xs font-medium flex items-center gap-2 border border-stone-800 p-1 px-5 rounded-xl cursor-pointer"
          >
            <MdOutlineFileDownload />
            {t('telechargement')}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facture;
