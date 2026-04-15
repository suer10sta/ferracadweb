import Card from '@/components/dashboard/Card';
import { FiExternalLink } from 'react-icons/fi';
import { HiExternalLink } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MdKey, MdVpnKeyOff } from 'react-icons/md';
import { enrichedUser } from '@/data/dataUser';
import { TbLicense } from 'react-icons/tb';
import { PiContactlessPaymentBold } from 'react-icons/pi';
import { formatDate } from '@/utils/formatDate';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import { IoGiftSharp } from 'react-icons/io5';
import Loading from '../elements/Loading';
import { useLanguage } from '@/lang/LanguageProvider';

const DashboardClient = () => {
  const { t } = useLanguage();
  const user: any = enrichedUser();
  const [cardsAnalytics, setcardsAnalytics] = useState<any []>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> {
    if(loading) return;

    if(user._id) {
      setLoading(true)
    }

    setcardsAnalytics([
      {
        title: t("dashboardClient_activeLicenses"),
        value: user.registrationData?.filter((e: { status: string; })=> e?.status.toLowerCase() === 'active' || e?.status.toLowerCase() === 'freetrial').length || 0,
        icon: MdKey,
        isGrowth: false,
        isCurrency: false,
        isPercent: false,
        isDark: true,
        parag: t("dashboardClient_totalActiveLicenses")
      },
      {
        title: t("dashboardClient_expiredLicenses"),
        value: user.registrationData?.filter((e: { status: string; })=> e?.status.toLowerCase() === 'expired').length || 0,
        icon: MdVpnKeyOff,
        isCurrency: false,
        isPercent: false,
        parag: t("dashboardClient_nextRecurringPayment")
      },
      {
        title: t("dashboardClient_totalLicenses"),
        value: user.registrationData?.length || 0,
        icon: TbLicense,
        isCurrency: false,
        isPercent: false,
        isDark: true,
        parag: t("dashboardClient_currentPlan")
      },
      {
        title: t("dashboardClient_autoPayment"),
        value: user.rentalData?.filter((e: { deductionAuto: boolean; })=> e?.deductionAuto === true).length || 0,
        icon: PiContactlessPaymentBold,
        isCurrency: false,
        isPercent: false,
        parag: t("dashboardClient_autoRenewLicenses")
      }
    ])
  }, [user, loading, t]);

  const lastPayments = user.paymentData;
  const totalAmount = lastPayments?.reduce((curr: any, arr: { totalPricePay: any; })=> curr + arr.totalPricePay, 0).toFixed(2) || 0;

  const handleGetFreeTrial = ()=> {
    if(user.rentalData.length > 0) return;
    navigate("/tableau-de-board/commande/paiement", { state: { freeTrial: true } });
  }

  if(!user._id) {
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
          cardsAnalytics.map((analytic, index)=> (
            <Card 
              key={index} 
              analytic={analytic} 
            />
          ))
        }
      </div>
      <div className='grid grid-cols-1 gap-5'>
        <div className='bg-white p-7 rounded-2xl transition-all duration-200 hover:shadow-lg'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='font-bold text-sm'>{t("dashboardClient_recentPayments")}</h4>
              <p className='font-medium text-xs text-black/40 w-8/12'>{t("dashboardClient_recentPaymentsDescription")}</p>
            </div>
            <div className='flex items-center gap-4'>
              <Link to="/tableau-de-board/paiements">
                <FiExternalLink />
              </Link>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboardClient_paymentId")}</TableHead>
                <TableHead>{t("dashboardClient_paymentDate")}</TableHead>
                <TableHead>{t("dashboardClient_paymentMethod")}</TableHead>
                <TableHead>{t("dashboardClient_paymentStatus")}</TableHead>
                <TableHead className='text-right'>{t("dashboardClient_paymentAmount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lastPayments?.slice(0, 9).map((invoice: any, index: number) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.FacturesData.find((e: any)=> e.payId._id === invoice._id)?.factureId || ""}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>
                      <span className='text-xs font-medium uppercase'>{invoice.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${invoice.status === 'success'? "bg-green-100 text-green-800": "bg-red-100 text-red-800"}`}>
                        {invoice.status === "success"? t('dashboardClient_success'): t('dashboardClient_failed')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">€ {invoice.totalPricePay}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>{t("dashboardClient_total")}</TableCell>
                <TableCell className="text-right font-medium">€ {totalAmount}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default DashboardClient;