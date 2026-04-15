import { CallToAction } from "@/components";
import { Faq } from "@/components/elements/Faq";
import { useLanguage } from "@/lang/LanguageProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from "react-router-dom";
import { FaBolt, FaShieldAlt, FaLink, FaDraftingCompass } from 'react-icons/fa';

const index = () => {
  const { t } = useLanguage();

  const comparaisonFerracad = [
    {
      tache: t("comparaisonFerracad_1_tache"),
      avant: t("comparaisonFerracad_1_avant"),
      apres: t("comparaisonFerracad_1_apres"),
    },
    {
      tache: t("comparaisonFerracad_2_tache"),
      avant: t("comparaisonFerracad_2_avant"),
      apres: t("comparaisonFerracad_2_apres"),
    },
    {
      tache: t("comparaisonFerracad_3_tache"),
      avant: t("comparaisonFerracad_3_avant"),
      apres: t("comparaisonFerracad_3_apres"),
    },
    {
      tache: t("comparaisonFerracad_4_tache"),
      avant: t("comparaisonFerracad_4_avant"),
      apres: t("comparaisonFerracad_4_apres"),
    },
    {
      tache: t("comparaisonFerracad_5_tache"),
      avant: t("comparaisonFerracad_5_avant"),
      apres: t("comparaisonFerracad_5_apres"),
    },
    {
      tache: t("comparaisonFerracad_6_tache"),
      avant: t("comparaisonFerracad_6_avant"),
      apres: t("comparaisonFerracad_6_apres"),
    },
    {
      tache: t("comparaisonFerracad_7_tache"),
      avant: t("comparaisonFerracad_7_avant"),
      apres: t("comparaisonFerracad_7_apres"),
    },
    {
      tache: t("comparaisonFerracad_8_tache"),
      avant: t("comparaisonFerracad_8_avant"),
      apres: t("comparaisonFerracad_8_apres"),
    },
    {
      tache: t("comparaisonFerracad_9_tache"),
      avant: t("comparaisonFerracad_9_avant"),
      apres: t("comparaisonFerracad_9_apres"),
    },
    {
      tache: t("comparaisonFerracad_10_tache"),
      avant: t("comparaisonFerracad_10_avant"),
      apres: t("comparaisonFerracad_10_apres"),
    },
  ];
  
  const avantagesFerracad: any = [
    {
      title: t("avantagesFerracad_1_title"),
      icon: FaBolt,
      description: t("avantagesFerracad_1_description"),
      bgColor: "#8B0000", // dark red
      textColor: "#FFFFFF"
    },
    {
      title: t("avantagesFerracad_2_title"),
      icon: FaShieldAlt,
      description: t("avantagesFerracad_2_description"),
      bgColor: "#A1001A", // deep crimson
      textColor: "#FFFFFF"
    },
    {
      title: t("avantagesFerracad_3_title"),
      icon: FaLink,
      description: t("avantagesFerracad_3_description"),
      bgColor: "#B22222", // firebrick
      textColor: "#FFFFFF"
    },
    {
      title: t("avantagesFerracad_4_title"),
      icon: FaDraftingCompass,
      description: t("avantagesFerracad_4_description"),
      bgColor: "#C0392B", // dark red-orange
      textColor: "#FFFFFF"
    }
  ];
  
  AOS.init();

  return (
    <>
      {/*<HeroSection
        title={t("louer_title")}
        description={t("louer_description")}
        button={buttonContext}
      />*/}
      <CallToAction type={1} />
      <div className="my-6 w-10/12 min-2xl:w-8/12 mx-auto container">
        {/*<Features activeLink={false} />*/}
        <Table className="w-full border-0">
          <TableHeader className="border-0">
            <TableRow className="border-0">
              <TableHead></TableHead>
              <TableHead className="text-center font-bold">Avant</TableHead>
              <TableHead className="text-center font-bold bg-primary rounded-t-2xl text-white border-0">Après</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparaisonFerracad.map((com: any, i) => (
              <TableRow key={com.tache} className="border-0">
                <TableCell className="" data-aos="fade-right">
                  {com.tache}
                </TableCell>
                <TableCell className="max-w-[100px] max-sm:max-w-[400px] break-words whitespace-normal text-black/60 font-normal p-5">
                  {com.avant}
                </TableCell>
                <TableCell className={`text-white max-w-[100px] max-sm:max-w-[400px] break-words whitespace-normal font-semibold p-5 bg-primary ${i === comparaisonFerracad.length - 1 && "rounded-b-2xl"} `}>
                  {com.apres}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center items-center my-3 text-sm font-semibold underline text-stone-900">
          <Link data-aos="fade-up" to="/louer/register">Obtenez toutes ces fonctionnalités gratuitement pendant 30 jours</Link>
        </div>
        <div className="grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-3 my-6">
          {
            avantagesFerracad.map((avan: any, i: number) => (
              <div data-aos="fade-right" key={i} className="flex flex-col justify-between gap-5 p-7 rounded-2xl transition-all duration-200 hover:shadow-2xl" style={{ backgroundColor: avan.bgColor, color: avan.textColor }}>
                <avan.icon className="w-8 h-8" />
                <div>
                  <h4 className="font-semibold ">{avan.title}</h4>
                  <p className="font-medium text-sm text-white/60">{avan.description}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <Faq />
    </>
  );
};

export default index;
