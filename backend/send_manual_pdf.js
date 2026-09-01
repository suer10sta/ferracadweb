const transporter = require("./config/mail");
const path = require("path");
require("dotenv").config();

async function sendManualEmail() {
  const recipientEmail = "elisa.mithra@emdi.re";
  const subject = "Manuel d'utilisation Ferracad - Renouvellement de licence";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" alt="Ferracad" style="width: 150px;" />
      </div>
      
      <p>Bonjour EMDI,</p>

      <p>Nous vous informons que nous avons mis à votre disposition un <strong>manuel d’utilisation</strong> de la plateforme Ferracad, conçu pour vous permettre de renouveler votre licence en toute autonomie, de manière simple et rapide.</p>

      <p>Grâce à ce guide, vous pourrez effectuer le renouvellement en quelques clics, sans assistance externe.</p>

      <p>Vous trouverez en pièce jointe l’ensemble des détails, incluant les étapes à suivre ainsi que les instructions nécessaires pour mener à bien l’opération.</p>

      <p>Nous restons bien entendu à votre disposition pour toute question ou accompagnement complémentaire.</p>

      <p>Cordialement,</p>
      
      <p><strong>L'équipe Ferracad</strong></p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">
        © ${new Date().getFullYear()} Ferracad. Tous droits réservés.
      </p>
    </div>
  `;

  const attachmentPath = path.join(__dirname, "..", "client", "public", "file", "Mini Manuel Ferracad Client.pdf");

  try {
    const info = await transporter.sendMail({
      from: `"Ferracad Support" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      cc: process.env.SMTP_USER || process.env.ADMIN_SUPPORT,
      subject: subject,
      html: html,
      attachments: [
        {
          filename: "Mini Manuel Ferracad Client.pdf",
          path: attachmentPath
        }
      ]
    });

    console.log("Email envoyé avec succès !");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
}

sendManualEmail();
