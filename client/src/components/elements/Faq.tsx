import { Plus, Sparkle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";
import { faqsData } from "@/data/mockData";
import Loading from "./Loading";

export const FaqItem = ({
  data,
  index,
  FaqActive,
  setFaqActive,
}: any) => {
  
  const handleFaq = (index: number) => {
    if (index === FaqActive) {
      setFaqActive(-1);
      return;
    }
    setFaqActive(index);
  };
  return (
    <div
      className="bg-stone-50 p-5 max-sm:p-3 rounded-lg transition-all duration-200"
      onClick={() => handleFaq(index)}
      data-aos="fade-up"
    >
      <div className="flex justify-between items-center cursor-pointer">
        <div className="flex items-center gap-2">
          <Sparkle className="w-[15px] h-[15px] max-lg:w-[10px] max-lg:h-[10px]" fill={"#292524"} />
          <h5 className="font-semibold text-sm max-lg:text-xs text-stone-800">{data.question}</h5>
        </div>
        <Plus
          className={`text-stone-600 transition-all duration-200 w-[15px] h-[15px] max-lg:w-[10px] max-lg:h-[10px] ${
            FaqActive === index ? "rotate-45" : "rotate-0"
          } `}
        />
      </div>
      <p
        className={`text-sm max-lg:text-xs text-stone-600 mt-2 transition-all duration-200 ${
          FaqActive === index ? "h-full" : "h-0"
        } relative`}
      >
        {FaqActive === index ? data.answer : ""}
      </p>
    </div>
  );
};

export const Faq = ({ dark = false }: any) => {
  const { t, lang } = useLanguage();
  const [FaqActive, setFaqActive] = useState(-1);
  const [faqData, setFaq] = useState<any>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const getData = async () => {
      try {
        const getFaq = await faqsData();

        setFaq(getFaq? getFaq?.filter((e: any) => !e.isDraft && e.lang === lang) : []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [loading, lang])

  AOS.init();

  if(loading) {
    return <Loading />
  }
  return (
    <section
      className={`${
        dark ? "bg-secondary p-16 rounded-xl gap-12" : "gap-6"
      } mt-10 w-10/12 min-2xl:w-8/12 m-auto container flex max-md:flex-col max-md:justify-start max-md:items-start items-center justify-between`}
    >
      <div data-aos="fade-right" className="w-[40%] max-md:w-full">
        <div className="flex mb-1">
          <h3 className="bg-primary text-[10px] font-bold px-6 rounded-full text-white">
            FAQ
          </h3>
        </div>
        <h4
          className={`font-bold text-[4rem] ${
            dark ? "text-white" : "text-stone-800"
          } leading-15 max-lg:text-[3rem] max-lg:leading-14`}
        >
          {t("faq_title")}
        </h4>
        <p
          className={`font-medium text-lg ${
            dark ? "text-white" : "text-stone-600"
          } my-5 max-md:my-2 max-lg:text-sm`}
        >
          {t("faq_description")}
        </p>
        <Link
          to="/contact#faq"
          className={`${
            dark ? "bg-stone-100 text-stone-800" : "bg-stone-700 text-white"
          } p-2 px-7 rounded-lg text-sm max-lg:text-xs font-semibold cursor-pointer inline-block text-center`}
        >
          {t("faq_see_more")}
        </Link>
      </div>
      <div data-aos="fade-up" className="w-[60%] flex flex-col gap-3 max-md:w-full">
        {faqData?.slice(0, 4).map((faq: any, index: any) => (
          <FaqItem
            data={faq}
            index={index}
            key={index}
            FaqActive={FaqActive}
            setFaqActive={setFaqActive}
            dark={true}
          />
        ))}
      </div>
    </section>
  );
};
