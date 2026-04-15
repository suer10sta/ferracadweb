import { Link } from 'react-router-dom';
import { MdOutlineKeyboardCommandKey } from "react-icons/md";
import { IoDiamondOutline } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";
import { IoRocketOutline } from "react-icons/io5";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useLanguage } from "@/lang/LanguageProvider";
import DownloadButton from './DownloadButton';

const WhyChooseUs = () => {
    const { t } = useLanguage();
    
    const features = [
        {
            icon: MdOutlineKeyboardCommandKey,
            title: t("whyus_feature_title1"),
            description: t("whyus_feature_description1"),
        },
        {
            icon: IoDiamondOutline,
            title: t("whyus_feature_title2"),
            description: t("whyus_feature_description2"),
        },
        {
            icon: IoMdRefresh,
            title: t("whyus_feature_title3"),
            description: t("whyus_feature_description3"),
        },
        {
            icon: IoRocketOutline,
            title: t("whyus_feature_title4"),
            description: t("whyus_feature_description4"),
        },
    ];

    AOS.init();

  return (
    <section className='w-10/12 min-2xl:w-8/12 mx-auto container mb-12 grid grid-cols-2 max-lg:grid-cols-1 items-center gap-5'>
        <div data-aos="fade-right" className='flex flex-col gap-7'>
            <div className='flex flex-col gap-2'>
                <h3 className='text-3xl text-stone-900 font-bold max-sm:text-lg'>{t("whyus_title")}</h3>
                <p className='text-sm max-sm:text-xs text-stone-400'>{t("whyus_description")}</p>
            </div>
            <div className='flex flex-col gap-3'>
                <p className='font-medium text-sm text-stone-400 max-sm:text-xs'>{t("whyus_question")}<Link to="/contact" className='font-bold underline'>{t("whyus_contact")}</Link></p>
                <div>
                    <DownloadButton context={t('hero_download_free')} className="flex items-center gap-2 rounded-lg p-3 !px-6 bg-primary transition-all duration-200 hover:bg-red-800 cursor-pointer font-semibold text-xs text-white" />
                </div>
            </div>
        </div>
        <div>
            <div className='grid grid-cols-2 max-sm:grid-cols-1 gap-5'>
                {
                    features.map((feature, index)=> {
                        const IconComp = feature.icon;

                        return (
                            <div 
                                key={index}
                                className={`min-h-[231px] max-sm:min-h-[220px] ${index === 0 ? "bg-primary text-white" : "bg-gray-100 text-black"} p-8 px-5 rounded-2xl flex flex-col justify-between`}
                                data-aos="fade-up"
                            >
                                <div className='flex'>
                                    <div 
                                        className={`
                                            p-3 rounded-full ${index === 0 ? "bg-white/48" : "bg-primary text-white"}
                                        `}
                                    >
                                        <IconComp />
                                    </div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <h4 className='font-bold text-sm'>{feature.title}</h4>
                                    <p className={`text-xs ${index === 0 ? "text-white/60" : "text-black/60"}`}>{feature.description}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    </section>
  )
}

export default WhyChooseUs