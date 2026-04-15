import { CallToAction, HeroSection   } from "@/components";
import {
  FaAlignJustify,
  FaAngleDown,
  FaAngleUp,
  FaCircle,
  FaCommentDots,
  FaFolderOpen,
  FaLocationArrow,
  FaPlay,
  FaProjectDiagram,
  FaRulerCombined,
  FaSquare,
  FaColumns,
  FaFileExport,
  FaSearch,
  FaRuler,
} from "react-icons/fa";
import { GiIBeam } from "react-icons/gi";
import { FiTarget } from "react-icons/fi";
import { GoPencil } from "react-icons/go";
import { IoCreateOutline } from "react-icons/io5";
import { PiWallFill } from "react-icons/pi";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "@/lang/LanguageProvider";
import { useState } from "react";
import { RiFileExcel2Fill } from "react-icons/ri";
import VideoAutocad from "@/assets/video/demo.mp4";
import StartFerracad from "@/assets/ferracad-docs/demarage.mp4";
import Poutre from "@/assets/ferracad-docs/POUTRE.mp4";
import Dalle from "@/assets/ferracad-docs/DALLE.mp4";
import Colonne from "@/assets/ferracad-docs/COLONNE.mp4";
import Borderaux from "@/assets/ferracad-docs/BORDERAUX.mp4";
import armatuer from "@/assets/ferracad-docs/recherche une armature.mp4";
import BarreVariable from "@/assets/ferracad-docs/barre variable.mp4";

const Features = () => {
  const { t } = useLanguage();
  const [maxDispaly, setMaxDispaly] = useState(4);
  const [activeKey, setActiveKey] = useState(t("features_list_title1"));
  const [currentVideo, setCurrentVideo] = useState(1);

  const allFeatures = [
    {
      icon: GoPencil,
      title: t("features_list_title1"),
      description: t("features_list_description1"),
      background: "",
    },
    {
      icon: PiWallFill,
      title: t("features_list_title2"),
      description: t("features_list_description2"),
      background: "",
    },
    {
      icon: FaCircle,
      title: t("features_list_title3"),
      description: t("features_list_description3"),
      background: "",
    },
    {
      icon: FiTarget,
      title: t("features_list_title4"),
      description: t("features_list_description4"),
      background: "",
    },
    {
      icon: IoCreateOutline,
      title: t("features_list_title5"),
      description: t("features_list_description5"),
      background: "",
    },
    {
      icon: FaRulerCombined,
      title: t("features_list_title6"),
      description: t("features_list_description6"),
      background: "",
    },
    {
      icon: FaCommentDots,
      title: t("features_list_title7"),
      description: t("features_list_description7"),
      background: "",
    },
    {
      icon: FaLocationArrow,
      title: t("features_list_title8"),
      description: t("features_list_description8"),
      background: "",
    },
    {
      icon: FaPlay,
      title: t("features_list_title9"),
      description: t("features_list_description9"),
      background: "",
    },
    {
      icon: FaAlignJustify,
      title: t("features_list_title10"),
      description: t("features_list_description10"),
      background: "",
    },
    {
      icon: RiFileExcel2Fill,
      title: t("features_list_title11"),
      description: t("features_list_description11"),
      background: "",
    },
    {
      icon: FaFolderOpen,
      title: t("features_list_title12"),
      description: t("features_list_description12"),
      background: "",
    },
    {
      icon: FaProjectDiagram,
      title: t("features_list_title13"),
      description: t("features_list_description13"),
      background: "",
    },
  ];

  const tutorial = [
    {
      id: 1,
      titre: t("formation_cours_1_title"),
      description: t("formation_cours_1_description"),
      path: StartFerracad,
      icon: FaPlay,
    },
    {
      id: 2,
      titre: t("formation_cours_2_title"),
      description: t("formation_cours_2_description"),
      path: Poutre,
      icon: GiIBeam,
    },
    {
      id: 3,
      titre: t("formation_cours_3_title"),
      description: t("formation_cours_3_description"),
      path: Dalle,
      icon: FaSquare,
    },
    {
      id: 4,
      titre: t("formation_cours_4_title"),
      description: t("formation_cours_4_description"),
      path: Colonne,
      icon: FaColumns,
    },
    {
      id: 5,
      titre: t("formation_cours_5_title"),
      description: t("formation_cours_5_description"),
      path: Borderaux,
      icon: FaFileExport,
    },
    {
      id: 6,
      titre: t("formation_cours_6_title"),
      description: t("formation_cours_6_description"),
      path: armatuer,
      icon: FaSearch,
    },
    {
      id: 7,
      titre: t("formation_cours_7_title"),
      description: t("formation_cours_7_description"),
      path: BarreVariable,
      icon: FaRuler,
    },
  ];

  const currentTutorial = tutorial.find((item) => item.id === currentVideo);
  AOS.init();

  return (
    <main>
      <HeroSection
        title={t("features_title")}
        description={t("features_description")}
      />
      {/*<WhatGain
        className="mt-4"
        activebg="bg-white"
        textColor="text-stone-900"
      />*/}
      <div className="w-10/12 mt-5 min-2xl:w-8/12 mb-7 mx-auto container bg-secondary p-6 py-12 rounded-2xl grid grid-cols-2 max-lg:grid-cols-1 items-center gap-2">
        <div className="flex flex-col items-center max-lg:items-start gap-5 p-3">
          {allFeatures.slice(0, maxDispaly).map((feature, index) => (
            <div
              key={index}
              data-aos="fade-right"
              className={`flex items-center max-sm:items-start gap-5 cursor-pointer`}
              onClick={() => setActiveKey(feature.title)}
            >
              <div
                className={`p-7 max-sm:p-4 h-full rounded-lg ${
                  feature.title === activeKey
                    ? "bg-black/60 text-white"
                    : "bg-white"
                }`}
              >
                <feature.icon className="text-[24px] max-md:text-[15px]" />
              </div>
              <div className={`flex flex-col gap-1 text-white`}>
                <h4 className="font-bold text-sm uppercase">{feature.title}</h4>
                <p className="text-xs text-white/50">{feature.description}</p>
              </div>
            </div>
          ))}
          {maxDispaly < allFeatures.length ? (
            <button
              data-aos="fade-right"
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => setMaxDispaly(allFeatures.length)}
            >
              <p className="font-bold text-sm text-white">
                {t("features_more")}
              </p>
              <div>
                <FaAngleDown className="text-white" />
              </div>
            </button>
          ) : (
            <button
              data-aos="fade-right"
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => setMaxDispaly(4)}
            >
              <p className="font-bold text-sm text-white">
                {t("features_moin")}
              </p>
              <div>
                <FaAngleUp className="text-white" />
              </div>
            </button>
          )}
        </div>
        <div className="h-full px-5 max-sm:hidden" data-aos="fade-up">
          {/*<img
            src="https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg"
            alt="feature"
            className={`object-cover w-full ${maxDispaly < allFeatures.length ? "h-full" : "h-[95vh]"} rounded-3xl sticky top-5`}
          />*/}
          <video
            className={`object-cover w-full ${
              maxDispaly < allFeatures.length
                ? "h-full"
                : "h-[75vh] max-lg:h-full"
            } rounded-3xl sticky top-[12%]`}
            height="360"
            controlsList="nodownload"
            autoPlay
            muted
            loop
          >
            <source src={VideoAutocad} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <div className="w-10/12 container mx-auto min-2xl:w-8/12 mb-7">
        {/* Titre et sous-titre */}
        <div className="text-center mb-5">
          <h1 className="font-bold text-2xl text-stone-900 text-center">
            {t("formation_titre")}
          </h1>
          <p className="font-semibold text-sm w-1/2 max-sm:w-10/12 mx-auto text-black/60 text-center">
            {t("formation_description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                {/* Video Header */}
                <div className="bg-gradient-to-r bg-primary p-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      {
                        currentTutorial?.icon && <currentTutorial.icon color="white" />
                      }
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {currentTutorial?.titre || "Sélectionnez un tutoriel"}
                    </h2>
                  </div>
                </div>

                {/* Video Player */}
                <div className="bg-black">
                  <div className="video-container">
                    <video
                      key={currentVideo}
                      controls
                      className="w-full h-[516px] max-md:h-[300px]"
                      poster="/videos/poster.jpg"
                    >
                      <source src={currentTutorial?.path} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  </div>
                </div>
              </div>

              {/* Video Description */}
              <div className="p-6 bg-stone-100 border border-stone-200 rounded-2xl">
                <div className="flex items-center space-x-2 mb-1">
                  <i className="fas fa-info-circle text-red-500"></i>
                  <h3 className="font-semibold text-gray-900">
                    {t("tutoriels_description")}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentTutorial?.description ||
                    "Sélectionnez un tutoriel dans la liste pour voir sa description."}
                </p>
              </div>
            </div>
          </div>

          {/* Tutorials List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className=" font-semibold text-gray-900">
                  {t("tutoriels_title")} ({tutorial.length})
                </h3>
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-play text-white text-sm"></i>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {tutorial.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setCurrentVideo(item.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                      currentVideo === item.id
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-100 bg-white hover:border-red-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                          currentVideo === item.id
                            ? "bg-red-500 text-white scale-110"
                            : "bg-gray-100 text-gray-600 group-hover:bg-red-100"
                        }`}
                      >
                        <item.icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold text-sm leading-tight ${
                            currentVideo === item.id
                              ? "text-red-700"
                              : "text-gray-900"
                          }`}
                        >
                          {item.titre}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {currentVideo === item.id && (
                      <div className="flex items-center mt-3 text-red-600 text-xs font-medium">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                        <span>{t("en_cours_de_lecture")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CallToAction type={1} />
      <div className="w-10/12 min-2xl:w-8/12 mx-auto container">
        <div className="flex flex-col justify-center items-center">
          <h3 data-aos="fade-up" className="font-bold text-2xl text-stone-900">
            {t("features_title_demo")}
          </h3>
          <p
            data-aos="fade-up"
            className="text-stone-400 font-medium text-sm w-6/12 max-sm:w-11/12 text-center"
          >
            {t("features_description_demo")}
          </p>
        </div>
        <div data-aos="fade-up" className="w-full mt-3">
          <video
            className="w-full rounded-2xl"
            height="360"
            controls
            controlsList="nodownload"
          >
            <source src={VideoAutocad} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </main>
  );
};

export default Features;
