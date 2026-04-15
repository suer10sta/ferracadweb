import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";

const CallToAction = ({ type = 0 }: any) => {
  const { t } = useLanguage();
  AOS.init();
  return (
    <>
      {type === 0 ? (
        <section className="py-5 flex justify-center items-center gap-4">
          <h4 className="font-bold text-xl text-stone-800">
            {t("call_title")}
          </h4>
          <button className="bg-primary p-2 px-5 flex justify-center text-sm items-center gap-4 font-semibold text-white rounded-xl transition-all duration-200 hover:bg-red-800">
            {t("call_btn")}
            <ChevronRight size={14} />
          </button>
        </section>
      ) : type === 1 ? (
        <section className="p-12 grid grid-cols-2 max-lg:grid-cols-1 items-center gap-4 bg-primary w-10/12 min-2xl:w-8/12 mx-auto container rounded-2xl mb-8">
          <h4 data-aos="fade-right" className="font-bold text-4xl max-sm:text-2xl text-stone-100">
            {t("call_title1")}
          </h4>
          <div data-aos="fade-up" className="flex flex-col gap-3">
            <p className="text-sm max-sm:text-xs text-white" dangerouslySetInnerHTML={{ __html: t("call_description") }} />

            <Link to="/louer/register" className="flex justify-end">
              <button className="bg-white p-2 px-5 flex justify-center text-xs items-center gap-4 font-semibold text-stone-800 rounded-xl transition-all duration-200 cursor-pointer hover:bg-stone-200">
                {t("call_btn2")}
                <ChevronRight size={14} />
              </button>
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
};

export default CallToAction;
