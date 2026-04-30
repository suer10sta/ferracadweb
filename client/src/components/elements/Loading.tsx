import LogoFerracad from "@/assets/ferracad-logo.png"
import { useLanguage } from "@/lang/LanguageProvider";

const Loading = () => {
  const { t } = useLanguage()
  return (
    <div 
      className="fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center gap-5 bg-white z-[200]"
      role="status"
      aria-label="Chargement en cours"
    >
      {/* Logo */}
      <img 
        src={LogoFerracad}
        alt="Logo Ferracad"
        className="w-48 animate-fade-in"
      />

      {/* Spinner */}
      <div className="loader ease-linear rounded-full border-6 border-t-6 border-gray-200 h-10 w-10"></div>

      {/* Optional Loading Text */}
      <p className="text-sm text-gray-500">{t("global_loading_text")}</p>
    </div>
  );
};

export default Loading;
