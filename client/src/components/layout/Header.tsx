import { Link, useLocation } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lang/LanguageProvider";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import LogoFerracad from "@/assets/ferracad-logo.png";
import { settings } from "@/data/mockData";
import {
  FaDiscord,
  FaDribbble,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaPinterest,
  FaReddit,
  FaSlack,
  FaSnapchat,
  FaSoundcloud,
  FaTelegram,
  FaTiktok,
  FaTumblr,
  FaTwitch,
  FaTwitter,
  FaWeibo,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { BsGlobeEuropeAfrica } from "react-icons/bs";
import DownloadButton from "../elements/DownloadButton";
// import { Switch } from "../ui/switch";

const socialMediaIcons: any = {
  facebook: FaFacebook,
  twitter: FaTwitter,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  pinterest: FaPinterest,
  tiktok: FaTiktok,
  snapchat: FaSnapchat,
  reddit: FaReddit,
  tumblr: FaTumblr,
  github: FaGithub,
  discord: FaDiscord,
  twitch: FaTwitch,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
  weibo: FaWeibo,
  medium: FaMedium,
  dribbble: FaDribbble,
  slack: FaSlack,
  soundcloud: FaSoundcloud,
};

const Header = () => {
  const { t, setLang }: any = useLanguage();
  // const [isAutoCAD, setIsAutoCAD] = useState(() => {
  //   const savedProgram = localStorage.getItem('selectedProgram');
  //   return savedProgram === "ZWCAD" ? false : true;
  // });

  const [SettingsData, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getSettings = await settings();
        setSettings(getSettings || {});
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const menu = [
    {
      title: t("Accueil"),
      path: "/",
    },
    {
      title: t("Docs"),
      path: "/file/manuel.pdf",
    },
    {
      title: t("Fonctionnalites"),
      path: "/fonctionnalites",
    },

    {
      title: t("Louer"),
      path: "/louer",
    },
    {
      title: t("Contact"),
      path: "/contact",
    },
  ];

  const [languePopup, setLanguePopup] = useState(false);
  const [sideMenu, setSideMenu] = useState(false);
  const [languePopupMobile, setLanguePopupMobile] = useState(false);

  const location = useLocation();
  const subpath = location.pathname;

  // "Français", "English", "Flamand"

  const langues = [
    {
      label: "Français",
      value: "fr",
    },
    {
      label: "English",
      value: "en",
    },
    {
      label: "Nederlands",
      value: "fl",
    },
  ];

  return (
    <div>
      <div className="bg-primary py-4 relative z-50">
        <div className="w-10/12 min-2xl:w-8/12 m-auto container flex justify-between items-center max-sm:flex-wrap max-sm:gap-5">
          <div>
            <p className="text-sm max-lg:text-xs text-white">
              {t("aide")} {" "}
              <Link to="/contact" className="font-bold">
                {t("contact")}
              </Link>
            </p>
          </div>
          <div className="items-center flex gap-4">
            {SettingsData?.socialMedia &&
              Object.entries(SettingsData?.socialMedia).map(
                ([platform, url]: any) => {
                  const IconComp = socialMediaIcons[platform];
                  return (
                    <a href={url} className="" key={platform}>
                      <IconComp size={15} color="#121212" fill={"#fff"} />
                    </a>
                  );
                }
              )}
          </div>
        </div>
      </div>
      <header className="w-10/12 min-2xl:w-8/12  m-auto my-8 container relative z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-7 max-lg:gap-4">
            <Link to="/">
              <img
                src={LogoFerracad}
                alt="Ferracad"
                className="w-26 max-lg:w-18 my-auto"
              />
            </Link>
            <nav>
              <ul className="flex items-center gap-7 max-lg:gap-5 max-md:hidden">
                {menu.map((m, i) =>
                  m.title === "Docs" ? (
                    <a
                      key={i}
                      href={m.path}
                      className={`uppercase ${
                        subpath.includes(m.path)
                          ? "font-bold active-url"
                          : "font-semibold"
                      } text-xs text-stone-700 transition-all duration-200 hover:font-bold hover:text-stone-900`}
                    >
                      {m.title}
                    </a>
                  ) : (
                    <Link
                      key={i}
                      to={m.path}
                      className={`uppercase ${
                        subpath === m.path
                          ? "font-bold active-url"
                          : "font-semibold"
                      } text-xs text-stone-700 transition-all duration-200 hover:font-bold hover:text-stone-900`}
                    >
                      {m.title}
                    </Link>
                  )
                )}
              </ul>
            </nav>
          </div>
          <div className="flex items-center justify-end gap-5 max-lg:gap-4 max-md:hidden">
            {/*<div className="flex items-center space-x-3">
              <p className={`font-medium transition-colors duration-200 text-xs ${isAutoCAD ? 'text-gray-900' : 'text-gray-400'}`}>
                AutoCAD
              </p>
              <Switch
                id="programme"
                checked={!isAutoCAD}
                onCheckedChange={(checked) => {
                  setIsAutoCAD(!checked);
                  localStorage.setItem('selectedProgram', !checked ? 'AutoCAD' : 'ZWCAD');
                }}
                className="data-[state=checked]:bg-blue-700 data-[state=unchecked]:bg-gray-900"
              />
              <p className={`font-medium transition-colors duration-200 text-xs ${!isAutoCAD ? 'text-blue-700' : 'text-gray-400'}`}>
                ZWCAD
              </p>
            </div>*/}
            <div className="relative">
              <button
                onClick={() => setLanguePopup(!languePopup)}
                className="cursor-pointer flex items-center gap-2"
              >
                <BsGlobeEuropeAfrica />
                <p className="font-bold text-sm max-lg:text-xs">
                  {t("Langue")}
                </p>
              </button>
              {languePopup && (
                <div className="absolute flex flex-col top-9 z-50 bg-white border border-stone-200 p-2 rounded-xl">
                  {langues.map((langue, index) => (
                    <button
                      key={index}
                      className="p-2 pl-3 pr-10 text-left cursor-pointer text-sm max-lg:text-xs font-bold transition-all duration-200 hover:bg-stone-100 rounded-2xl"
                      onClick={() => {
                        setLanguePopup(!languePopup);
                        setLang(langue.value);
                      }}
                    >
                      {langue.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <DownloadButton
              context={t("telechargement")}
              className="flex items-center gap-2 rounded-lg p-2 !px-6 bg-primary hover:bg-red-800 transition-all text-xs font-semibold text-white"
            />
            {/* Mobile version */}
            <DownloadButton
              context={t("")}
              className="hidden items-center gap-2 rounded-full p-2 max-lg:flex bg-primary transition-all duration-200 hover:bg-red-800 cursor-pointer font-semibold text-xs text-white"
            />
            <Link to="/tableau-de-board">
              <FaUserAlt size={16} className="text-stone-900" />
            </Link>
          </div>
          <button
            onClick={() => setSideMenu(true)}
            className="hidden max-md:flex justify-center items-center cursor-pointer"
          >
            <GiHamburgerMenu size={23} />
          </button>
        </div>
      </header>
      {sideMenu && (
        <div className="fixed bg-white z-50 h-[100dvh] w-full top-0 p-10 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-end justify-end w-full ">
              <button onClick={() => setSideMenu(false)}>
                <IoMdClose size={25} />
              </button>
            </div>
            <nav>
              <ul className="flex flex-col gap-3">
                {menu.map((m, index) => (
                  <li key={index}>
                    <Link
                      to={m.path}
                      onClick={() => setSideMenu(false)}
                      className="font-semibold uppercase text-lg"
                    >
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex flex-col gap-3 relative">
            {/*<div className="flex items-center justify-center space-x-3 mb-7">
              <p className={`font-medium transition-colors duration-200 text-xs ${isAutoCAD ? 'text-gray-900' : 'text-gray-400'}`}>
                AutoCAD
              </p>
              <Switch
                id="programme"
                checked={!isAutoCAD}
                onCheckedChange={(checked) => {
                  setIsAutoCAD(!checked);
                  localStorage.setItem('selectedProgram', !checked ? 'AutoCAD' : 'ZWCAD');
                }}
                className="data-[state=checked]:bg-blue-700 data-[state=unchecked]:bg-gray-900"
              />
              <p className={`font-medium transition-colors duration-200 text-xs ${!isAutoCAD ? 'text-blue-700' : 'text-gray-400'}`}>
                ZWCAD
              </p>
            </div>*/}
            <Link to="/tableau-de-board" className="w-full p-4 uppercase font-semibold text-sm border border-stone-200 rounded-2xl text-center">
              {t('connexion_btn_conx')}
            </Link>
            {languePopupMobile && (
              <div className="border border-stone-200 absolute bottom-[152px] bg-white w-full rounded-2xl">
                {langues.map((lang, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLanguePopupMobile(!languePopupMobile);
                      setLang(lang.value);
                    }}
                    className="font-semibold p-4 text-sm w-full transition-all duration-200 hover:bg-stone-100"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
            <button
              className="w-full p-4 uppercase font-semibold text-sm border border-stone-200 rounded-2xl"
              onClick={() => setLanguePopupMobile(!languePopupMobile)}
            >
              {t("Langue")}
            </button>
            <DownloadButton
              context={t("telechargement")}
              className="flex items-center gap-2 rounded-2xl p-7 w-full uppercase text-sm justify-center bg-primary transition-all duration-200 hover:bg-red-800 cursor-pointer font-semibold text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
