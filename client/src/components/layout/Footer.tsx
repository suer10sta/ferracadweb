import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/lang/LanguageProvider";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { settings } from "@/data/mockData";
import { FaDiscord, FaDribbble, FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaMedium, FaPinterest, FaReddit, FaSlack, FaSnapchat, FaSoundcloud, FaTelegram, FaTiktok, FaTumblr, FaTwitch, FaTwitter, FaWeibo, FaWhatsapp, FaYoutube } from "react-icons/fa";
import DownloadButton from "../elements/DownloadButton";

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

const Footer = () => {
  const { t } = useLanguage();
  const [SettingsData, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const getData = async () => {
      try {
        const getSettings = await settings();

        setSettings(getSettings || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [loading])

  const [hideFaq, setHideFaq] = useState(false);
  const location = useLocation();
  const subpath = location.pathname;

  useEffect(() => {
    setHideFaq(subpath === "/louer/register" ? true : false);
  }, [subpath]);

  AOS.init();

  return (
    <>
      {!hideFaq &&
        (
          <div data-aos="fade-up" className="p-12 py-10 flex flex-col gap-2">
            <h3 className="font-medium text-lg max-md:text-sm max-md:font-semibold text-stone-700 text-center">
              {t("download_desc")}
            </h3>
            <div className="w-full flex justify-center items-center">
              <DownloadButton context={t("telechargement2")} className="flex items-center gap-2 rounded-lg p-2 !px-10 bg-stone-700 transition-all duration-200 hover:bg-stone-800 cursor-pointer font-semibold text-xs text-white" />
            </div>
          </div>
        )}

      <footer className="w-[97%] bg-secondary p-5 m-auto mb-5 rounded-lg">
        <div className="w-10/12 min-2xl:w-8/12 mx-auto">
          <div className="flex justify-center items-center gap-3 relative z-30">
            {SettingsData?.socialMedia && Object.entries(SettingsData?.socialMedia).map(([platform, url] : any) => {
              const IconComp = socialMediaIcons[platform]
              return (
                <a href={url} className="" key={platform}>
                  <IconComp size={15} color="#121212" fill={"#fff"} />
                </a>
              )
            })}
          </div>
          <p className="font-medium text-stone-200 text-xs mt-3 text-center relative z-30">
            <Link to="/legal-notice" className="font-bold underline">
              {t("rules")}
            </Link>
            {" "}-{" "}
            <Link to="/privacy" className="font-bold underline">
              {t("policy")}
            </Link>
            {" "}-{" "}
            <Link to="/conditions-generales" className="font-bold underline">
              {t('conditions')}
            </Link>
            {" "}- {t("descriptionfooter")}
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
