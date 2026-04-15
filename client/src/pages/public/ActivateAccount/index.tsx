import { useLanguage } from "@/lang/LanguageProvider";
import apiClient from "@/services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ActiveAccount() {
  const { t } = useLanguage();
  const location = useLocation();
  const email = location?.state?.email;
  const navigate = useNavigate();

  const handleResend = async ()=> {
    try {
      const res = await apiClient.post("/auth/resend-activation-compte", { email })
      if(res.status === 200) {
        toast.success(t("message_send_success"))
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      toast.error(error.response.data.message)
    }
  }

  if(!email) {
    navigate("/")
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center text-gray-800 px-6">
      <div className="max-w-md w-full p-8 text-center">
        {/* Mail Icon */}
        <div className="mb-4 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-primary mb-2">
          {t('active_account_title')}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {t('active_account_sub')}
        </p>

        <p className="text-gray-900 font-semibold mb-6">
          {email ? email : "your registered email address"}
        </p>

        <p className="text-gray-500 mb-8">
          {t('active_account_description')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={handleResend}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold"
          >
            {t('active_account_resend')}
          </button>
          <Link
            to="/connexion"
            className="border border-primary text-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition text-sm font-semibold"
          >
            {t('active_account_login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
