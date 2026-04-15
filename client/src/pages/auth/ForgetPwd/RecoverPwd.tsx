import Loading from "@/components/elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import apiClient from "@/services/api";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const RecoverPwd = () => {
  const { t } = useLanguage()
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if(!password || !confirmPassword) {
        toast.warning(t('recover_toastEmptyFields'));
        return;
    }

    if (password !== confirmPassword) {
      toast.warning(t('recover_toastMismatch'));
      return;
    }

    if(password.length < 8) {
        toast.warning(t('recover_toastShortPassword'))
        return;
    }
    try {
        const res = await apiClient.put("/auth/modify-pwd", { token, password, confirmPassword })
        if(res.status === 200) {
            toast.success(res.data.message)
            navigate("/connexion")
        } else {
            toast.warning(res.data.message)
        }
    } catch (error: any) {
        toast.error(error.response.data.message)
    } finally {
        setLoading(false)
    }
  };

  if(!token) {
    navigate("");
    return;
  }

  if(loading) {
    return <Loading />;
  }

  return (
    <section>
      <h3 className="font-semibold text-3xl">
        {t('recover_title')}
      </h3>
      <p className="font-medium text-sm text-stone-600">
      {t('recover_description')}
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="font-semibold text-sm text-stone-800"
          >
            {t("recover_labelNewPassword")}
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder={t("recover_placeholderNewPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-stone-300 p-2 px-4 text-sm rounded-lg"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirmPassword"
            className="font-semibold text-sm text-stone-800"
          >
            {t("recover_labelConfirmPassword")}
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder={t("recover_placeholderConfirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-stone-300 p-2 px-4 text-sm rounded-lg"
            required
          />
        </div>
        <p className="text-xs text-stone-800 font-semibold">{t("recover_passwordRules")}</p>
        <button
          type="submit"
          className="w-full p-2 font-bold text-sm text-white bg-primary transition-all duration-200 hover:bg-red-900 rounded-lg"
        >
          {t("recover_buttonSubmit")}
        </button>
      </form>
    </section>
  );
};

export default RecoverPwd;