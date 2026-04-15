import apiClient from "@/services/api";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lang/LanguageProvider";
import Loading from "./Loading";
import { useSearchParams } from "react-router-dom";
import Turnstile from "react-turnstile";

const FormAuthCode = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Activate License
  const [otp, setOtp] = useState("");

  const code = searchParams.get("code");
  const name = searchParams.get("name");
  const invi = searchParams.get("invitation");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    computer_code: code || "",
    invitationId: invi || "",
    computer_name: name || "",
    platform: "",
  });
  const [loading, setLoading] = useState(false);
  const [codeAuth, setCodeAuth] = useState("");
  const [popupOs, setPopupOs] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      toast.warning("Veuillez entrer votre adresse e-mail.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/send-otp", { email: formData.email });
      toast.success("Code de vérification envoyé à votre adresse e-mail.");
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.warning("Veuillez entrer le code reçu.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-otp", { 
        email: formData.email, 
        code: otp 
      });
      if (res.data.success) {
        toast.success("E-mail vérifié avec succès !");
        
        // Pré-remplissage avec les données existantes si disponibles
        if (res.data.userData) {
          setFormData(prev => ({
            ...prev,
            name: res.data.userData.name || prev.name,
            platform: res.data.userData.platform || prev.platform
          }));
        }
        
        setStep(3);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    try {
      e.preventDefault();
      
      if (step === 1) {
        await handleSendOTP();
        return;
      }
      
      if (step === 2) {
        await handleVerifyOTP();
        return;
      }

      if (
        !formData.name.trim() ||
        !formData.computer_code.trim() ||
        !formData.computer_name.trim() ||
        !formData.platform.trim()
      ) {
        toast.warning(t("free_trial_form_incomplete"));
        return;
      }

      if (!token) {
        toast.warning(t("free_trial_captcha_error"));
        return;
      }

      setLoading(true);
      const res = await apiClient.post("/registration/free-trial", {
        ...formData,
        token,
      });

      if (res.status === 200) {
        toast.success("🎉 Licence activée ! Vérifiez vos emails pour vos accès complets.");
        setPopupOs(true);
        setCodeAuth(res.data.code);
        setFormData({
          name: "",
          email: "",
          computer_code: "",
          invitationId: "",
          computer_name: "",
          platform: "",
        });
        setStep(1); // Reset to start
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeAuth);
      toast.success(t("dashboardClient_orders_code_copied"));
    } catch (err) {
      toast.error(t("dashboardClient_orders_error_retry"));
    }
  };

  const platforms = [
    { label: "-", value: "" },
    { label: "AutoCAD", value: "autocad" },
    { label: "ZWCAD", value: "zwcad" },
    { label: t("free_trial_both"), value: "both" }
  ];

  if (loading) return <Loading />;

  return (
    <>
      <Dialog open={popupOs} onOpenChange={setPopupOs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("free_trial_title")}</DialogTitle>
            <DialogDescription>{t("free_trial_description")}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="text-lg font-mono bg-gray-100 px-4 py-2 rounded-md">
              {codeAuth}
            </div>
            <Button onClick={handleCopy}>{t("free_trial_copy")}</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <form className="p-4 flex flex-col gap-8 w-full bg-white rounded-2xl shadow-sm border border-stone-100" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-2">
           <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-stone-200'}`}>1</div>
           <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-stone-200'}`}></div>
           <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-stone-200'}`}>2</div>
           <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-stone-200'}`}></div>
           <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-stone-200'}`}>3</div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
             <h3 className="font-bold text-lg text-stone-800">Étape 1 : Vérification e-mail</h3>
             <p className="text-sm text-stone-500">Pour commencer, veuillez entrer votre adresse e-mail professionnelle.</p>
             <div className="relative pt-4">
                <label className="absolute top-1 left-2 px-2 bg-white text-xs font-bold text-stone-400">E-MAIL PROFESSIONNEL</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="nom@entreprise.com"
                  className="w-full border-2 border-stone-100 focus:border-primary outline-none p-4 rounded-xl text-sm"
                />
             </div>
             <button type="submit" className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:brightness-90 transition-all">
                Recevoir mon code par e-mail
             </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
             <h3 className="font-bold text-lg text-stone-800">Étape 2 : Entrez le code reçu</h3>
             <p className="text-sm text-stone-500">Un code de vérification à 6 chiffres a été envoyé à <strong>{formData.email}</strong>.</p>
             <div className="relative pt-4">
                <label className="absolute top-1 left-2 px-2 bg-white text-xs font-bold text-stone-400">CODE DE VÉRIFICATION</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000 000"
                  className="w-full border-2 border-stone-100 focus:border-primary outline-none p-4 rounded-xl text-sm tracking-[0.5em] text-center font-bold text-lg"
                />
             </div>
             <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-stone-100 text-stone-500 p-4 rounded-xl font-bold hover:bg-stone-200 transition-all text-sm">
                   Retour
                </button>
                <button type="submit" className="flex-[2] bg-primary text-white p-4 rounded-xl font-bold hover:brightness-90 transition-all">
                   Vérifier le code
                </button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-stone-800">Étape 3 : Détails de la licence</h3>
            <p className="text-sm text-stone-500">Dernière étape ! Remplissez ces informations pour générer votre code d'autorisation.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative pt-2">
                  <label className="absolute top-[-1px] left-2 px-2 bg-white text-[10px] font-bold text-stone-400">NOM COMPLET</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-stone-200 p-3 rounded-lg text-sm" />
              </div>
              <div className="relative pt-2">
                  <label className="absolute top-[-1px] left-2 px-2 bg-white text-[10px] font-bold text-stone-400">PLATEFORME</label>
                  <select name="platform" value={formData.platform} onChange={handleChange} className="w-full border border-stone-200 p-3 rounded-lg text-sm bg-white">
                      {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
              </div>
              <div className="relative pt-2">
                  <label className="absolute top-[-1px] left-2 px-2 bg-white text-[10px] font-bold text-stone-400">CODE ORDINATEUR</label>
                  <input type="text" name="computer_code" value={formData.computer_code} onChange={handleChange} className="w-full border border-stone-200 p-3 rounded-lg text-sm font-mono" />
              </div>
              <div className="relative pt-2">
                  <label className="absolute top-[-1px] left-2 px-2 bg-white text-[10px] font-bold text-stone-400">NOM DE L'ORDINATEUR</label>
                  <input type="text" name="computer_name" value={formData.computer_name} onChange={handleChange} className="w-full border border-stone-200 p-3 rounded-lg text-sm" />
              </div>
            </div>

            <div className="relative pt-2">
                <label className="absolute top-[-1px] left-2 px-2 bg-white text-[10px] font-bold text-stone-400">ID INVITATION (OPTIONNEL)</label>
                <input type="text" name="invitationId" value={formData.invitationId} onChange={handleChange} placeholder="------------" className="w-full border border-stone-200 p-3 rounded-lg text-sm" />
            </div>

            <div className="flex justify-center py-2">
               <Turnstile sitekey="0x4AAAAAAB8dcYGEpIIGFrl5" onVerify={setToken} />
            </div>

            <button type="submit" className="w-full bg-primary text-white p-4 rounded-xl font-bold hover:brightness-90 transition-all">
                Activer mon essai de 30 jours
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default FormAuthCode;
