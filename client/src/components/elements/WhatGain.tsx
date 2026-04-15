import { RiBuilding2Line } from "react-icons/ri";
import { FaRegClock, FaChartSimple  } from "react-icons/fa6";
import { BsDatabase } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { LuBrain } from "react-icons/lu";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";

const WhatGain = ({ className = "", textColor = "text-white", activebg = "bg-stone-800" }: any) => {
  const { t } = useLanguage();

  const features = [
    {
      icon: RiBuilding2Line,
      title: t("feature_title1"),
      description: t("feature_description1"),
    },
    {
      icon: FaRegClock,
      title: t("feature_title2"),
      description: t("feature_description2"),
    },
    {
      icon: FaChartSimple,
      title: t("feature_title3"),
      description: t("feature_description3"),
    },
    {
      icon: BsDatabase,
      title: t("feature_title4"),
      description: t("feature_description4"),
    },
    {
      icon: MdOutlineSettings,
      title: t("feature_title5"),
      description: t("feature_description5"),
    },
    {
      icon: LuBrain,
      title: t("feature_title6"),
      description: t("feature_description6"),
    },
  ]

  AOS.init();

  return (
    <section className={``}>
      <div className={`${className} ${activebg} p-16 max-sm:p-10 py-10 rounded-2xl w-10/12 min-2xl:w-8/12 mx-auto container duration-200 transition-all hover:shadow-lg`}>
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-8 gap-6 items-center">
          {
            features.map((feature, index)=> {
              const IconComp = feature.icon;

              return (
                <div 
                  key={index} 
                  className="flex items-start gap-6"
                  data-aos={index % 2 == 0 ? "fade-up" : "fade-down"}
                >
                  <IconComp className={`text-[60px] max-lg:text-[50px] ${textColor}`} />
                  <div className="flex flex-col gap-1">
                    <h3 className={`font-bold leading-[1.2] ${textColor} max-lg:text-sm`}>{feature.title}</h3>
                    <p className={`text-sm max-lg:text-xs ${textColor === "text-white" ? "text-white/70": "text-black/70"}`}>{feature.description}</p>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    </section>
  );
};

export default WhatGain;
