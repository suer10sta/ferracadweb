import { HiExternalLink } from "react-icons/hi";
import { Link } from 'react-router-dom'
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";
import InsertionRepere from "@/assets/video/insertion_dun_repere.mp4"
import repartition from "@/assets/video/repartition.mp4"
import insertionBulle from "@/assets/video/insere une bull de repere.mp4"

const Features = ({ activeLink = true }: any) => {
    const { t } = useLanguage();

    const features = [
        {
            title: t("funtion_title1"),
            description: t("funtion_description1"),
            type: "video",
            bg: InsertionRepere
        },
        {
            title: t("features_list_title6"),
            description: t("features_list_description6"),
            type: "video",
            bg: repartition
        },
        {
            title: t("features_list_title7"),
            description: t("features_list_description7"),
            type: "video",
            bg: insertionBulle
        },
    ];

    AOS.init();
  return (
    <section className="mb-10 w-10/12 min-2xl:w-8/12 mx-auto container flex flex-col gap-3">
        <div className={`flex max-sm:flex-col max-sm:items-start max-sm:gap-3 items-center ${activeLink ? "justify-between" : "justify-center"}`}>
            <div>
                {
                    !activeLink && (
                        <div className="flex justify-center items-center mb-2">
                            <h2 className="font-bold text-white bg-secondary p-1 rounded-full px-4 text-[11px]">{t("Fonctionnalites")}</h2>
                        </div>
                    )
                }
                <div data-aos="fade-right">
                    <h3 className={`font-bold text-stone-800 text-2xl max-md:text-lg ${!activeLink && "text-center"}`}>{t("funtion_title")}</h3>
                    <p className={`w-9/12 text-sm max-md:text-xs font-medium text-black/40 ${!activeLink && "text-center mx-auto mb-4"}`}>{t("funtion_description")}</p>
                </div>
            </div>
            {
                activeLink && (
                    <Link 
                        data-aos="fade-up" 
                        to={"/fonctionnalites"} 
                        className="flex items-center gap-2 font-bold text-sm max-md:text-xs"
                    >
                        {t("funtion_more")} <HiExternalLink size={15} />
                    </Link>
                )
            }
        </div>
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
            {
                features.map((feature, index)=> (
                    <div 
                        key={index}
                        className={`${index === 0 ? "col-span-2 max-sm:col-span-1" : ""}`}
                    >
                        {
                            index === 0 ? 
                                (
                                    <div data-aos="fade-up" className="grid grid-cols-2 max-sm:grid-cols-1 gap-6 max-lg:gap-2 items-center bg-gray-100 p-6 rounded-3xl">
                                        <div className="flex flex-col gap-3 max-lg:gap-2 p-5">
                                            <h4 className="uppercase font-bold text-xl max-lg:text-sm">{feature.title}</h4>
                                            <p className="text-sm font-medium text-black/40 max-lg:text-xs">{feature.description}</p>
                                        </div>
                                        {
                                            feature.type === "video" ? (
                                                <video
                                                  className={`object-cover w-full h-full rounded-2xl sticky`}
                                                  height="360"
                                                  controlsList="nodownload"
                                                  autoPlay
                                                  muted
                                                  loop
                                                >
                                                  <source src={feature.bg} type="video/mp4" />
                                                  Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img 
                                                    src={feature.bg}
                                                    alt="features"
                                                    className=" w-full h-full rounded-2xl object-cover"
                                                />
                                            )
                                        }
                                    </div>
                                )
                            : 
                                (
                                    <div data-aos={index % 2 === 0 ? "fade-up": "fade-right"} className="flex flex-col gap-6 max-lg:gap-2 items-center bg-gray-100 p-6 rounded-3xl h-full">
                                        <div className="flex flex-col gap-3 max-lg:gap-2 p-5">
                                            <h4 className="uppercase font-bold text-xl max-lg:text-sm">{feature.title}</h4>
                                            <p className="text-sm font-medium text-black/40 max-lg:text-xs">{feature.description}</p>
                                        </div>
                                        {
                                            feature.type === "video" ? (
                                                <video
                                                  className={`object-cover w-full h-full rounded-2xl sticky`}
                                                  height="360"
                                                  controlsList="nodownload"
                                                  autoPlay
                                                  muted
                                                  loop
                                                >
                                                  <source src={feature.bg} type="video/mp4" />
                                                  Your browser does not support the video tag.
                                                </video>
                                            ) : (
                                                <img 
                                                    src={feature.bg}
                                                    alt="features"
                                                    className=" w-full h-full rounded-2xl object-cover"
                                                />
                                            )
                                        }
                                    </div>
                                )
                        }
                    </div>
                ))
            }
        </div>
    </section>
  )
}

export default Features