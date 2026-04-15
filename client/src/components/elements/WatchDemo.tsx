import { Play } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "@/lang/LanguageProvider";
import VideoAutocad from "@/assets/video/demo.mp4";
import VideoZwcad from "@/assets/ferracad-docs/dalle ZWCAD.mp4";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

const HowItWorks = () => {
  const { t } = useLanguage();
  const [OpenVd, setOpenVd] = useState<any>(null);
  const typesPlug = ["Autocad", "zwcad"];
  AOS.init();

  return (
    <section className="bg-[url('./assets/bg-demovd.png')] my-12">
      {OpenVd && (
        <div className="fixed top-0 left-0 w-full h-screen flex justify-center items-center z-[100] bg-black/80 backdrop-blur-sm">
          <div
            className="text-white absolute top-10 right-10 cursor-pointer"
            onClick={() => setOpenVd(null)}
            data-aos="fade-left"
          >
            <IoClose className="h-7 w-7" />
          </div>
          <div className="bg-white p-2 w-[80%] rounded-3xl" data-aos="fade-up">
            <p className="text-sm font-semibold text-center mb-2">
              {t("video_title")}
            </p>
            <video
              className={`object-cover w-full h-[75vh] max-lg:h-full rounded-3xl`}
              height="360"
              controlsList="nodownload"
              controls
            >
              <source src={OpenVd} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
      <div
        data-aos="fade-up"
        className="flex flex-col gap-2 min-h-[350px] max-h-full w-1/2 max-sm:w-10/12 mx-auto justify-center"
      >
        <div className="flex items-center gap-3">
          {typesPlug.map((type, index) => (
            <span
              key={index}
              className="bg-white uppercase px-4 max-sm:px-2 rounded-lg text-stone-900 font-bold text-[11px] max-sm:text-[9px]"
            >
              {type}
            </span>
          ))}
        </div>
        <h3 className="font-bold text-2xl max-sm:text-lg text-stone-100">
          {t("work_title")}
        </h3>
        <p className="text-stone-100 text-sm max-sm:text-xs">
          {t("work_description")}
        </p>
        <div className="flex flex-col">
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setOpenVd(VideoAutocad)}
              className="bg-white p-3 rounded-full cursor-pointer transition-all duration-200 text-stone-800 hover:text-white hover:bg-stone-800"
            >
              <Play size={15} />
            </button>
            <p className="font-semibold uppercase text-sm max-sm:text-xs text-white">
              {t('how_it_works_autocad')}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setOpenVd(VideoZwcad)}
              className="bg-white p-3 rounded-full cursor-pointer transition-all duration-200 text-stone-800 hover:text-white hover:bg-stone-800"
            >
              <Play size={15} />
            </button>
            <p className="font-semibold uppercase text-sm max-sm:text-xs text-white">
              {t('how_it_works_zwcad')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
