import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Calendar, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { registrations, type LicenseHistory, rentals, type Rental, user, payment, licenseHistory } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { MdDeleteOutline, MdKey, MdOutlineModeEdit } from 'react-icons/md';
import CardDetails from '@/components/dashboard/Card';
import { Button } from '@/components/ui/button';
import { IoCopyOutline } from 'react-icons/io5';
import { getTotalLicenseDays } from '@/utils/getTotalLicenseDays';
import { formatDate } from '@/utils/formatDate';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import Loading from '../elements/Loading';
import { useLanguage } from '@/lang/LanguageProvider';
import { FaRegClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Plus, Info, HelpCircle } from 'lucide-react';
import { TbReload } from 'react-icons/tb';

function calculateTotalDays(histories: LicenseHistory[]): number {
  let totalDays = 0;

  histories.forEach((history) => {
    const start = new Date(history.startAt);
    const end = new Date(history.expirationDate);

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1; // inclusive

    totalDays += Math.round(diffInDays);
  });

  return totalDays;
}

const LicensesClient = ({ userIdn, statusFilter } : any) => {
  const { t } = useLanguage()
  const [rentalData, setRentalData] = useState<Rental[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [userData, setuserData] = useState<any[]>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [historyData, sethistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ChangeUp, setChangeUp] = useState(false);

  const [formDataUpdate, setformDataUpdate] = useState({
    nameComputer: "",
    codeComputer: "",
    username: ""
  })

  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSelectLicense = (id: string) => {
    setSelectedLicenses(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkRenew = () => {
    const licensesToRenew = registrationData.filter(reg => selectedLicenses.includes(reg._id));
    if (licensesToRenew.length === 0) return;
    
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: licensesToRenew }
    });
  };

  const handleIndividualRenew = (license: any) => {
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: [license] }
    });
  };

  useEffect(()=> {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await user();
        const getPayment = await payment();
        const getHistoryLicense = await licenseHistory();

        setRentalData(getRentls || []);
        setregistrationData(getRegistrations || []);
        setuserData(getUser || []);
        setpaymentData(getPayment || []);
        sethistoryData(getHistoryLicense || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [ChangeUp, loading])

  const [searchTerm, setSearchTerm] = useState('');

  const enrichedLicenses = registrationData.filter(e => e.userId === userIdn.id).map(license => {
    const licenseHistories = historyData.find((e)=> e.registerId === license._id)
    const expirationDate = license?.expirationDate? new Date(license?.expirationDate): 0;
    const now = new Date();
    const isExpired = expirationDate !== 0? expirationDate < now: false;
    const daysUntilExpiration = expirationDate !== 0? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)): 0;
    
    const isTrial = license.status === "freetrial";
    const status = isExpired 
      ? 'expired' 
      : (isTrial 
          ? "Période d'essai" 
          : (daysUntilExpiration <= 30 ? 'expiring' : 'active'));
    
    return {
      ...license,
      userData,
      isExpired,
      licenseHistories,
      daysUntilExpiration,
      status
    };
  });

  const filteredLicenses = enrichedLicenses.filter(license => {
    const matchesSearch = 
      license.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.computerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "all" || 
      (statusFilter === "active" ? (license.status === "active" || license.status === "expiring") : license.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (license: typeof enrichedLicenses[0]) => {
    if (license.status.toLocaleLowerCase() === "période d'essai") {
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-1">
          <FaRegClock className="h-3 w-3" />
          Période d'essai
        </Badge>
      );
    } else if (license.status.toLocaleLowerCase() === 'expired') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('dashboardClient_orders_expired')}
        </Badge>
      );
    } else if (license.status.toLocaleLowerCase() === 'expiring') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {t('dashboardClient_orders_expiring_soon')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {t('dashboardClient_orders_active')}
        </Badge>
      );
    }
  };

  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);

    const formattedDate = today.toISOString().split('T')[0];
    setMinDate(formattedDate);
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;
  
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(t('dashboardClient_orders_code_copied'))
      })
      .catch(() => {
        toast.warning(t('dashboardClient_orders_error_retry'))
      });
  }

  const totalPriceSpendLicense = (license: any)=> {
    const paymentId = rentalData.find((e)=> e._id === license.rentalId)?.payId;
    const payment = paymentData.find((e)=> e._id === paymentId);

    let totalPrice = (enrichedLicenses.length > 0 && payment?.totalPricePay)
    ? payment?.totalPricePay / enrichedLicenses.length
    : 0;
    
    return totalPrice;
  }

  const handleChangeUpdate = (e: { target: { name: any; value: any; }; })=> {
    const { name, value } = e.target;
    setformDataUpdate((prev)=> ({
      ...prev,
      [name]: value
    }))
  }

  const handleShow = (license: { computerName: any; computerCode: any; username: any }) => {
    setformDataUpdate({
      nameComputer: license.computerName,
      codeComputer: license.computerCode,
      username: license.username,
    })
  }

  const handleUpdateRegistration = async (id: any)=> {
    if(!formDataUpdate.codeComputer || !formDataUpdate.nameComputer || !formDataUpdate.username) {
      toast.warning(t('dashboard_rent_fillRequiredFields'));
      return;
    }

    setLoading(true)

    try {
      const res = await apiClient.put(`/registration/${id}`, formDataUpdate)
      if(res.status === 200) {
        toast.success(t('dashboardClient_orders_operationSuccess'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error) {
      toast.warning(t('dashboardClient_orders_errorOccurred'));
    } finally {
      setChangeUp(!ChangeUp)
      setLoading(false)
    }
  }

  if(loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Renewal Guide */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm transition-all hover:shadow-md">
        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-blue-900">Besoin de renouveler vos licences ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-2 items-center text-xs text-blue-800/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold">1</span>
              <span><strong>Individuel :</strong> Cliquez sur <TbReload className="inline h-3 w-3" /> au bout de la ligne d'un PC.</span>
            </div>
            <div className="flex gap-2 items-center text-xs text-blue-800/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold">2</span>
              <span><strong>Groupé :</strong> Cochez plusieurs PC et cliquez sur "Renouveler la sélection".</span>
            </div>
            <div className="flex gap-2 items-center text-xs text-blue-800/80">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold">3</span>
              <span><strong>Nouveau :</strong> Cliquez sur "Nouvelle licence" pour ajouter ou renouveler des postes.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex gap-2">
          {selectedLicenses.length > 0 && (
            <Button 
              onClick={handleBulkRenew}
              className="bg-blue-600 hover:bg-blue-700 text-white animate-in fade-in slide-in-from-right-5"
            >
              <TbReload className="mr-2 h-4 w-4" />
              Renouveler la sélection ({selectedLicenses.length})
            </Button>
          )}
          <Button 
            onClick={() => navigate("/tableau-de-board/commande/paiement")}
            variant="outline" 
            className="border-slate-200 hover:bg-slate-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Licence
          </Button>
        </div>
      </div>

      {/* Licenses Table */}
      <Card className='border-0'>
        <CardHeader>
          <CardTitle>{t('dashboard_rent_registeredLicensesOverview')}</CardTitle>
          <CardDescription>
            {t('dashboard_rent_licensesOverviewDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboardClient_orders_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) setSelectedLicenses(filteredLicenses.map(l => l._id));
                        else setSelectedLicenses([]);
                      }}
                      checked={selectedLicenses.length === filteredLicenses.length && filteredLicenses.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead>{t('dashboardClient_orders_user')}</TableHead>
                  <TableHead>Nom Ordinateur</TableHead>
                  <TableHead>Code d'identification</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>{t('dashboardClient_orders_expiration_date')}</TableHead>
                  <TableHead>{t('dashboardClient_orders_status')}</TableHead>
                  <TableHead>{t('dashboardClient_orders_days_left')}</TableHead>
                  <TableHead className="text-right">{t('dashboardClient_orders_action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license._id} className={selectedLicenses.includes(license._id) ? "bg-blue-50/30" : ""}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedLicenses.includes(license._id)}
                        onChange={() => handleSelectLicense(license._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{license.username}</p>
                        <p className="text-sm text-muted-foreground">{license.company}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{license.computerName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-[10px] bg-slate-100 p-1 rounded font-mono">{license.computerCode}</code>
                        <button onClick={()=> copyToClipboard(license.computerCode)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                          <IoCopyOutline size={12} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(license.createdAt)}
                    </TableCell>
                    <TableCell>
                      {formatDate(license.expirationDate)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(license)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "text-sm",
                        license.status === 'expired' && "text-red-600",
                        license.status === 'expiring' && "text-yellow-600",
                        license.status === 'active' && "text-green-600"
                      )}>
                        {license.isExpired
                          ? `${t(
                              "dashboardClient_orders_left_days"
                            )} ${Math.abs(license.daysUntilExpiration)} ${t(
                              "dashboardClient_orders_days_ago"
                            )}`
                          : `${license.daysUntilExpiration} ${t("pay_03_j")}`
                        }
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleIndividualRenew(license)}
                            >
                              <TbReload className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Renouveler cette licence</p></TooltipContent>
                        </Tooltip>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                            <DialogHeader>
                              <DialogTitle>{t('dashboard_rent_licenseDetails')}</DialogTitle>
                              <DialogDescription>
                                {t('dashboard_rent_licenseDetailsDescription')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                              <div className='grid grid-cols-1 max-md:grid-cols-1 gap-3'>
                                <CardDetails 
                                  analytic={{
                                    title: t('dashboard_rent_totalDaysUsed'),
                                    icon: MdKey,
                                    value: `${calculateTotalDays(historyData.filter((e)=> e.registerId === license._id))} Jours`,
                                    isGrowth: true,
                                    isCurrency: false,
                                    valueGrowth: 2,
                                    isDark: true,
                                    isPercent: false,
                                    parag: t('dashboard_rent_totalUsageDays'),
                                  }}
                                />
                              </div>
                              <div>
                                <h3 className='font-medium text-stone-800'>{license.userData?.name} <small>(€ {totalPriceSpendLicense(license)})</small></h3>
                                <p className='text-xs text-black/40 font-medium'>{license.company}</p>
                                <div className='mt-3 flex flex-col gap-2'>
                                  <div className='flex items-center justify-between'>
                                    <p className='text-sm text-black/50 font-medium'>{t('dashboard_rent_licenseStatus')} </p>
                                    {getStatusBadge(license)}
                                  </div>
                                  <div className='flex items-center justify-between'>
                                  <p className='text-sm text-black/50 font-medium'>{t('dashboard_rent_autoPayment')} </p>
                                  {
                                      rentalData.find((r)=> r._id === license.rentalId)?.deductionAuto ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          {t('dashboard_rent_enable')}
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive" className="flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          {t('dashboard_rent_disable')}
                                        </Badge>
                                      )
                                    }
                                  </div>
                                  <p className='text-sm text-black/50 font-medium'>{t('dashboard_rent_username')} <span className='text-black/80'>{license.username}</span></p>
                                  <p className='text-sm text-black/50 font-medium'>{t('dashboard_rent_computerName')} <span className='text-black/80'>{license.computerName}</span></p>
                                  <div className='flex items-center justify-between'>
                                    <p className='text-sm text-black/50 font-medium'>Code d'identification: <span className='text-black/80'>{license.computerCode}</span></p>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={()=> copyToClipboard(license.computerCode)} className='cursor-pointer'>
                                          <IoCopyOutline />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                      <p>{t('dashboard_rent_copy')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className='flex items-center justify-between'>
                                  <p className='text-sm text-black/50 font-medium'>{t('dashboard_rent_authenticationCode')} <span className='text-black/80'>{license.authCode}</span></p>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={()=> copyToClipboard(license.authCode)} className='cursor-pointer'>
                                          <IoCopyOutline />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                      <p>{t('dashboard_rent_copy')}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>{t('dashboard_rent_startDate')}</TableHead>
                                        <TableHead>{t('dashboard_rent_endDate')}</TableHead>
                                        <TableHead>{t('dashboard_rent_totalDays')}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {
                                        historyData.filter((e)=> e.registerId === license._id).map((l: any, i: any)=> (
                                          <TableRow key={i}>
                                            <TableCell>{formatDate(l.startAt)}</TableCell>
                                            <TableCell>{formatDate(l.expirationDate)}</TableCell>
                                            <TableCell>{getTotalLicenseDays(l.startAt, l.expirationDate)} {t('pay_03_j')}</TableCell>
                                          </TableRow>
                                        ))
                                      }
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 cursor-pointer" 
                              onClick={() => handleShow(license)}
                            >
                              <MdOutlineModeEdit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                            <DialogHeader>
                              <DialogTitle>{t('dashboard_rent_editLicenseInfo')}</DialogTitle>
                              <DialogDescription>
                                {t('dashboard_rent_updateLicenseInfo')}
                              </DialogDescription>
                            </DialogHeader>
                            <div>
                              <form className='grid gap-5 mt-2'>
                                <div className='grid gap-1'>
                                  <div className='flex items-center justify-between'>
                                    <p className='text-sm font-medium'>{t('dashboardClient_paymentStatus')}</p>
                                    {getStatusBadge(license)}
                                  </div>
                                      
                                  <div className='flex items-center justify-between'>
                                    <div>
                                      <h3 className='font-medium text-stone-800'>{license.userData?.name}</h3>
                                      <p className='text-xs text-black/40 font-medium'>{license.company}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid gap-3">
                                  <Label htmlFor="name">{t('dashboard_rent_userName')}</Label>
                                  <Input id="username" name="username" placeholder={t('dashboard_rent_userName')} value={formDataUpdate.username} onChange={handleChangeUpdate} />
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="nameComputer">{t('dashboard_rent_computerNameLabel')}</Label>
                                  <Input id="nameComputer" name="nameComputer" value={formDataUpdate.nameComputer} onChange={handleChangeUpdate} placeholder="yassine" defaultValue={license.computerName} />
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="codeComputer">{t('dashboard_rent_identificationCodeLabel')}</Label>
                                  <Input id="codeComputer" name="codeComputer" value={formDataUpdate.codeComputer} onChange={handleChangeUpdate} placeholder="yassine" defaultValue={license.computerCode} />
                                  <p className='text-xs font-medium'>{t('dashboard_rent_codeUpdateNotice')}</p>
                                </div>
                                <div className="grid gap-3">
                                  <Label htmlFor="date">{t('dashboard_rent_expirationDate')}</Label>
                                  <Input 
                                    id="date" 
                                    type='date' 
                                    name="date" 
                                    min={
                                      license.status.toLocaleLowerCase() === "active" || license.status.toLocaleLowerCase() === "expiring" ? 
                                        license.expirationDate.split("T")[0] 
                                      : 
                                        minDate
                                    } 
                                    defaultValue={license.expirationDate.split("T")[0]} 
                                    readOnly
                                  />
                                </div>
                              </form>
                            </div>
                            <DialogFooter>
                              {
                                (license.status.toLocaleLowerCase() !== "active" && license.status.toLocaleLowerCase() !== "expiring") && (
                                  <Button variant="outline">
                                    <MdDeleteOutline />
                                  </Button>
                                )
                              }
                              <DialogClose asChild>
                                <Button variant="outline">{t('dashboardAdmin_users_cancel')}</Button>
                              </DialogClose>
                              {/*<Button variant="outline">Mise à jour l'abonnement</Button>*/}
                              <DialogClose asChild>
                                <Button onClick={()=> handleUpdateRegistration(license._id)}>{t('dashboardAdmin_users_save')}</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {
                          license.isExpired && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                              <MdDeleteOutline className="h-4 w-4" />
                            </Button>
                          )
                        }
                      </div>
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

export default LicensesClient;