import Card from '@/components/dashboard/Card';

import { HiExternalLink } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { MdKey, MdVpnKeyOff } from 'react-icons/md';
import { enrichedUser } from '@/data/dataUser';
import { TbLicense } from 'react-icons/tb';

import {  useMemo, useState } from 'react';
import { IoGiftSharp } from 'react-icons/io5';
import Loading from '../elements/Loading';
import { useLanguage } from '@/lang/LanguageProvider';
import LicensesClient from '../client/Rent';
import { FaRegClock } from 'react-icons/fa';

const DashboardClient = () => {
  const { t } = useLanguage();
  const user: any = enrichedUser();
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const cardsAnalytics = useMemo(() => {
    const now = new Date();
    const getStatus = (reg: any) => {
      const expDate = reg.expirationDate ? new Date(reg.expirationDate) : null;
      const isExpired = expDate ? expDate < now : false;
      
      if (isExpired) return "expired";
      if (reg.status === "freetrial") return "freetrial";
      return "active";
    };

    return [
      {
        title: t("dashboardClient_activeLicenses"),
        value: user.registrationData?.filter((e: any) => getStatus(e) === "active").length || 0,
        icon: MdKey,
        isGrowth: false,
        isCurrency: false,
        isPercent: false,
        isDark: statusFilter === "active" || statusFilter === "all",
        iconBg: statusFilter === "active" ? "bg-green-600" : "bg-slate-800",
        onClick: () => setStatusFilter(statusFilter === "active" ? "all" : "active"),
        parag: t("dashboardClient_totalActiveLicenses")
      },
      {
        title: t("dashboardClient_expiredLicenses"),
        value: user.registrationData?.filter((e: any) => getStatus(e) === "expired").length || 0,
        icon: MdVpnKeyOff,
        isCurrency: false,
        isPercent: false,
        isDark: statusFilter === "expired",
        iconBg: statusFilter === "expired" ? "bg-red-600" : "bg-slate-800",
        onClick: () => setStatusFilter(statusFilter === "expired" ? "all" : "expired"),
        parag: t("dashboardClient_nextRecurringPayment")
      },
      {
        title: "Périodes d'essai",
        value: user.registrationData?.filter((e: any) => getStatus(e) === "freetrial").length || 0,
        icon: FaRegClock,
        isCurrency: false,
        isPercent: false,
        isDark: statusFilter === "Période d'essai",
        iconBg: statusFilter === "Période d'essai" ? "bg-blue-600" : "bg-slate-800",
        onClick: () => setStatusFilter(statusFilter === "Période d'essai" ? "all" : "Période d'essai"),
        parag: "Licences en test gratuit"
      },
      {
        title: "Toutes mes licences",
        value: user.registrationData?.length || 0,
        icon: TbLicense,
        isCurrency: false,
        isPercent: false,
        isDark: statusFilter === "all",
        iconBg: statusFilter === "all" ? "bg-stone-600" : "bg-slate-800",
        onClick: () => setStatusFilter("all"),
        parag: t("dashboardClient_currentPlan")
      }
    ];
  }, [user.registrationData, t, statusFilter]);

  const handleGetFreeTrial = () => {
    if (user.rentalData.length > 0) return;
    navigate("/tableau-de-board/commande/paiement", { state: { freeTrial: true } });
  }

  if (!user._id) {
    return <Loading />
  }

  return (
    <div className='mb-5 flex flex-col gap-5'>
      {
        (user.LicenseHistoryData.length <= 0 && user.registrationData.length <= 0) && (
          <div className='bg-green-100 text-green-900 flex items-center gap-2 justify-between p-3 rounded-full font-medium'>
            <div className='flex items-center gap-2'>
              <IoGiftSharp />
              <p className='text-xs'>{t("dashboardClient_freeTrial")}</p>
            </div>
            <button className='cursor-pointer' onClick={handleGetFreeTrial}>
              <HiExternalLink />
            </button>
          </div>
        )
      }
      <div className='grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5'>
        {
          cardsAnalytics.map((analytic, index) => (
            <Card
              key={index}
              analytic={analytic}
            />
          ))
        }
      </div>
      <div className='grid grid-cols-1 gap-5'>
        <div className='bg-white p-7 rounded-2xl transition-all duration-200 hover:shadow-lg'>
          {/* <div className='flex justify-end items-start'>
            <div className='flex items-center gap-4'>
              <Link to="/tableau-de-board/paiements">
                <FiExternalLink />
              </Link>
            </div>
          </div> */}
          <div className="mt-6">
            <LicensesClient userIdn={{ id: user._id }} statusFilter={statusFilter} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardClient;