import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lang/LanguageProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const Login = () => {
  const { t } : any = useLanguage();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  
  useEffect(()=> {
    const getLastDeco = localStorage.getItem('lastdeco')
    if (getLastDeco) {
      const lastDecoDate = new Date(getLastDeco);
      const today = new Date();
  
      // Calculate difference in milliseconds
      const diffTime = today.getTime() - lastDecoDate.getTime();
  
      // Convert to days
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
      setTitle(diffDays < 30? t("connexion_title"): t("connexion_title_return"))
    } else {
      setTitle(t("connexion_title"))
    }
  }, [])

  const [formData, setFormData] = useState({
    email: "",
    pwd: "",
    remembre: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any)=> {
    e.preventDefault();
    if(formData.email === "" || formData.pwd === "") {
      toast.warning(t('connexion_forgetmailpwd'))
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/`,
        {
          email: formData.email,
          pwd: formData.pwd,
        },
        {
          withCredentials: true,
        }
      );
      
      if(response.status === 200) {
        if(response.data?.tokenFac) {
          navigate(`/connexion/two-factor/${response.data?.tokenFac}`, {
            state: { email: formData.email }
          });
          toast.success("Un code de vérification vous a été envoyé par e-mail. Veuillez le saisir pour continuer.");
          return;
        }
        toast.success("Connexion réussie");
        navigate("/tableau-de-board");
      } else {
        toast.warning(response.data?.error);
      }
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status other than 2xx
        toast.error(error.response.data?.error || "Erreur lors de la connexion");
      } else if (error.request) {
        // No response received
        toast.error("Aucune réponse du serveur");
      } else {
        // Something else happened
        toast.error("Erreur inconnue");
      }
    }
  }

  return (
    <section>
      <h3 className="font-medium text-3xl">{title}</h3>
      <p className="font-medium text-sm text-stone-600">{t("connexion_description")}</p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="font-semibold text-sm text-stone-800"
          >
            {t("contact_email")}
          </label>
          <input
            type="mail"
            name="email"
            id="email"
            placeholder="example@ferracad.com"
            value={formData.email}
            onChange={handleChange}
            className="border border-stone-300 p-2 px-6 text-sm rounded-lg"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label
              htmlFor="pwd"
              className="font-semibold text-sm text-stone-800"
            >
              {t("pay_01_pwd")}
            </label>
            <Link to="/connexion/recuperation-mot-de-passe" className="text-xs font-semibold text-blue-700">
              {t("connexion_forget")}
            </Link>
          </div>
          <input
            type="password"
            name="pwd"
            id="pwd"
            placeholder="*******************"
            value={formData.pwd}
            onChange={handleChange}
            className="border border-stone-300 p-2 px-6 text-sm rounded-lg"
            required
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            name="remembre"
            id="remembre"
            checked={formData.remembre}
            onChange={handleChange}
            className="w-4 h-4 accent-gray-700"
          />
          <label htmlFor="remembre" className="font-semibold text-stone-500 text-xs">
            {t("connexion_checkbox_period")}
          </label>
        </div>
        <button className="w-full p-2 font-bold text-sm text-white bg-primary transition-all duration-200 hover:bg-red-900 rounded-lg  cursor-pointer">{t("connexion_btn_conx")}</button>
        <div className="flex justify-center items-center">
          <p className="text-xs font-medium">{t('connexion_haveaccount')} <Link to="/louer/register" className="underline font-semibold transition-all duration-200 hover:text-stone-900">{t('connexion_signup')}</Link></p>
        </div>
        <Link to="/" className="flex items-center justify-center gap-1 text-xs text-stone-500 font-semibold">
          <ChevronLeft size={16} />
          {t("connexion_home_page")}
        </Link>
      </form>
    </section>
  );
};

export default Login;