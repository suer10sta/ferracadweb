import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coupon, payment, registrations, rentals, user, facturesData } from '@/data/mockData';
// import { PiFilePdfBold } from 'react-icons/pi';
import { GrTransaction } from "react-icons/gr";
import { AiFillDollarCircle } from 'react-icons/ai';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { VscError } from "react-icons/vsc";
import CardDetails from '@/components/dashboard/Card';
import Facture from '@/components/dashboard/Facture';
// import { toast } from 'sonner';
import { useLanguage } from '@/lang/LanguageProvider';
import { PiFilePdfBold } from 'react-icons/pi';
import { toast } from 'sonner';

const PaymentsClient = ({ userIdn }: any) => {
  const { t } = useLanguage()
  const location = useLocation();
  const navigate = useNavigate();
  const [rentalData, setRentalData] = useState<any[]>([]);
  const [registrationData, setRegistrationData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>({});
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [couponData, setCouponData] = useState<any[]>([]);
  const [FacturesData, setFacturesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await user();
        const getPayment = await payment();
        const getCoupon = await coupon();
        const getfactures = await facturesData();

        setFacturesData(getfactures || [])
        setRentalData(getRentls || []);
        setRegistrationData(getRegistrations || []);
        setUserData(getUser || []);
        setPaymentData(getPayment || []);
        setCouponData(getCoupon || []);
      } catch (error) {
        // console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [])

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [invoiceSentFilter, setInvoiceSentFilter] = useState<string>('all');
  const [openFacture, setOpenFacture] = useState<any>({});
  const [autoSendFacture, setAutoSendFacture] = useState<any>(false);

  useEffect(() => {
    if (loading) return;

    const rentalId = (location.state as any)?.id;
    const isSend = (location.state as any)?.isSend;
    if (!rentalId || !isSend) return;

    const onceKey = `facture_autosent_${rentalId}`;
    if (sessionStorage.getItem(onceKey) === "1") return;

    const rental = rentalData.find((r) => r?._id === rentalId);
    if (!rental?.payId) return;

    const pay = paymentData.find((p) => p?._id === rental.payId);
    if (!pay?._id) return;

    sessionStorage.setItem(onceKey, "1");
    // Invoice is no longer auto-sent on purchase navigation
    navigate(location.pathname, { replace: true, state: {} });
  }, [loading, location.state, location.pathname, rentalData, paymentData, navigate]);

  const enrichedPayments: any = paymentData?.filter((e) => e.userId === userIdn?.id).map(payment => {
    const facture = FacturesData.find((e) => e.payId._id === payment._id)
    const rentalInfos = rentalData.filter((e) => e.payId === payment._id);
    const registerInfos = registrationData.filter((e) => e.rentalId === rentalData.find((e) => e.payId === payment._id)?._id)
    const coupon = couponData.find(u => u._id === payment.couponId);

    return {
      ...payment,
      facture,
      userData,
      coupon,
      registerInfos,
      rentalInfos,
    };
  });

  const filteredPayments = enrichedPayments.filter((payment: any) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      payment.user?.name?.toLowerCase().includes(searchLower) ||
      payment.user?.email?.toLowerCase().includes(searchLower) ||
      payment.operatorId?.toLowerCase().includes(searchLower) ||
      payment.facture?.factureId?.toLowerCase().includes(searchLower) ||
      false;

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.type === methodFilter;
    const matchesInvoiceSent =
      invoiceSentFilter === "all" ||
      (invoiceSentFilter === "sent" && payment.facture?.isSent) ||
      (invoiceSentFilter === "unsent" && !payment.facture?.isSent);

    return matchesSearch && matchesStatus && matchesMethod && matchesInvoiceSent;
  });


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3 w-3" />
          {t('dashboardClient_success')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          {t('dashboardClient_failed')}
        </Badge>
      );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    if (method === 'stripe') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Stripe</Badge>;
    } else if (method === 'paypal') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">PayPal</Badge>;
    } else if (method === 'free') {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700">{t('dashboard_payment_free')}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700">{t('dashboard_payment_cash')}</Badge>;
    }
  };

  let totalRevenue = enrichedPayments?.filter((p: any) => p.status === 'success')?.reduce((sum: any, p: any) => sum + p.totalPricePay, 0);
  let successfulPayments = enrichedPayments?.filter((p: any) => p.status === 'success').length;
  let failedPayments = enrichedPayments?.filter((p: any) => p.status === 'unsuccess').length;

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([])

  useEffect(() => {
    setQuickAnalytic([
      {
        title: t('dashboardClient_total'),
        icon: AiFillDollarCircle,
        value: totalRevenue,
        isGrowth: true,
        isCurrency: true,
        valueGrowth: 12.5,
        isDark: true,
        isPercent: true,
        parag: t('dashboard_payment_totalAmountInvested')
      },
      {
        title: t('dashboard_payment_transactions'),
        icon: GrTransaction,
        value: enrichedPayments.length,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t('dashboard_payment_totalPayments')
      },
      {
        title: t('dashboard_payment_successful'),
        icon: IoMdCheckmarkCircleOutline,
        value: successfulPayments,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: true,
        isPercent: false,
        parag: `${Math.round((successfulPayments / enrichedPayments.length) * 100)}% ${t('dashboard_payment_successRate')}`
      },
      {
        title: t('dashboard_payment_successRate'),
        icon: VscError,
        value: failedPayments,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t('dashboard_payment_failedDescription')
      },
    ])
  }, [loading, t])

  return (
    <div className="space-y-6 mb-6">
      {
        openFacture?._id && (
          <Facture
            payment={openFacture}
            setOpenFacture={setOpenFacture}
            isHide={autoSendFacture}
            setisHide={setAutoSendFacture}
          />
        )
      }
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('sidebarPayments')}</h2>
        <p className="text-sm text-black/40">
          {t('dashboard_payment_tracking')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {
          QuickAnalytic.map((analytic, index) => (
            <CardDetails
              key={index}
              analytic={analytic}
            />
          ))
        }
      </div>

      {/* Payments Table */}
      <Card className='border-0'>
        <CardHeader>
          <CardTitle>{t('dashboard_payment_paymentHistory')}</CardTitle>
          <CardDescription>
            {t('dashboard_payment_fullList')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard_payment_searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('dashboard_payment_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard_payment_allStatuses')}</SelectItem>
                <SelectItem value="success">{t('dashboardClient_success')}</SelectItem>
                <SelectItem value="unsuccess">{t('dashboardClient_failed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('dashboard_payment_method')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dashboard_payment_allMethods')}</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">{t("dashboard_payment_cash")}</SelectItem>
                <SelectItem value="free">{t("dashboard_payment_free")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={invoiceSentFilter} onValueChange={setInvoiceSentFilter}>
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue placeholder="Statut Facture" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les factures</SelectItem>
                <SelectItem value="sent">Factures envoyées</SelectItem>
                <SelectItem value="unsent">Factures non envoyées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('dashboard_payment_method')}</TableHead>
                  <TableHead>{t('dashboard_payment_amount')}</TableHead>
                  <TableHead>{t('dashboard_payment_status')}</TableHead>
                  <TableHead>Statut Facture</TableHead>
                  <TableHead>{t('dashboard_payment_date')}</TableHead>
                  {<TableHead className="text-center">{t('dashboard_payment_action')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment: any) => (
                  <TableRow key={payment._id}>
                    <TableCell className='text-sm font-semibold'>{payment.facture?.factureId}</TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      € {payment.totalPricePay}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      {payment.facture?.isSent ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 gap-1 font-normal text-xs py-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Envoyée
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 gap-1 font-normal text-xs py-0.5">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Non envoyée
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      <button
                        className='cursor-pointer'
                        onClick={() => {
                          const canViewInvoice =
                            payment.status === "success" ||
                            (payment.type === "cash" &&
                              payment.status === "unsuccess");

                          if (!canViewInvoice) {
                            toast.warning(t('dashboard_payment_invoiceRestriction'));
                            return;
                          }
                          setOpenFacture(payment)
                        }}
                      >
                        <PiFilePdfBold className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsClient;