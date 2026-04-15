import { useEffect, useState } from "react";
import { FaqItem } from "./Faq";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";
import { faqsData } from "@/data/mockData";

const FaqDetailed = () => {
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
  return (
    <section className="w-10/12 min-2xl:w-8/12 max-lg:w-11/12 mx-auto container pt-9 px-17 max-md:px-9 bg-before-red-faq">
      <div className="grid grid-cols-2 max-md:grid-cols-1 max-md:items-start max-md:gap-2 items-end">
        <h3 data-aos="fade-right" className="font-bold text-6xl max-md:text-3xl text-white">{t("faq_title")}</h3>
        <p data-aos="fade-up" className="text-white text-lg max-md:text-sm">
          {t("faq_description")}
        </p>
      </div>
      <div className="bg-white p-12 max-md:p-6 rounded-lg mt-12 max-md:mt-7 shadow-2xl flex items-center justify-center">
        <div className="flex flex-col gap-3 w-full">
          {(faqData || []).map((faq: any, index: any) => (
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
      </div>
    </section>
  );
};

export default FaqDetailed;
