import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lang/LanguageProvider";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "@/components/elements/Loading";

const ForgetPwd = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { t } : any = useLanguage();
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    if(!email) {
      toast.warning("")
      return;
    }
    setLoading(true)
    try {
      const res = await apiClient.post("/auth/recover-pwd", { email })
      if(res.status === 200) {
        toast.success(res.data.message)
        setEmail("")
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  if(loading) {
    return <Loading />;
  }
  return (
    <section>
      <h3 className="font-medium text-3xl">{t("forget_title")}</h3>
      <p className="font-medium text-sm text-stone-600">{t("forget_description")}</p>
      <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmit}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@ferracad.com"
            className="border border-stone-300 p-2 px-6 text-sm rounded-lg"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 font-bold text-sm text-white bg-primary transition-all duration-200 hover:bg-red-900 rounded-lg">{t("forget_btn")}</button>
        <Link to="/connexion" className="flex items-center justify-center gap-1 text-xs text-stone-500 font-semibold">
          <ChevronLeft size={16} />
          {t("forget_returnlink")}
        </Link>
      </form>
    </section>
  );
};

export default ForgetPwd;
