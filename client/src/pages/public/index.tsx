import { Header, Footer } from '@/components'
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useState, useEffect } from 'react';
import { settings } from '@/data/mockData';
import { useLanguage } from '@/lang/LanguageProvider';
import CookieConsent from '@/components/elements/CookieConsent';

const index = () => {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const [SettingsData, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    const getData = async () => {
      try {
        const getSettings = await settings();

        setSettings(getSettings || {});
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [loading])

  const defaultTitle = "Ferracad 23.14 - Logiciel pour AutoCAD®, ZWCAD®";
  const siteTitle = SettingsData?.seoTitle?.[lang] || defaultTitle;

  const pageTitles: Record<string, string> = {
    '/': `${t('Accueil')} - ${siteTitle}`,
    '/fonctionnalites': `${t('Fonctionnalites')} - ${siteTitle}`,
    '/louer': `${t('Louer')} - ${siteTitle}`,
    '/contact': `${t('Contact')} - ${siteTitle}`,
    '/enregistrement-du-logiciel': `${t('pagetitle_software_registration')} - ${siteTitle}`,
    '/louer/register': `${t('pagetitle_rental_registration')} - ${siteTitle}`,
    '/activation-error': `${t('pagetitle_activation_error')} - ${siteTitle}`,
    '/privacy': `${t('pagetitle_privacy_policy')} - ${siteTitle}`,
    '/legal-notice': `${t('pagetitle_legal_notice')} - ${siteTitle}`,
    '/conditions-generales': `${t('conditions')} - ${siteTitle}`,
    '/activate-account': `${t('active_account_title')} - ${siteTitle}`,
    '/zwcad': `${t('presentation_ferracad_zwcad')} - ${siteTitle}`,
  };


  const currentPageTitle = pageTitles[location.pathname] || SettingsData?.seoTitle || "Ferracad 23.14 - Logiciel pour AutoCAD®, ZWCAD®";

  return (
    <>
      <Helmet>
        <title>{currentPageTitle}</title>
        <meta name="description" content={SettingsData.seoDescription?.[lang] || "-"} />
        <meta name="keywords" content={Array.isArray(SettingsData?.seoTags?.[lang]) ? SettingsData.seoTags[lang].join(", ") : "-"} />
        <link rel="canonical" href="https://www.ferracad.com/" />
        <meta name="robots" content="index,follow" />
      </Helmet>
      <Header />
      <div>
        <Outlet />
      </div>
      <Footer />
      <CookieConsent />
      
      
    </>
  )
}

export default index;