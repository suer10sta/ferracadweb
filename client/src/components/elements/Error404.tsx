import LogoFerracad from "@/assets/ferracad-logo.png";
import { useLanguage } from "@/lang/LanguageProvider";
import { Link } from "react-router-dom";

const Error404 = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      {/* Logo */}
      <img
        src={LogoFerracad}
        alt="Ferracad Logo"
        className="w-32 mb-8 animate-fade-in"
      />

      {/* 404 text */}
      <h1 className="text-6xl font-bold text-red-700 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {t('error_page_title')}
      </h2>
      <p className="text-gray-600 max-w-md mb-6">
        {t('error_page_description')}
      </p>

      {/* Back to home button */}
      <Link
        to="/"
        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-red-900 transition-all duration-200"
      >
        {t('error_page_backHome')}
      </Link>
    </div>
  );
};

export default Error404;