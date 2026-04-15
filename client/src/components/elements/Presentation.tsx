import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";
import LogoFerracad from "@/assets/ferracad-logo.png"

const Presentation = () => {
  const { t } = useLanguage();
  AOS.init();

  return (
    <section className="py-10 w-10/12 min-2xl:w-8/12 mx-auto container flex items-center gap-8">
      <img
        src={LogoFerracad}
        alt="Ferracad"
        className="w-[256px] my-auto max-lg:w-[150px] max-sm:hidden"
        data-aos="fade-right"
      />
      <div data-aos="fade-up">
        <p className="text-stone-500 text-lg font-medium max-lg:text-sm" dangerouslySetInnerHTML={{ __html: t("presentation_desc") }} />
      </div>
    </section>
  );
};

export default Presentation;
