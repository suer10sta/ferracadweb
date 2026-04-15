import { useState } from "react";
import { useLanguage } from "@/lang/LanguageProvider";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "./Loading";
import isSpamOrAdsText from "@/utils/blackListWords";

const ContactForm = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nom: "",
    mail: "",
    sujet: "",
    message: "",
    newsletter: true,
  });

  const [loading, setLoading] = useState(false)

  const handleChange = (e: any) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
  
    if (!formData.nom || !formData.mail || !formData.sujet || !formData.message) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const contextCheck = formData.sujet + " " + formData.message
    const checkContext = await isSpamOrAdsText(contextCheck)

    if (checkContext) {
      toast.warning(
        <div className="flex flex-col">
          <span className="font-semibold">Contenu détecté comme spam</span>
          <span className="text-sm">Veuillez reformuler votre message sans termes publicitaires.</span>
        </div>,
        {
          duration: 5000,
        }
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/contact", formData);
      if (res.status === 201) {
        toast.success("Votre message a été envoyé avec succès");
      } else {
        toast.warning(res.data.message || "Une erreur est survenue, veuillez réessayer.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du message");
    } finally {
      setFormData({
        nom: "",
        mail: "",
        sujet: "",
        message: "",
        newsletter: true,
      })
      setLoading(false);
    }
  };

  if(loading) {
    return <Loading />;
  }

  return (
    <div className="w-10/12 min-2xl:w-8/12 mx-auto">
      <h3 className="font-bold text-3xl text-stone-800">{t("contact_title")}</h3>
      <p className="text-stone-500 text-sm mt-1" dangerouslySetInnerHTML={{ __html: t("contact_description") }} />
      <span className="text-[10px] text-stone-600">{t("contact_require")}</span>
      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <div className="relative text-[#B2BCCA] w-full mt-7">
          <label
            htmlFor={t("contact_name")}
            className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
          >
            {t("contact_name")} *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            placeholder="Jhon Deo"
            className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            required
            value={formData.nom}
            onChange={handleChange}
          />
        </div>
        <div className="relative text-[#B2BCCA] w-full">
          <label
            htmlFor={t("contact_email")}
            className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
          >
            {t("contact_email")} *
          </label>
          <input
            type="email"
            id="mail"
            name="mail"
            placeholder="example@gmail.com"
            className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            required
            value={formData.mail}
            onChange={handleChange}
          />
        </div>
        <div className="relative text-[#B2BCCA] w-full">
          <label
            htmlFor={t("contact_sujet")}
            className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
          >
            {t("contact_sujet")} *
          </label>
          <input
            type="text"
            id="sujet"
            name="sujet"
            placeholder={t("contact_sujet_placeholder")}
            className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            required
            value={formData.sujet}
            onChange={handleChange}
          />
        </div>
        <div className="relative text-[#B2BCCA] w-full">
          <label
            htmlFor={t("contact_message")}
            className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
          >
            {t("contact_message")} *
          </label>
          <textarea
            id="message"
            name="message"
            placeholder={t("contact_message_placeholder")}
            className="border border-[#B2BCCA] w-full h-60 p-3 px-6 rounded-lg text-sm text-stone-800"
            required
            maxLength={500}
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <p className="text-[10px] mt-1 font-bold">
            {formData.message.length}/500
          </p>
        </div>
        <div className="flex items-start gap-2 mt-[-19px]">
          <input
            type="checkbox"
            name="newsletter"
            id="newsletter"
            className="w-4 h-4 accent-blue-700"
            checked={formData.newsletter}
            onChange={handleChange}
          />
          <p className="font-semibold text-stone-500 text-xs">
            {t("contact_condition")}
          </p>
        </div>
        <div>
          <button
            type="submit"
            className="bg-secondary rounded-lg p-3 w-full text-white font-semibold text-sm transition-all duration-200 hover:bg-stone-800 cursor-pointer"
          >
            {t("contact_send")}
          </button>
          <p className="text-center text-stone-700 text-xs w-2/3 mx-auto font-medium mt-2">
            {t("contact_response")}
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
