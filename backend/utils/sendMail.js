// Load environment variables
require("dotenv").config();

const transporter = require("../config/mail");

const sendEmail = async ({
  type,
  email,
  code,
  data = {},
  user = {},
  freeTrial = false,
  disableCc = false,
}) => {
  let subject = "";
  let html = "";

  switch (type) {
    case "auth-code":
      // Si c'est un free trial, on définit les valeurs correspondantes
      let duration = data?.rental?.duration;
      let startDate = data?.rental?.startDate;
      let nextBillingDate = data?.rental?.nextBillingDate;

      if (freeTrial) {
        duration = data.duree;
        startDate = new Date();
        nextBillingDate = new Date();
        nextBillingDate.setDate(startDate.getDate() + duration);
      }

      const formattedNextBillingDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(nextBillingDate);

      subject = `Votre code d'authentification de ${data.computerName} - ${data.username}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
            </div>
    
            <h2 style="color: #ff3a3a; font-size: 22px; text-align: center; margin-bottom: 20px;">Activation de votre licence Ferracad</h2>
    
            <p style="font-size: 16px; color: #333333;">Bonjour ${user.name
        },</p>
    
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Suite à votre demande, voici votre nouveau code d'autorisation pour le logiciel Ferracad :
            </p>
    
            <p style="font-size: 15px; color: #444444;">Voici votre code d'activation personnel :</p>
    
            <!-- Activation Code -->
            <div style="font-size: 17px; font-weight: bold; text-align: center; letter-spacing: 2px; background: #fff4f4; color: #d80000; padding: 16px 24px; border-radius: 6px; margin: 20px auto; display: inline-block;">
              ${code}
            </div>
    
            <!-- Subscription Info -->
            <div style="font-size: 15px; color: #444444; margin-top: 20px;">
              <p><strong>Nom de l'ordinateur :</strong> ${data.computerName}</p>
              <p><strong>Durée de l’abonnement :</strong> ${duration} jours</p>
              <p><strong>Ce code est valable jusqu'au </strong> ${formattedNextBillingDate}</p>
            </div>
    
            <p style="font-size: 14px; color: #555555; margin-top: 24px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Merci de votre confiance,</p>
              <p style="font-size: 13px; color: #999999; margin: 0;">— L’équipe Ferracad</p>
              <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</p>
            </div>
    
          </div>
        </div>
      `;
      break;

    case "auth-code-provisional":
      // Email for provisional authorization code (awaiting payment)
      const provDuration = data?.provisionalDurationDays || 15;
      const provRealDuration = data?.realDuration || data?.rental?.duration || 0;
      const provExpDate = data?.provisionalExpDate
        ? new Date(data.provisionalExpDate)
        : (() => { const d = new Date(); d.setDate(d.getDate() + provDuration); return d; })();
      const provRealExpDate = data?.realExpirationDate
        ? new Date(data.realExpirationDate)
        : (data?.rental?.nextBillingDate ? new Date(data.rental.nextBillingDate) : null);

      const formattedProvExpDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(provExpDate);

      const formattedRealExpDate = provRealExpDate
        ? new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).format(provRealExpDate)
        : "N/A";

      subject = `⏳ Code provisoire — ${data.computerName} — En attente de paiement`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
            </div>

            <!-- Provisional Badge -->
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
              <strong style="color: #856404; font-size: 14px;">⏳ CODE PROVISOIRE — En attente de paiement</strong>
            </div>

            <h2 style="color: #ff3a3a; font-size: 22px; text-align: center; margin-bottom: 20px;">Activation provisoire de votre licence Ferracad</h2>
    
            <p style="font-size: 16px; color: #333333;">Bonjour ${user.name},</p>
    
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Suite à la création de votre commande, voici votre <strong>code d'autorisation provisoire</strong> pour le logiciel Ferracad.
              Ce code est <strong>temporaire</strong> et sera remplacé par un code définitif une fois votre paiement confirmé.
            </p>
    
            <p style="font-size: 15px; color: #444444;">Votre code d'activation provisoire :</p>
    
            <!-- Activation Code -->
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 17px; font-weight: bold; letter-spacing: 2px; background: #fff4f4; color: #d80000; padding: 16px 24px; border-radius: 6px; display: inline-block;">
                ${code}
              </div>
            </div>

            <!-- Warning Box -->
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">⚠️ Important — Délai de paiement</p>
              <p style="color: #721c24; margin: 0; font-size: 14px; line-height: 1.5;">
                Ce code provisoire est valable <strong>${provDuration} jour${provDuration > 1 ? 's' : ''}</strong> (jusqu'au <strong>${formattedProvExpDate}</strong>).
                <br/>Si votre paiement n'est pas reçu dans ce délai, <strong>ce code expirera automatiquement</strong> et vous ne recevrez pas le code définitif pour la durée complète de votre abonnement.
              </p>
            </div>
    
            <!-- Subscription Info -->
            <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #444444;"><strong>Détails de votre commande :</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Nom de l'ordinateur :</strong> ${data.computerName}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Durée provisoire :</strong> ${provDuration} jours (jusqu'au ${formattedProvExpDate})</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Durée totale de l'abonnement :</strong> ${provRealDuration} jours (jusqu'au ${formattedRealExpDate})</p>
            </div>

            <!-- What happens next -->
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #155724; margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">✅ Que se passe-t-il après le paiement ?</p>
              <p style="color: #155724; margin: 0; font-size: 14px; line-height: 1.5;">
                Une fois votre virement bancaire reçu et confirmé, vous recevrez par email un <strong>code d'activation définitif</strong> 
                valable pour la durée complète de votre abonnement (${provRealDuration} jours, jusqu'au ${formattedRealExpDate}).
              </p>
            </div>
    
            <p style="font-size: 14px; color: #555555; margin-top: 24px;">
              Si vous avez des questions ou avez déjà effectué le virement, n'hésitez pas à nous contacter.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Merci de votre confiance,</p>
              <p style="font-size: 13px; color: #999999; margin: 0;">— L'équipe Ferracad</p>
              <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</p>
            </div>
    
          </div>
        </div>
      `;
      break;

    case "auth-code-final":
      // Email for definitive authorization code (after payment confirmed)
      const finalDuration = data?.rental?.duration || 0;
      const finalNextBillingDate = data?.rental?.nextBillingDate
        ? new Date(data.rental.nextBillingDate)
        : (data?.expirationDate ? new Date(data.expirationDate) : new Date());

      const formattedFinalExpDate = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(finalNextBillingDate);

      subject = `✅ Paiement confirmé — Votre code définitif pour ${data.computerName}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
            </div>

            <!-- Success Badge -->
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
              <strong style="color: #155724; font-size: 14px;">✅ PAIEMENT CONFIRMÉ — Code définitif activé</strong>
            </div>

            <h2 style="color: #28a745; font-size: 22px; text-align: center; margin-bottom: 20px;">Votre licence Ferracad est maintenant active</h2>
    
            <p style="font-size: 16px; color: #333333;">Bonjour ${user.name},</p>
    
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Nous avons bien reçu votre paiement. Voici votre <strong>code d'autorisation définitif</strong> qui remplace le code provisoire précédent.
            </p>
    
            <p style="font-size: 15px; color: #444444;">Votre nouveau code d'activation définitif :</p>
    
            <!-- Activation Code -->
            <div style="text-align: center; margin: 20px 0;">
              <div style="font-size: 17px; font-weight: bold; letter-spacing: 2px; background: #d4edda; color: #155724; padding: 16px 24px; border-radius: 6px; display: inline-block;">
                ${code}
              </div>
            </div>
    
            <!-- Subscription Info -->
            <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #444444;"><strong>Détails de votre abonnement :</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Nom de l'ordinateur :</strong> ${data.computerName}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Durée de l'abonnement :</strong> ${finalDuration} jours</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Ce code est valable jusqu'au :</strong> ${formattedFinalExpDate}</p>
            </div>

            <div style="background: #e8f4fd; border: 1px solid #bee5eb; padding: 14px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #0c5460; margin: 0; font-size: 14px; line-height: 1.5;">
                💡 <strong>Rappel :</strong> Ce code remplace votre ancien code provisoire. 
                Veuillez utiliser ce nouveau code dans le logiciel Ferracad pour activer votre licence.
              </p>
            </div>
    
            <p style="font-size: 14px; color: #555555; margin-top: 24px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Merci de votre confiance,</p>
              <p style="font-size: 13px; color: #999999; margin: 0;">— L'équipe Ferracad</p>
              <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</p>
            </div>
    
          </div>
        </div>
      `;
      break;

    case "verify-account":
      subject = `Confirmez votre adresse e-mail, ${data.name || ""} !`;
      html = `
          <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 520px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">

            <h2 style="color: #8B0000; text-align: center;">🔐 Vérification de votre compte</h2>

            <p style="font-size: 15px; color: #333;">Bonjour ${data.name || "utilisateur"
        },</p>

            <p style="font-size: 15px; color: #444; line-height: 1.6;">
              Merci de vous être inscrit sur notre plateforme. Pour finaliser la création de votre compte, veuillez confirmer votre adresse e-mail en cliquant sur le bouton ci-dessous :
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${code}" style="background-color: #8B0000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Vérifier mon compte
              </a>
            </div>

            <p style="font-size: 13px; color: #666;">
              Ce lien est valable pendant une durée limitée (24 heures). Si vous n’avez pas créé de compte, vous pouvez ignorer cet e-mail.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 12px; color: #999;">
              Merci,<br/>
              L’équipe Support
            </p>
          </div>
        `;
      break;

    case "contact-form":
      subject = `Ticket #${data.ticketNum + 1} — ${data.name || "Client"}`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header / Logo -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 160px;" alt="Ferracad logo" />
            </div>
    
            <!-- Title -->
            <h2 style="color: #8B0000; text-align: center; margin-bottom: 20px;">Nouveau message de contact</h2>
    
            <!-- Intro -->
            <p style="font-size: 15px; color: #333333; line-height: 1.6;">
              Vous avez reçu un nouveau message via le formulaire de contact Ferracad.
            </p>
    
            <!-- Contact Info -->
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #444;">
              <p><strong>Nom :</strong> ${data.name || "—"}</p>
              <p><strong>Email :</strong> <a href="mailto:${data.email
        }" style="color:#8B0000;">${data.email}</a></p>
              <p><strong>Sujet :</strong> ${data.subject || "—"}</p>
              <p><strong>IP :</strong> ${data.ip || "—"}</p>
              <p><strong>Compte existant :</strong> ${data.isActiveAcc ? "Oui" : "Non"
        }</p>
            </div>
    
            <!-- Message -->
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #8B0000; margin-bottom: 30px; font-size: 15px; color: #333333; line-height: 1.6;">
              <p style="white-space: pre-wrap;">${data.message || "(Aucun message)"
        }</p>
            </div>
    
            <!-- Footer -->
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 13px; color: #777777; text-align: center;">
              Cet email a été généré automatiquement par Ferracad.<br/>
              Pour répondre, contactez directement l’expéditeur.
            </p>
          </div>
        </div>
      `;
      break;

    case "contact-reply":
      subject = `Réponse à votre message : ${data.subject || "Ferracad"}`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 160px;" alt="Ferracad logo" />
            </div>
            <h2 style="color: #8B0000; text-align: center; margin-bottom: 20px;">Réponse de l'équipe Ferracad</h2>
            <p style="font-size: 15px; color: #333333; line-height: 1.6;">
              Bonjour ${data.name || ""},
            </p>
            <p style="font-size: 15px; color: #333333; line-height: 1.6;">
              Nous avons bien reçu votre message concernant "<strong>${data.subject || ""}</strong>". Voici notre réponse :
            </p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8B0000; margin: 20px 0; font-size: 15px; color: #333333; line-height: 1.6; white-space: pre-wrap;">
              ${data.replyMessage}
            </div>
            <p style="font-size: 15px; color: #333333; line-height: 1.6;">
              N'hésitez pas à nous recontacter si vous avez d'autres questions.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 13px; color: #777777; text-align: center;">
              Cordialement,<br/>
              L’équipe Ferracad
            </p>
          </div>
        </div>
      `;
      break;

    case "password-reset":
      subject = "Réinitialisation de votre mot de passe";
      const resetLink = `${process.env.FRONTEND_LIEN}/connexion/reset-password/${code}`;
      console.log(resetLink);

      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 550px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #8B0000; text-align: center;">Réinitialisation du mot de passe</h2>
          <p style="font-size: 15px; color: #333;">Bonjour ${data.name || ""
        },</p>
          <p style="font-size: 15px; color: #333;">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer :
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #8B0000; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; display: inline-block;">
              Réinitialiser le mot de passe
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :<br />
            <a href="${resetLink}" style="color: #8B0000; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #e0e0e0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.<br />
            Merci,<br />L’équipe Support
          </p>
        </div>
      `;
      break;

    case "send-facture":
      const { dataRental } = data;
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };
      // Calculer les totaux
      const totalLicences = dataRental.licenses
        ? dataRental.licenses.length
        : dataRental.registerInfos
          ? dataRental.registerInfos.length
          : 0;
      const tauxTVA = dataRental.facture?.payId
        ? parseFloat(dataRental.facture.payId.tva) / 100
        : dataRental.tva
          ? dataRental.tva
          : 0;

      const totalTTC = dataRental.paiements
        ? dataRental.paiements.totalPricePay
        : dataRental.totalPricePay
          ? dataRental.totalPricePay
          : 0;

      // Convert TVA to number (it might be string like "20")
      const tvaRate = parseFloat(tauxTVA) || 0;

      // Calculate HT
      const montantHT = totalTTC / (1 + tvaRate);
      const montantTVA = montantHT * tvaRate;
      const montantTTC = montantHT + montantTVA;

      // Sécurisation des accès aux données
      const rentalInfo = dataRental.rentalInfos?.[0] || {};
      const startDateFacture = dataRental.startDate || dataRental.startFrom || rentalInfo.startDate;
      const nextBillingDateFacture = dataRental.nextBillingDate || dataRental.endAt || rentalInfo.nextBillingDate;
      let durationFacture = dataRental.duration || dataRental.daysUntilExpiration || rentalInfo.duration || 0;

      // Calcul de secours si la durée est absente ou à 0
      if (durationFacture <= 0 && startDateFacture && nextBillingDateFacture) {
        const start = new Date(startDateFacture);
        const end = new Date(nextBillingDateFacture);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        durationFacture = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      const licensesList = dataRental.licenses || dataRental.registerInfos || [];

      // Prioritize the cumulative sum of added days for the email display
      const cumulativeDays = licensesList.reduce((acc, reg) => acc + (reg.addedDays || 0), 0);

      subject = `Votre facture Ferracad ${dataRental.id}`;
      let durationDisplay = cumulativeDays > 0 ? cumulativeDays : durationFacture;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 700px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img 
              src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
              alt="Ferracad" 
              style="width: 140px; object-fit: contain;" 
            />
          </div>
    
          <h2 style="color: #8B0000; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 25px;">Votre facture est maintenant disponible</h2>
    
          <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
            Bonjour <strong>${user.name || "client"}</strong>,
          </p>
    
          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
            Merci pour votre commande sur Ferracad. Voici le récapitulatif de votre location :
          </p>
    
          <!-- Détails de la facture -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Détails de la commande</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Numéro de commande:</td>
                <td style="padding: 8px 0; font-weight: 500;">${dataRental.id || "N/A"
        }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date de commande:</td>
                <td style="padding: 8px 0; font-weight: 500;">${startDateFacture ? formatDate(startDateFacture) : "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Durée cumulée globale :</td>
                <td style="padding: 8px 0; font-weight: 500;">${durationDisplay} jours</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Nombre de licences:</td>
                <td style="padding: 8px 0; font-weight: 500;">${totalLicences} licence(s)</td>
              </tr>
            </table>
          </div>
    
          <!-- Détails des licences -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Licences activées</h3>
            
            ${licensesList.length > 0
          ? licensesList
            .map(
              (license, index) => `
                  <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 6px; border-left: 4px solid #8B0000;">
                    <strong style="color: #333;">Licence ${index + 1}:</strong>
                    <div style="font-size: 14px; color: #666; margin-top: 4px;">
                      Utilisateur: ${license.username || "N/A"}<br>
                      Poste: ${license.computerName || "N/A"}<br>
                      Code d'activation: <code style="background: #f1f1f1; padding: 2px 6px; border-radius: 3px;">${license.authCode || "N/A"}</code>
                    </div>
                  </div>
                `
            )
            .join("")
          : ""
        }
          </div>
    
          <!-- Détails financiers -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Détails financiers</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Type de paiement:</td>
                <td style="padding: 8px 0; font-weight: 500; text-transform: capitalize;">
                  ${dataRental.paiements
          ? dataRental.paiements?.type === "free"
            ? "Gratuit"
            : dataRental.paiements?.type
          : dataRental?.type === "free"
            ? "Gratuit"
            : dataRental?.type
        }
                </td>
              </tr>
              ${dataRental.paiements?.type !== "free" ||
          dataRental?.type === "free"
          ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Montant HT:</td>
                <td style="padding: 8px 0; font-weight: 500;">${montantHT.toFixed(
            2
          )} €</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">TVA (${tauxTVA * 100}%):</td>
                <td style="padding: 8px 0; font-weight: 500;">${montantTVA.toFixed(
            2
          )} €</td>
              </tr>
              <tr style="border-top: 1px solid #ddd;">
                <td style="padding: 12px 0; color: #333; font-weight: bold;">Montant TTC:</td>
                <td style="padding: 12px 0; font-weight: bold; color: #8B0000; font-size: 18px;">${montantTTC.toFixed(
            2
          )} €</td>
              </tr>
              `
          : `
              <tr>
                <td style="padding: 12px 0; color: #333; font-weight: bold;">Montant:</td>
                <td style="padding: 12px 0; font-weight: bold; color: #8B0000; font-size: 18px;">Gratuit</td>
              </tr>
              `
        }
              <tr>
                <td style="padding: 8px 0; color: #666;">Statut:</td>
                <td style="padding: 8px 0;">
                  <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                    ${dataRental.paiements?.status === "success"
          ? "Payé"
          : dataRental?.status === "success"
            ? "Payé"
            : dataRental?.status
        }
                  </span>
                </td>
              </tr>
            </table>
          </div>
    
          <p style="font-size: 14px; color: #555555; margin-top: 16px;">
            Votre facture détaillée est disponible en pièce jointe et sur votre compte personnel sur la plateforme Ferracad.
          </p>
    
          <p style="font-size: 14px; color: #666666; line-height: 1.5; margin-bottom: 30px;">
            Si vous avez la moindre question, n'hésitez pas à nous contacter. Nous sommes à votre disposition pour vous aider.
          </p>
    
          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 25px;" />
    
          <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
            Merci pour votre confiance,<br/>
            <strong>L'équipe Ferracad</strong><br/>
            <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
          </p>
        </div>
      `;
      break;

    case "two-factors":
      subject = `Votre code de vérification - Ferracad`;
      html = `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" alt="Ferracad" style="width: 140px;" />
            </div>
    
            <!-- Title -->
            <h2 style="color: #8B0000; text-align: center; margin-bottom: 20px;">Code de vérification</h2>
    
            <!-- Greeting -->
            <p style="font-size: 16px; color: #333333;">
              Bonjour ${user?.name || "Utilisateur"},
            </p>
    
            <!-- Message -->
            <p style="font-size: 15px; color: #555555; line-height: 1.6;">
              Pour sécuriser votre compte Ferracad, veuillez utiliser le code ci-dessous pour compléter votre vérification à deux facteurs.
            </p>
    
            <!-- Code Box -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 14px 28px; background-color: #8B0000; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">
                ${code}
              </div>
            </div>
    
            <!-- Info -->
            <p style="font-size: 14px; color: #777777; text-align: center; line-height: 1.5;">
              Ce code expirera dans 1 jour. Ne le partagez avec personne.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
    
            <!-- Footer -->
            <p style="font-size: 13px; color: #999999; text-align: center; line-height: 1.5;">
              Merci de faire confiance à <strong>Ferracad</strong>.<br/>
              Pour toute question, contactez notre support.
            </p>
    
          </div>
        </div>
      `;
      break;

    case "send-invitation":
      disableCc = true; // Désactive le CC pour les invitations (Test local)

      subject = `${user.name} vous invite à rejoindre Ferracad`;

      const trialLink = `${process.env.FRONTEND_LIEN}/enregistrement-du-logiciel?invitation=${code}`;

      html = `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 40px 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" 
                   alt="Ferracad" 
                   style="width: 140px; height: auto;" />
            </div>
    
            <!-- Title -->
            <h2 style="color: #8B0000; text-align: center; margin-bottom: 16px;">
              Invitation à rejoindre l’équipe Ferracad
            </h2>
    
            <!-- Message -->
            <p style="font-size: 15px; color: #333; line-height: 1.6;">
              Bonjour,
            </p>
    
            <p style="font-size: 15px; color: #444; line-height: 1.6;">
              <strong>${user.name
        }</strong> vous invite à rejoindre son entreprise sur <strong>Ferracad</strong>, 
              la solution professionnelle compatible avec <strong>AutoCAD®</strong> et <strong>ZWCAD®</strong>.
            </p>
    
            <p style="font-size: 15px; color: #444; line-height: 1.6;">
              En rejoignant cette société, vous pourrez collaborer sur vos projets, partager des ressources 
              et bénéficier d’un accès complet à la plateforme.
            </p>
    
            <!-- Trial CTA -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trialLink}" 
                 style="background-color: #8B0000; color: #ffffff; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">
                Rejoindre l’entreprise et commencer mon essai gratuit de 30 jours
              </a>
            </div>
    
            <!-- Info -->
            <p style="font-size: 14px; color: #555; line-height: 1.6;">
              Cet essai gratuit de <strong>30 jours</strong> vous permet de découvrir toutes les fonctionnalités de Ferracad, 
              sans carte de crédit requise.  
            </p>
    
            <div style="background-color: #f9f9f9; padding: 14px; border-radius: 8px; font-size: 13px; color: #777; margin-top: 20px;">
              <p style="margin: 0;">
                Invitation ID : <strong>${code}</strong><br/>
              </p>
              <a href="${trialLink}">${trialLink}</a>
            </div>
    
            <!-- Footer -->
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 13px; color: #999999; text-align: center; line-height: 1.5;">
              Merci de faire confiance à <strong>Ferracad</strong>.<br/>
              Pour toute question, contactez notre équipe de support.<br/>
              <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
            </p>
    
          </div>
        </div>
      `;
      break;

    case "remembre-renouvellement":
      const sub = data;

      const formatDateRemembre = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      // 🔹 Calcul du nombre de jours restants avant expiration
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normaliser à début de journée

      const expirationDate = new Date(sub.nextBillingDate);
      expirationDate.setHours(0, 0, 0, 0); // Normaliser à début de journée

      const diffTime = expirationDate - today;
      const resteDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Gérer le cas où l'abonnement est déjà expiré
      const isExpired = resteDays <= 0;
      const daysText = isExpired
        ? "est expiré"
        : `expire dans ${resteDays} jour${resteDays > 1 ? "s" : ""}`;

      subject = isExpired
        ? "Action requise — Votre abonnement Ferracad a expiré"
        : `Rappel de renouvellement — Votre abonnement Ferracad ${daysText}`;

      // Couleur en fonction de l'urgence
      const getUrgencyColor = () => {
        if (isExpired) return "#c82333";
        if (resteDays <= 2) return "#dc3545";
        if (resteDays <= 5) return "#fd7e14";
        if (resteDays <= 10) return "#ffc107";
        return "#6c757d";
      };

      html = `
          <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 700px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img 
                src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
                alt="Ferracad" 
                style="width: 140px; object-fit: contain;" 
              />
            </div>
      
            <!-- Bandeau d'urgence -->
            ${isExpired || resteDays <= 2
          ? `
              <div style="background: ${getUrgencyColor()}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <strong>${isExpired ? "⚠️ ABONNEMENT EXPIRÉ" : "⚠️ DERNIER RAPPEL"
          }</strong>
              </div>
            `
          : ""
        }
      
            <h2 style="color: ${getUrgencyColor()}; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 25px;">
              ${isExpired
          ? "Votre abonnement a expiré"
          : "Votre abonnement arrive à expiration"
        }
            </h2>
      
            <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
              Bonjour <strong>${user.name || "client"}</strong>,
            </p>
      
            <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
              ${isExpired
          ? `Votre abonnement Ferracad <strong style="color:${getUrgencyColor()};">a expiré</strong>. Pour réactiver votre service sans interruption, veuillez renouveler dès que possible.`
          : `Nous vous informons que votre abonnement Ferracad arrive à expiration dans <strong style="color:${getUrgencyColor()};">${resteDays} jour${resteDays > 1 ? "s" : ""
          }</strong>. Pour éviter toute interruption de service, pensez à le renouveler avant la date d'expiration.`
        }
            </p>
      
            <!-- Détails de l'abonnement -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${getUrgencyColor()};">
              <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Détails de l'abonnement</h3>
      
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 40%;">Numéro d'abonnement:</td>
                  <td style="padding: 8px 0; font-weight: 500;">COM-${sub._id
          .toString()
          .slice(5, 10)
          .toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date de début:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${formatDateRemembre(
            sub.startDate
          )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date d'expiration:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${formatDateRemembre(
            sub.nextBillingDate
          )}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Durée:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${sub.duration
        } jour(s)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Jours restants:</td>
                  <td style="padding: 8px 0; font-weight: 500; color: ${getUrgencyColor()};">
                    ${isExpired
          ? "0 jour (Expiré)"
          : `${resteDays} jour${resteDays > 1 ? "s" : ""}`
        }
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Statut:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: ${isExpired ? "#d9534f" : "#ffc107"
        }; color: ${isExpired ? "white" : "#333"
        }; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                      ${isExpired
          ? "Expiré"
          : sub.status === "active"
            ? "Actif"
            : sub.status
        }
                    </span>
                  </td>
                </tr>
              </table>
            </div>
      
            <!-- Message contextuel -->
            <div style="background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 25px; border-left: 4px solid #1890ff;">
              <p style="margin: 0; color: #333; font-size: 14px;">
              💡 <strong>Pourquoi renouveler ?</strong> Le renouvellement de votre abonnement vous permet de continuer à bénéficier de tous vos services sans interruption.
            </p>
          </div>
    
          <p style="font-size: 15px; color: #555; line-height: 1.5; margin-bottom: 25px;">
            Pour ${isExpired ? "réactiver" : "renouveler"
        } votre abonnement, connectez-vous à votre compte Ferracad :
          </p>
    
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_LIEN}/tableau-de-board/commande" 
               style="background-color: ${getUrgencyColor()}; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              ${isExpired
          ? "Réactiver mon abonnement"
          : "Renouveler mon abonnement"
        }
            </a>
          </div>
    
          <!-- Lien alternatif -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
              Si le bouton ne fonctionne pas, copiez-collez ce lien :
            </p>
            <a href="${process.env.FRONTEND_LIEN}/tableau-de-board/commande" 
               style="color: #1890ff; font-size: 14px; word-break: break-all;">
              ${process.env.FRONTEND_LIEN}/tableau-de-board/commande
            </a>
          </div>
    
          <p style="font-size: 14px; color: #666666; line-height: 1.5; margin-bottom: 25px;">
            ${isExpired
          ? "Si vous avez déjà renouvelé votre abonnement, veuillez actualiser votre tableau de bord."
          : "Si vous avez déjà effectué le paiement ou renouvelé votre abonnement, veuillez ignorer ce message."
        }
          </p>
    
          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 25px;" />
    
          <!-- Support -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #666;">
              Besoin d'aide ? <a href="mailto:support@ferracad.com" style="color: #8B0000;">Contactez notre support</a>
            </p>
          </div>
    
          <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
            Merci pour votre confiance,<br/>
            <strong>L'équipe Ferracad</strong><br/>
            <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
          </p>
        </div>
      `;
      break;

    case "invite-create-account":
      const licenseData = data;

      const formatDateInvo = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      };

      // Calcul des jours restants
      const todayInvo = new Date();
      const expirationDateInvo = new Date(licenseData.expirationDate);
      const diffTimeInvo = expirationDateInvo - todayInvo;
      const daysLeft = Math.ceil(diffTimeInvo / (1000 * 60 * 60 * 24));

      subject = `Activez votre compte Ferracad - Accédez à votre licence ${licenseData.computerName}`;

      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 700px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
    
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img 
              src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
              alt="Ferracad" 
              style="width: 140px; object-fit: contain;" 
            />
          </div>
    
          <h2 style="color: #8B0000; font-size: 26px; font-weight: 700; text-align: center; margin-bottom: 25px;">
            Bienvenue sur Ferracad !
          </h2>
    
          <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
            Bonjour <strong>${licenseData.username}</strong>,
          </p>
    
          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
            Votre licence Ferracad a été créée avec succès. Pour finaliser votre installation et gérer votre abonnement, 
            vous devez créer un compte sur notre plateforme.
          </p>
    
          <!-- Détails de la licence -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #8B0000;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Votre licence en attente</h3>
    
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 40%;">Nom d'utilisateur:</td>
                <td style="padding: 8px 0; font-weight: 500;">${licenseData.username
        }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Ordinateur:</td>
                <td style="padding: 8px 0; font-weight: 500;">${licenseData.computerName
        }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Code d'activation:</td>
                <td style="padding: 8px 0; font-weight: 500;">
                  <span style="font-family: monospace; background: #e9ecef; padding: 6px 12px; border-radius: 4px; border: 1px dashed #ccc;">
                    ${licenseData.authCode}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Code de l'ordinateur:</td>
                <td style="padding: 8px 0; font-weight: 500;">
                  <span style="font-family: monospace; background: #e9ecef; padding: 6px 12px; border-radius: 4px;">
                    ${licenseData.computerCode}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Statut:</td>
                <td style="padding: 8px 0;">
                  <span style="background: #17a2b8; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                    ${licenseData.status === "freetrial"
          ? "Essai gratuit"
          : "Actif"
        }
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Expiration:</td>
                <td style="padding: 8px 0; font-weight: 500;">${formatDateInvo(
          licenseData.expirationDate
        )}</td>
              </tr>
              ${daysLeft > 0
          ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Jours restants:</td>
                  <td style="padding: 8px 0; font-weight: 500; color: #28a745;">
                    ${daysLeft} jour${daysLeft > 1 ? "s" : ""}
                  </td>
                </tr>
              `
          : ""
        }
            </table>
          </div>
    
          <!-- Étapes à suivre -->
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">📋 Étapes à suivre</h3>
            <ol style="color: #555; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 10px;"><strong>Créez votre compte</strong> en cliquant sur le bouton ci-dessous</li>
              <li style="margin-bottom: 10px;"><strong>Activez votre licence</strong> dans votre tableau de bord</li>
              <li style="margin-bottom: 10px;"><strong>Gérez votre abonnement</strong> et effectuez les mises à jour</li>
            </ol>
          </div>
    
          <!-- Avantages -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Ce que vous pourrez faire :</h3>
            <ul style="color: #555; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">Mettre à jour votre licence</li>
              <li style="margin-bottom: 8px;">Renouveler votre abonnement</li>
              <li style="margin-bottom: 8px;">Gérer plusieurs ordinateurs</li>
              <li style="margin-bottom: 8px;">Consulter l'historique d'utilisation</li>
              <li style="margin-bottom: 8px;">Accéder au support technique</li>
            </ul>
          </div>
    
          <!-- Bouton d'action principal -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_LIEN}/louer/register" 
               style="background-color: #8B0000; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 15px;">
              Créer mon compte Ferracad
            </a>
            <p style="font-size: 14px; color: #666; margin: 0;">
              Lien direct : <a href="${process.env.FRONTEND_LIEN
        }/louer/register" style="color: #8B0000;">${process.env.FRONTEND_LIEN
        }/louer/register</a>
            </p>
          </div>
    
          <!-- Informations de sécurité -->
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 25px; border: 1px solid #ffeaa7;">
            <h4 style="color: #856404; margin-bottom: 10px; font-size: 14px;">🔒 Informations importantes :</h4>
            <p style="font-size: 13px; color: #856404; margin: 0; line-height: 1.4;">
              <strong>Gardez ces codes confidentiels :</strong><br/>
              • Code d'activation : <strong>${licenseData.authCode
        }</strong><br/>
              • Code ordinateur : <strong>${licenseData.computerCode
        }</strong><br/>
              Vous en aurez besoin pour lier votre licence à votre compte.
            </p>
          </div>
    
          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 25px;" />
    
          <!-- Support -->
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #666;">
              Besoin d'aide pour la configuration ? <br/>
              <a href="mailto:support@ferracad.com" style="color: #8B0000;">support@ferracad.com</a> | 
              <a href="${process.env.FRONTEND_LIEN
        }/contact" style="color: #8B0000;">Centre d'aide</a>
            </p>
          </div>
    
          <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
            Merci de nous rejoindre !<br/>
            <strong>L'équipe Ferracad</strong><br/>
            <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
          </p>
        </div>
      `;
      break;

    case "welcome-newsletter":
      subject = `Bienvenue dans notre newsletter Ferracad ! 🎉`;

      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
    
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img 
              src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
              alt="Ferracad" 
              style="width: 140px; object-fit: contain;" 
            />
          </div>
    
          <h2 style="color: #8B0000; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 20px;">
            Bienvenue dans notre communauté !
          </h2>
    
          <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
            Merci de vous être inscrit à notre newsletter. Vous faites maintenant partie de notre communauté et serez parmi les premiers informés de nos actualités.
          </p>
    
          <!-- Ce que vous allez recevoir -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">✨ Ce qui vous attend :</h3>
            <ul style="color: #555; line-height: 1.6; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 10px;">📰 <strong>Actualités exclusives</strong> - Soyez le premier informé de nos nouveautés</li>
              <li style="margin-bottom: 10px;">🎁 <strong>Offres spéciales</strong> - Bénéficiez d'avantages réservés aux abonnés</li>
              <li style="margin-bottom: 10px;">💡 <strong>Conseils experts</strong> - Optimisez votre expérience Ferracad</li>
              <li style="margin-bottom: 10px;">🚀 <strong>Nouvelles fonctionnalités</strong> - Découvrez les dernières améliorations</li>
              <li style="margin-bottom: 10px;">📅 <strong>Événements</strong> - Participez à nos webinaires et formations</li>
            </ul>
          </div>
    
          <!-- Prochaines étapes -->
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">🎯 Ne manquez rien !</h3>
            <p style="color: #555; line-height: 1.6; margin: 0;">
              Pour ne rien manquer de nos communications, ajoutez <strong>newsletter@ferracad.com</strong> à vos contacts et vérifiez vos spams si vous ne recevez pas nos emails.
            </p>
          </div>
    
          <!-- Bouton vers le site -->
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${process.env.FRONTEND_LIEN}" 
               style="background-color: #8B0000; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
              Découvrir Ferracad
            </a>
          </div>
    
          <!-- Réseaux sociaux -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
              Suivez-nous sur les réseaux :
            </p>
            <div style="display: flex; justify-content: center; gap: 15px;">
              <a href="#" style="color: #8B0000; text-decoration: none;">Facebook</a>
              <a href="#" style="color: #8B0000; text-decoration: none;">Twitter</a>
              <a href="#" style="color: #8B0000; text-decoration: none;">LinkedIn</a>
              <a href="#" style="color: #8B0000; text-decoration: none;">Instagram</a>
            </div>
          </div>
    
          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />
    
          <!-- Footer -->
          <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 13px; color: #999999; line-height: 1.4;">
              Merci de votre confiance,<br/>
              <strong>L'équipe Ferracad</strong><br/>
              <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
            </p>
          </div>
        </div>
      `;
      break;

    case "rappel-order":
      subject = `Votre compte Ferracad est actif - Ajoutez votre première licence`;

      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <img 
              src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
              alt="Ferracad" 
              style="width: 140px; object-fit: contain;" 
            />
          </div>

          <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
            Bonjour <strong>${data.name}</strong>,
          </p>

          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
            Nous avons remarqué que votre compte Ferracad est actif mais que vous n'avez pas encore de licence. 
            Complétez votre installation pour profiter de tous nos services.
          </p>

          <!-- Bouton d'action -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_LIEN}/tableau-de-board" 
               style="background-color: #8B0000; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Ajouter ma première licence
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
              <a href="${process.env.FRONTEND_LIEN
        }/tableau-de-board" style="color: #8B0000;">${process.env.FRONTEND_LIEN
        }/tableau-de-board</a>
            </p>
          </div>

          <!-- Support -->
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 10px; font-size: 16px;">💡 Besoin d'aide ?</h3>
            <p style="color: #555; line-height: 1.5; margin: 0; font-size: 14px;">
              Notre équipe est disponible pour vous accompagner dans la configuration de votre première licence.
              <br>
              <a href="mailto:support@ferracad.com" style="color: #8B0000;">support@ferracad.com</a>
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />

          <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
            Merci de votre confiance,<br/>
            <strong>L'équipe Ferracad</strong><br/>
            <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
          </p>
        </div>
      `;
      break;

    case "recommandation-creation-account":
      subject = `Finalisez votre compte Ferracad et suivez vos commandes - ${user.name}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
          <h2 style="color: #8B0000; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 20px;">Bienvenue sur Ferracad - ${user.name
        }</h2>
          <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
            Bonjour ${user.name},
          </p>
          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
            Votre compte Ferracad a été créé avec succès ! Vous bénéficiez actuellement d'une période d'essai gratuit.
          </p>
          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
            <strong>Prochaines étapes :</strong>
          </p>
          <ul style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px; padding-left: 20px;">
            <li>Connectez-vous à votre compte</li>
            <li>Complétez vos informations personnelles</li>
            <li>Suivez l'état de vos commandes</li>
            <li>Accédez à tous nos services</li>
          </ul>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.FRONTEND_LIEN
        }/connexion" style="background-color: #8B0000; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Me connecter à mon compte
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">
              <a href="${process.env.FRONTEND_LIEN
        }/connexion" style="color: #8B0000;">${process.env.FRONTEND_LIEN
        }/connexion</a>
            </p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              <strong>Vos identifiants :</strong><br/>
              Email : ${user.email}<br/>
              Mot de passe : ${user.passwordAccount}
            </p>
            <p style="font-size: 13px; color: #8B0000; margin: 10px 0 0 0; font-style: italic;">
              Vous pourrez modifier votre mot de passe dans les paramètres de votre compte une fois connecté.
            </p>
          </div>
          <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
            Merci de votre confiance,<br/>
            <strong>L'équipe Ferracad</strong><br/>
            <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
          </p>
        </div>
      `;
      break;

    case "activation-reminder":
      subject = `Activez votre compte Ferracad - Accès aux plugins AutoCAD & ZWCAD`;

      html = `
    <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <img 
          src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
          alt="Ferracad" 
          style="width: 140px; object-fit: contain;" 
        />
      </div>

      <h2 style="color: #8B0000; font-size: 22px; font-weight: 600; text-align: center; margin-bottom: 20px;">
        Activez votre compte Ferracad
      </h2>

      <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
        Bonjour <strong>${data.name}</strong>,
      </p>

      <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
        Merci de vous être inscrit sur Ferracad ! Pour accéder à nos plugins AutoCAD et ZWCAD, vous devez activer votre compte en cliquant sur le lien ci-dessous.
      </p>

      <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
        <strong>Une fois activé, vous pourrez :</strong>
      </p>
      
      <ul style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px; padding-left: 20px;">
        <li>✅ Accéder à votre tableau de bord</li>
        <li>✅ Gérer vos licences</li>
        <li>✅ Bénéficier du support technique</li>
      </ul>

      <!-- Problème de clic -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <p style="color: #555; line-height: 1.5; margin: 0; font-size: 14px;">
          1. Copiez-collez le lien ci-dessus dans votre navigateur
          <br>
          2. Ou connectez-vous sur <a href="${process.env.FRONTEND_LIEN
        }/connexion" style="color: #8B0000;">${process.env.FRONTEND_LIEN
        }/connexion</a> 
          <br>
          3. Un nouveau lien d'activation vous sera envoyé
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />

      <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
        Si vous ne vous êtes pas inscrit, ignorez cet email.<br/>
        <strong>L'équipe Ferracad</strong><br/>
        <small>© ${new Date().getFullYear()} Ferracad.</small>
      </p>
    </div>
  `;
      break;

    case "password-add":
      subject = data?.reference
        ? `[ADMIN] Votre espace client Ferracad est prêt – Accédez à votre compte – ${data.name}`
        : `Votre espace client Ferracad est prêt – Accédez à votre compte`;

      html = `
          <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <img 
                src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
                alt="Ferracad" 
                style="width: 140px; object-fit: contain;" 
              />
            </div>
      
            <h2 style="color: #8B0000; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 20px;">
              Activation de votre espace client Ferracad
            </h2>
      
            <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
              Bonjour <strong>${data.name}</strong>,
            </p>
      
            <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
              Dans le cadre de l’évolution de la plateforme <strong>Ferracad</strong>, nous avons mis en place un nouvel espace client afin de vous offrir une gestion plus autonome et plus efficace de vos licences.
              <br><br>
              <strong>Vous pouvez désormais commander, consulter et renouveler vos licences directement en ligne.</strong>
            </p>
      
            <!-- Infos compte -->
            <div style="background-color: #f8f9fa; padding: 18px; border-radius: 8px; margin-bottom: 25px;">
              <p style="font-size: 15px; color: #555; margin: 0;">
                <strong>Vos identifiants de connexion :</strong><br/><br/>
                Adresse e-mail : <strong>${data.email}</strong><br/>
                Mot de passe temporaire : <strong>${code || "Un mot de passe a été généré automatiquement"}</strong>
              </p>
              <p style="font-size: 13px; color: #8B0000; margin-top: 10px; font-style: italic;">
                Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe lors de votre première connexion.
              </p>
            </div>
      
            <!-- Bouton connexion -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.FRONTEND_LIEN}/connexion"
                 style="background-color: #8B0000; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                Accéder à mon espace client
              </a>
            </div>
      
            <!-- Guide -->
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 10px; font-size: 16px;">
                🎯 Guide de démarrage
              </h3>
              <p style="color: #555; line-height: 1.5; margin-bottom: 10px; font-size: 14px;">
                Un guide de démarrage est disponible pour vous accompagner pas à pas dans la prise en main de votre espace client.
              </p>
              <a href="${process.env.FRONTEND_LIEN}/?guide=demarage"
                 style="color: #8B0000; font-weight: bold; text-decoration: none;">
                Accéder au guide de démarrage
              </a>
            </div>
      
            <!-- Support -->
            <div style="background: #fef6f6; padding: 18px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #333; margin-bottom: 8px; font-size: 16px;">
                ❓ Besoin d’assistance ?
              </h3>
              <p style="color: #555; line-height: 1.5; font-size: 14px; margin-bottom: 8px;">
                Si vous rencontrez une difficulté ou si vous avez une question, notre équipe support est à votre disposition.
              </p>
              <a href="${process.env.FRONTEND_LIEN}/contact"
                 style="color: #8B0000; font-weight: bold; text-decoration: none;">
                Contacter le support Ferracad
              </a>
            </div>
      
            <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />
      
            <!-- Footer -->
            <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
              <a href="${process.env.FRONTEND_LIEN}/contact" style="color: #8B0000; text-decoration: none;">
                Support & Contact
              </a><br/><br/>
              <strong>L’équipe Ferracad</strong><br/>
              <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
            </p>
          </div>
        `;
      break;

    case "password-add-admin":
      subject = `[ADMIN] Votre espace client Ferracad est prêt – Accédez à votre compte`;

      html = `
    <div style="font-family: Arial, sans-serif; padding: 30px 20px; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 10px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <img 
          src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png"
          alt="Ferracad" 
          style="width: 140px; object-fit: contain;" 
        />
      </div>

      <h2 style="color: #8B0000; font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 20px;">
        Notification administrateur
      </h2>

      <p style="font-size: 16px; color: #333333; line-height: 1.5; margin-bottom: 20px;">
        Bonjour,
      </p>

      <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 25px;">
  Le système Ferracad a automatiquement généré et attribué des mots de passe temporaires pour certains comptes clients.
  <br><br>
  Les clients concernés ont reçu un e-mail d’activation de leur espace client Ferracad, contenant :
  <ul style="margin: 10px 0 0 18px; color: #555; font-size: 15px;">
    <li>leur adresse e-mail de connexion,</li>
    <li>un mot de passe temporaire généré automatiquement,</li>
    <li>un lien d’accès à leur espace client,</li>
    <li>un lien vers le guide de démarrage pour la prise en main de la plateforme,</li>
    <li>les informations de contact du support Ferracad.</li>
  </ul>
  <br>
  <strong>Cette notification est envoyée à titre informatif.</strong>
</p>


      <!-- Liste des utilisateurs -->
      <div style="background-color: #f8f9fa; padding: 18px; border-radius: 8px; margin-bottom: 25px;">
        <p style="font-size: 15px; color: #555; margin-bottom: 12px;">
          <strong>Comptes clients concernés :</strong>
        </p>

        ${Array.isArray(data) && data.length
          ? `
              <ul style="padding-left: 18px; margin: 0; color: #333;">
                ${data.map(name => `<li style="margin-bottom: 6px;">${name}</li>`).join("")}
              </ul>
            `
          : `<p style="color: #777; font-style: italic;">Aucun compte n’a été traité lors de cette exécution.</p>`
        }
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />

      <!-- Footer -->
      <p style="font-size: 13px; color: #999999; line-height: 1.4; text-align: center;">
        <strong>Système automatisé Ferracad</strong><br/>
        <small>© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</small>
      </p>
    </div>
  `;
      break;

    case "custom":
      subject = data.subject || "No Subject";
      const bodyContent = (data.html || "").replace(/\n/g, '<br/>');
      html = `
        <div style="color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background-color: #ffffff;">
          <div style="margin-bottom: 40px; font-size: 16px; color: #444;">
            ${bodyContent}
          </div>
          
          <div style="margin-top: 50px; padding-top: 25px; border-top: 2px solid #f8f9fa;">
            <p style="">À très bientôt,<br />L'équipe Ferracad</p>
            
            <a href="https://ferracad.com" target="_blank" style="">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" alt="Ferracad Logo" style="height: 20px; width: auto; display: block; margin-bottom: 8px;" />
            </a>
            
            <div style="">
              <a href="https://ferracad.com" target="_blank" style="color: #3498db;">https://ferracad.com</a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
              <p style="font-size: 12px; color: #bdc3c7; margin: 0;">
                © ${new Date().getFullYear()} Ferracad. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      `;
      break;

    case "otp-code":
      subject = `Votre code de vérification Ferracad : ${code}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #8B0000; text-align: center;">Vérification de votre adresse e-mail</h2>
          <p style="font-size: 16px; color: #333;">Bonjour,</p>
          <p style="font-size: 15px; color: #555;">Veuillez utiliser le code suivant pour valider votre demande d'essai Ferracad :</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #8B0000; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
              ${code}
            </span>
          </div>
          <p style="font-size: 13px; color: #999; text-align: center;">Ce code expirera dans 10 minutes. Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
        </div>
      `;
      break;

    case "unified-trial-code":
      subject = "Votre essai gratuit Ferracad est prêt !";
      const loginLink = `${process.env.FRONTEND_LIEN}/connexion`;

      html = `
        <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" alt="Ferracad" style="width: 140px;" />
          </div>
          
          <h2 style="color: #8B0000; font-size: 24px; text-align: center; margin-bottom: 20px;">🎉 Licence activée avec succès !</h2>
          
          <p style="font-size: 16px; color: #333;">Bonjour ${user.name || ""},</p>
          <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Merci d'avoir choisi Ferracad. Votre période d'essai de 30 jours a commencé. Voici vos accès complets :
          </p>
          
          <!-- Code Licence -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B0000;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">🔑 Votre Code d'Autorisation</h3>
            <p style="font-family: monospace; font-size: 18px; font-weight: bold; color: #8B0000; margin: 0;">${code}</p>
            <p style="font-size: 12px; color: #777; margin-top: 5px;">(À copier dans le logiciel Ferracad)</p>
          </div>
          
          <!-- Identifiants Dashboard -->
          <div style="background: #fdfdfd; padding: 20px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">🖥️ Vos identifiants de compte</h3>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Identifiant (E-mail) :</strong> ${email}</p>
            <p style="font-size: 14px; margin: 5px 0;"><strong>Mot de passe :</strong> ${data.tempPassword}</p>
            <p style="font-size: 12px; color: #b91c1c; font-weight: bold; margin-top: 10px;">
              ⚠️ Conservez précieusement ces identifiants pour vos futures connexions.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginLink}" style="background-color: #8B0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accéder à mon Espace Client
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          
          <p style="font-size: 13px; color: #999; text-align: center;">
            Besoin d'aide ? Contactez notre support à <a href="mailto:support@ferracad.com" style="color: #8B0000;">support@ferracad.com</a><br/>
            © ${new Date().getFullYear()} Ferracad. Tous droits réservés.
          </p>
        </div>
      `;
      break;

    case "download-instructions":
      subject = "Prochaine étape : Activez votre période d'essai Ferracad";
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 650px; margin: auto; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #ffffff; color: #333; line-height: 1.6;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" alt="Ferracad" style="width: 150px;" />
          </div>
          
          <h2 style="color: #000; font-size: 22px; margin-bottom: 10px; text-align: center;">Merci d'avoir téléchargé Ferracad !</h2>
          <p style="font-size: 16px; color: #555; text-align: center; margin-bottom: 30px;">
            Votre fichier est prêt. Suivez ces 4 étapes simples pour activer votre période d'essai gratuite de 30 jours et obtenir votre code d'autorisation.
          </p>

          <h3 style="color: #e11d48; font-size: 18px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; font-weight: bold;">Vos prochaines étapes</h3>
          
          <div style="margin-top: 20px;">
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; width: 24px; hieght: 24px; background: #e11d48; color: white; border-radius: 50%; text-align: center; font-weight: bold; margin-right: 10px; line-height: 24px;">1</span>
              <strong style="font-size: 16px;">Installez et lancez le plugin Ferracad</strong>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 34px;">Ouvrez AutoCAD ou ZWCAD, puis lancez le plugin Ferracad. Une fenêtre s'affiche automatiquement avec votre Code ordinateur — ce code identifie votre machine de manière unique.</p>
            </div>

            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; width: 24px; hieght: 24px; background: #e11d48; color: white; border-radius: 50%; text-align: center; font-weight: bold; margin-right: 10px; line-height: 24px;">2</span>
              <strong style="font-size: 16px;">Cliquez sur le lien bleu dans la fenêtre du plugin</strong>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 34px;">Dans la fenêtre Ferracad, repérez la phrase : "Pour vous enregistrer, veuillez cliquer sur ce lien pour vous rendre sur notre plateforme en ligne." Cliquez sur ce lien. Votre navigateur s'ouvrira avec votre code machine déjà pré-rempli automatiquement.</p>
            </div>

            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #e11d48; color: white; border-radius: 50%; text-align: center; font-weight: bold; margin-right: 10px; line-height: 24px;">3</span>
              <strong style="font-size: 16px;">Validez votre e-mail</strong>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 34px;">Sur la page qui s'ouvre, validez votre e-mail avec le code de sécurité. <strong>Vos informations (nom et plateforme) s'afficheront alors automatiquement</strong> d'après votre téléchargement. Vérifiez simplement que tout est correct.</p>
            </div>

            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; width: 24px; height: 24px; background: #e11d48; color: white; border-radius: 50%; text-align: center; font-weight: bold; margin-right: 10px; line-height: 24px;">4</span>
              <strong style="font-size: 16px;">Récupérez votre code et activez votre licence</strong>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 34px;">Vous recevrez immédiatement un email contenant votre code d'autorisation. Il sera aussi disponible directement sur la plateforme. Copiez ce code dans la fenêtre Ferracad et cliquez sur "Enregistrer". Votre essai de 30 jours démarre immédiatement !</p>
            </div>
          </div>

          <p style="font-size: 15px; color: #555; text-align: center; margin-top: 40px; font-weight: bold;">
            À très vite sur Ferracad !
          </p>

          <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            © ${new Date().getFullYear()} Ferracad. Tous droits réservés.
          </p>
        </div>
      `;
      break;

    case "free-trial-reminder":
      subject = "Votre accès gratuit n'est pas encore activé";
      html = `
    <div style="font-family: Arial, sans-serif; padding: 40px 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
        </div>

        <h2 style="color: #ff3a3a; font-size: 22px; text-align: center; margin-bottom: 20px;">
          Votre accès gratuit n'est pas encore activé
        </h2>

        <p style="font-size: 16px; color: #333333;">Bonjour ${data.prenom},</p>

        <p style="font-size: 15px; color: #444444; line-height: 1.6;">
          Nous avons remarqué que votre accès gratuit n'a pas encore été activé sur 
          <a href="https://ferracad.com" style="color: #d80000;">ferracad.com</a>. 
          Suite à une mise à jour récente, nous avons simplifié le processus d'activation 
          pour vous faciliter la démarche.
        </p>

        <!-- Instructions -->
        <div style="background: #fff4f4; border-left: 4px solid #d80000; padding: 16px 20px; border-radius: 6px; margin: 24px 0;">
          <p style="font-size: 15px; font-weight: bold; color: #d80000; margin: 0 0 12px 0;">
            👉 Pour activer votre accès :
          </p>
          <p style="font-size: 14px; color: #444; margin: 8px 0;">
            ✅ <strong>Vous avez déjà le plugin Ferracad ?</strong><br/>
            Lancez-le, puis cliquez sur le lien qui s'affiche pour finaliser votre activation.
          </p>
          <div style="text-align: center; margin: 15px 0;">
            <img src="https://ferracad.com/plugin.png" alt="Activation Plugin" style="width: 100%; max-width: 500px; border-radius: 8px; border: 1px solid #eee;" />
          </div>
          
          <p style="font-size: 14px; color: #444; margin: 8px 0;">
            📥 <strong>Vous ne l'avez plus ?</strong><br/>
            Retéléchargez-le directement ici :
            <a href="https://ferracad.com" style="color: #d80000; font-weight: bold;">
              https://ferracad.com
            </a>
          </p>
          <div style="text-align: center; margin: 15px 0;">
            <img src="https://ferracad.com/home.png" alt="Ferracad Home" style="width: 100%; max-width: 500px; border-radius: 8px; border: 1px solid #eee;" />
          </div>
        </div>

        <!-- Warning -->
        <div style="background: #fffbe6; border-left: 4px solid #f0a500; padding: 14px 20px; border-radius: 6px; margin: 16px 0;">
          <p style="font-size: 14px; color: #555; margin: 0;">
            ⚠️ <strong>Un problème ?</strong> Répondez simplement à cet email, 
            notre équipe vous prendra en charge rapidement.
          </p>
        </div>

        <p style="font-size: 14px; color: #555555; margin-top: 24px;">
          Merci pour votre patience et votre confiance.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

        <!-- Footer -->
        <div style="text-align: center;">
          <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Cordialement,</p>
          <p style="font-size: 13px; color: #999999; margin: 0;">— L'équipe Support Ferracad</p>
          <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">
            © ${new Date().getFullYear()} Ferracad. Tous droits réservés.
          </p>
        </div>

      </div>
    </div>
  `;
      break;

    case "payment-reminder":
      subject = `⏳ Rappel de paiement — Ferracad ${data.factureId || ""}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
            </div>
 
            <!-- Badge -->
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
              <strong style="color: #856404; font-size: 14px;">⏳ RAPPEL DE PAIEMENT — En attente de virement</strong>
            </div>
 
            <h2 style="color: #ff3a3a; font-size: 22px; text-align: center; margin-bottom: 20px;">Rappel : Règlement de votre facture en attente</h2>
    
            <p style="font-size: 16px; color: #333333;">Bonjour ${user.name || "client"},</p>
    
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Sauf erreur ou omission de notre part, le paiement de votre facture <strong>${data.factureId || ""}</strong> d'un montant de <strong>${data.totalPricePay || 0} €</strong> pour votre commande Ferracad n'a pas encore été validé.
            </p>
            
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Nous vous rappelons que l'activation définitive de vos licences est conditionnée par la réception de votre paiement. Afin de ne pas interrompre l'accès à vos licences, nous vous invitons à procéder au virement bancaire dans les plus brefs délais.
            </p>
 
            <!-- Details Box -->
            <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #444444;"><strong>Détails du règlement en attente :</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Numéro de facture :</strong> ${data.factureId || "N/A"}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Montant total dû :</strong> ${data.totalPricePay || 0} €</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Statut :</strong> En attente de virement bancaire</p>
            </div>
 
            <p style="font-size: 14px; color: #555555; margin-top: 24px;">
              Si vous avez déjà effectué le virement, ou si vous avez des questions, n'hésitez pas à nous contacter en répondant directement à cet e-mail.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Merci pour votre confiance,</p>
              <p style="font-size: 13px; color: #999999; margin: 0;">— L'équipe Ferracad</p>
              <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</p>
            </div>
    
          </div>
        </div>
      `;
      break;

    case "credit-note":
      subject = `❌ Note de crédit ${data.creditNoteId || ""} — Annulation de votre facture ${data.factureId || ""}`;
      html = `
        <div style="font-family: Arial, sans-serif; padding: 40px 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://ferracad.com/assets/ferracad-logo-B4kX6JH0.png" style="width: 120px;" alt="Ferracad" />
            </div>

            <!-- Badge -->
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; text-align: center;">
              <strong style="color: #721c24; font-size: 14px;">❌ NOTE DE CRÉDIT — Commande annulée</strong>
            </div>

            <h2 style="color: #dc3545; font-size: 22px; text-align: center; margin-bottom: 20px;">Note de crédit ${data.creditNoteId || ""}</h2>
    
            <p style="font-size: 16px; color: #333333;">Bonjour ${user.name || "client"},</p>
    
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              Nous vous informons que votre commande Ferracad référencée <strong>${data.factureId || ""}</strong> d'un montant de <strong>${data.totalPricePay || 0} €</strong> a été <strong>annulée</strong>.
            </p>
            
            <p style="font-size: 15px; color: #444444; line-height: 1.6;">
              La présente note de crédit annule et remplace la facture correspondante. Vous trouverez ci-joint la note de crédit au format PDF pour vos archives.
            </p>

            <!-- Details Box -->
            <div style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #444444;"><strong>Détails de l'annulation :</strong></p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Numéro de note de crédit :</strong> ${data.creditNoteId || "N/A"}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Numéro de facture annulée :</strong> ${data.factureId || "N/A"}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Montant crédité :</strong> - ${data.totalPricePay || 0} €</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Date de note de crédit :</strong> ${new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #555;"><strong>Statut :</strong> <span style="color: #dc3545; font-weight: bold;">Annulée</span></p>
            </div>

            <!-- Info Box -->
            <div style="background: #e8f4fd; border: 1px solid #bee5eb; padding: 14px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #0c5460; margin: 0; font-size: 14px; line-height: 1.5;">
                💡 <strong>Information :</strong> Les licences provisoires associées à cette commande ont été désactivées. Si vous souhaitez effectuer une nouvelle commande, vous pouvez vous connecter à votre espace client.
              </p>
            </div>

            <p style="font-size: 14px; color: #555555; margin-top: 24px;">
              Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter en répondant directement à cet e-mail.
            </p>
    
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    
            <!-- Footer -->
            <div style="text-align: center;">
              <p style="font-size: 13px; color: #999999; margin-bottom: 4px;">Merci pour votre confiance,</p>
              <p style="font-size: 13px; color: #999999; margin: 0;">— L'équipe Ferracad</p>
              <p style="font-size: 12px; color: #cccccc; margin-top: 16px;">© ${new Date().getFullYear()} Ferracad. Tous droits réservés.</p>
            </div>
    
          </div>
        </div>
      `;
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  // Send email
  try {
    const adminSupport = process.env.ADMIN_SUPPORT || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"Ferracad Support " <${process.env.SMTP_USER}>`,
      to: email,
      // cc: (email !== adminSupport && !disableCc) ? adminSupport : undefined,
      subject,
      html,
      attachments: data.path
        ? [
          {
            filename: data.file.filename,
            path: data.path,
            contentType: "application/pdf",
          },
        ]
        : [],
    });
    console.log(`Email "${type}" sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send email to ${email}`, err);
    throw err;
  }
};

module.exports = sendEmail;
