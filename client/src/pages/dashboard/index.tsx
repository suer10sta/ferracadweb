import { Outlet, useLocation } from 'react-router-dom';
import SideBar from '@/components/dashboard/SideBar';
import Header from '@/components/dashboard/Header';
import { useState } from 'react';
import { Helmet } from "react-helmet";
import { useLanguage } from '@/lang/LanguageProvider';
import { getUser } from '@/utils/auth';
import HorizontalNav from '@/components/dashboard/HorizontalNav';

const index = () => {
    const { t } = useLanguage()
    const [activeSidebar, setActiveSidebar] = useState(true);
    const location = useLocation();

    const pageTitles: Record<string, string> = {
        '/tableau-de-board': t("pagetitle_dashboard"),
        '/tableau-de-board/utilisateurs': t("pagetitle_users"),
        '/tableau-de-board/commande': t("pagetitle_orders"),
        '/tableau-de-board/commande/paiement': t("pagetitle_orderPayments"),
        '/tableau-de-board/locations': t("pagetitle_locations"),
        '/tableau-de-board/paiements': t("pagetitle_payments"),
        '/tableau-de-board/produits': t("pagetitle_products"),
        '/tableau-de-board/faq': t("pagetitle_faq"),
        '/tableau-de-board/marketing': t("pagetitle_marketing"),
        '/tableau-de-board/marketing/create': t("pagetitle_marketingCreate"),
        '/tableau-de-board/logs': t("pagetitle_logs"),
        '/tableau-de-board/parametres': t("pagetitle_settings"),
    };

    const currentPageTitle = pageTitles[location.pathname] || "Ferracad 23.14 - Logiciel pour AutoCAD®, ZWCAD®";

    const user = getUser();
    const isAdmin = user?.role === "admin";

    return (
        <>
            <Helmet>
                <title>{currentPageTitle}</title>
                <link rel="canonical" href="https://www.ferracad.com/" />
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className='flex bg-[#F9F9F9] min-h-screen'>
                {isAdmin && (
                    <div
                        className={`transition-all duration-200 max-lg:absolute top-0 left-0 ${activeSidebar ? "translate-x-[0%] w-[13%] max-lg:w-[35%] max-md:w-full max-md:z-[100]" : "w-[0%] translate-x-[-1000px]"} bg-white`}
                    >
                        <SideBar setActiveSidebar={setActiveSidebar} activeSidebar={activeSidebar} />
                    </div>
                )}
                <div className={`transition-all duration-200 ${isAdmin && activeSidebar ? "w-[85%] " : "w-full"} mx-auto px-5`}>
                    <div className={`mx-auto max-w-[1600px]`}>
                        <div className="sticky top-0 z-[100] bg-[#F9F9F9]">
                            <Header setActiveSidebar={setActiveSidebar} activeSidebar={activeSidebar} />
                        </div>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}

export default index;