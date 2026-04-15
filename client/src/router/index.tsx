import {
  Home,
  AuthCode,
  Louer,
  Contact,
  Checkout,
  Login,
  ForgetPwd,
  Features,
  Dashboard,
  Users,
  Rent,
  Payment,
  Product,
  Faq,
  Marketing,
  MarketingCreate,
  Logs,
  Settings,
  Support,
  TwoFac,
  NewLicence,
  Commande,
  ActivationFailed,
  RecoverPwd,
  Privacy,
  LegalNotice,
  GCV,
  ActivateAccount,
} from "@/pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/pages/public";
import LayoutLogin from "@/pages/auth"
import LayoutDashboard from "@/pages/dashboard"
import ScrollToTop from "@/components/elements/ScrollToTop";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import Maintenance from '@/components/elements/Maintenance'
import { useEffect, useState } from "react";
import { settings } from "@/data/mockData";
import Loading from "@/components/elements/Loading";
import Error404 from "@/components/elements/Error404";

// const basePath = import.meta.env.BASE_URL || '/'

const index = () => {
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

  if(loading) {
    return <Loading />
  }
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
      {
          SettingsData?.siteStatus !== "active" ?
            <Route path="*" element={<Maintenance />}></Route>
          :
            <>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />}></Route>
                <Route path="/enregistrement-du-logiciel" element={<AuthCode />} />
                <Route path="/louer" element={<Louer />}></Route>
                <Route path="/louer/register" element={<Checkout />}></Route>
                <Route path="/contact" element={<Contact />}></Route>
                <Route path="/fonctionnalites" element={<Features />}></Route>
                <Route path="/activation-error" element={<ActivationFailed />}></Route>
                <Route path="/privacy" element={<Privacy />}></Route>
                <Route path="/legal-notice" element={<LegalNotice />}></Route>
                <Route path="/conditions-generales" element={<GCV />}></Route>
                <Route path="/activate-account" element={<ActivateAccount />}></Route>
              </Route>
              {/* Public Routes */}
            </>
        }
        {/* Login */}
        <Route path="/connexion" element={<LayoutLogin />}>
          <Route index element={<Login />}></Route>
          <Route path="/connexion/recuperation-mot-de-passe" element={<ForgetPwd />}></Route>
          <Route path="/connexion/two-factor/:token" element={<TwoFac />}></Route>
          <Route path="/connexion/reset-password/:token" element={<RecoverPwd />}></Route>
        </Route>
        {/* Login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tableau-de-board" element={<LayoutDashboard />}>
            <Route index element={<Dashboard />}></Route>
            <Route path="/tableau-de-board/utilisateurs" element={<Users />}></Route>
            <Route path="/tableau-de-board/commande" element={<Commande />}></Route>
            <Route path="/tableau-de-board/commande/paiement" element={<NewLicence />}></Route>
            <Route path="/tableau-de-board/locations" element={<Rent />}></Route>
            <Route path="/tableau-de-board/paiements" element={<Payment />}></Route>
            <Route path="/tableau-de-board/produits" element={<Product />}></Route>
            <Route path="/tableau-de-board/faq" element={<Faq />}></Route>
            <Route path="/tableau-de-board/marketing" element={<Marketing />}></Route>
            <Route path="/tableau-de-board/marketing/create" element={<MarketingCreate />}></Route>
            <Route path="/tableau-de-board/support" element={<Support />}></Route>
            <Route path="/tableau-de-board/logs" element={<Logs />}></Route>
            <Route path="/tableau-de-board/parametres" element={<Settings />}></Route>
          </Route>
        </Route>
        <Route path="*" element={<Error404 />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default index;
