import { Link, Outlet, useLocation } from 'react-router-dom'
import { useLanguage } from "@/lang/LanguageProvider";
import LogoFerracad from "@/assets/ferracad-logo.png"
import SideImg from "@/assets/image 21.jpg"
import { Helmet } from "react-helmet";

const index = () => {
    const { t } : any = useLanguage();
    const date = new Date();
    const year = date.getFullYear();
    const location = useLocation();

    const pageTitles: Record<string, string> = {
        '/connexion': 'Connexion - Ferracad',
        '/connexion/recuperation-mot-de-passe': 'Récupération du mot de passe - Ferracad',
        '/connexion/two-facto': 'Vérification en deux étapes - Ferracad',
        '/connexion/reset-password/:token': 'Réinitialisation du mot de passe - Ferracad',
    };      

    let currentPageTitle = pageTitles[location.pathname] || "Ferracad 23.14 - Logiciel pour AutoCAD®, ZWCAD®";
    
    if (location.pathname.startsWith('/connexion/reset-password/')) {
        currentPageTitle = 'Réinitialisation du mot de passe - Ferracad';
    } else {
        currentPageTitle = pageTitles[location.pathname] || currentPageTitle;
    }
  return (
    <>
        <Helmet>
            <title>{currentPageTitle}</title>
            <link rel="canonical" href="https://www.ferracad.com/" />
            <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className='grid grid-cols-2 max-md:grid-cols-1 min-h-screen max-h-full mx-auto'>
            <div className='flex flex-col justify-between m-10 w-9/12 mx-auto min-2xl:w-7/12'>
                <Link to="/">
                    <img 
                        src={LogoFerracad}
                        alt='Ferracad'
                        className='w-[100px]'
                    />
                </Link>
                <Outlet />
                <div className=' flex justify-center items-end w-full'>
                    <p className='text-center text-stone-500 text-xs w-full font-semibold'>© {year} {t("connexion_copyright")}</p>
                </div>
            </div>
            <div className='sticky m-5 top-5 max-md:hidden'>
                <img 
                    src={SideImg}
                    alt='Ferracad'
                    className='h-[calc(100vh_-_40px)] object-cover w-full brightness-75 rounded-lg'
                />
                <div className='absolute bottom-12 w-full'>
                    <div className='w-10/12 min-2xl:w-8/12 mx-auto flex flex-col gap-5'>
                        <h5 className='text-white font-bold text-4xl'>{t("connexion_titleside")}</h5>
                        <p className="text-white" dangerouslySetInnerHTML={{ __html: t("connexion_descriptionside") }} />
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default index