import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "@/lang/LanguageProvider";
import { useState } from "react";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "./Loading";

const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault()
    try {
      if(email.trim() === "") {
        toast.warning(t("newsletter_warning"));
        return;
      }
      setLoading(true)
      const res = await apiClient.post("/newsletter", { email })
      if(res.status === 201) {
        toast.success(t("newsletter_success"));
        setEmail("")
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.log(error)
      toast.error(error.response.data.message);
    } finally {
      setLoading(false)
    }
  }

  AOS.init();

  if(loading) {
    <Loading />
  }
  return (
    <section className="bg-secondary p-8 py-10 text-center text-white mt-5 rounded-xl w-11/12 mx-auto container">
      <div data-aos="fade-up" className="flex flex-col gap-3 max-lg:gap-1 w-10/12 min-2xl:w-8/12 max-sm:w-11/12 mx-auto">
        <h3 className="font-bold text-2xl max-lg:text-lg w-1/3 max-lg:w-7/12 max-sm:w-full mx-auto">
          {t("newsletter_title")}
        </h3>
        <p className="w-9/12 max-sm:w-full mx-auto text-sm max-lg:text-xs" dangerouslySetInnerHTML={{ __html: t("newsletter_description") }} />
        <form onSubmit={handleSubmit}>
          <div className="relative p-2 px-2 max-lg:mt-3 w-8/12 max-lg:w-10/12 max-sm:w-full mx-auto bg-white rounded-lg flex max-sm:flex-col justify-between items-center">
            <input
              type="mail"
              id="email"
              name="email"
              onChange={(e)=> setEmail(e.target.value)}
              value={email}
              placeholder="example@gmail.com"
              className="text-stone-600 p-2 px-2 outline-none w-[65%] max-sm:w-full text-sm max-sm:text-xs"
              required
            />
            <button className="bg-secondary p-3 px-10 max-sm:px-6 max-sm:w-full font-bold text-xs rounded-lg transition-all duration-200 hover:bg-stone-700 cursor-pointer">
              {t("newsletter_btn")}
            </button>
          </div>
        </form>
        <p className="text-xs">
          {t("newsletter_ps")}
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
