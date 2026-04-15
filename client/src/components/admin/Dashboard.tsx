import Card from '@/components/dashboard/Card';
import { ChartLineMultiple } from '@/components/dashboard/ChartLine';
import Shortcuts from '@/components/dashboard/Shortcuts'
import { useEffect, useMemo, useState } from 'react'
import { AiFillDollarCircle } from 'react-icons/ai';
import { FaUsers } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { HiRefresh } from 'react-icons/hi';
import { IoTicketSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from '@/utils/formatNumber';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  payment, 
  users, 
  Download, 
  Contact,
  facturesData, 
  // products 
} from '@/data/mockData';
import { formatDate } from '@/utils/formatDate';
import Loading from '../elements/Loading';
import { useLanguage } from '@/lang/LanguageProvider';
import countries from "@/data/countries.json"
import { IoIosInformationCircleOutline } from 'react-icons/io';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


const platforms = [
  { name: "autocad", color: "#4A3AFF" },
  // { name: "revit", color: "#C893FD" },
  { name: "zwcad", color: "#1E1B39" },
];

function getMonthlyStats(
  payments: { createdAt: string | number | Date; totalPricePay: number }[],
  downloads: { createdAt: string | number | Date }[]
) {
  // Helper to get month name in French (e.g. "octobre")
  const getMonthName = (date: Date) =>
    date.toLocaleString('fr-FR', { month: 'long' });

  // Helper to get "YYYY-MM" for easy sorting and matching
  const getMonthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

  // Get today and calculate last 6 months keys
  const today = new Date();
  const last6MonthsKeys = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6MonthsKeys.push(getMonthKey(d));
  }

  // Initialize stats map with zero values for last 6 months
  const statsMap: Record<
    string,
    { amount: number; download: number; monthName: string }
  > = {};
  last6MonthsKeys.forEach((key) => {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 1);
    statsMap[key] = { amount: 0, download: 0, monthName: getMonthName(date) };
  });

  // Sum payments by month
  payments.forEach(({ createdAt, totalPricePay }) => {
    const date = new Date(createdAt);
    const key = getMonthKey(date);
    if (statsMap[key]) {
      statsMap[key].amount += totalPricePay;
    }
  });

  // Count downloads by month
  downloads.forEach(({ createdAt }) => {
    const date = new Date(createdAt);
    const key = getMonthKey(date);
    if (statsMap[key]) {
      statsMap[key].download += 1;
    }
  });

  // Convert to array sorted by date ascending
  return last6MonthsKeys.map((key) => ({
    month: statsMap[key].monthName,
    amount: statsMap[key].amount,
    download: statsMap[key].download,
  }));
}

const DashboardAdmin = () => {
  const { t } = useLanguage();
  const [usersData, setusersData] = useState<any>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [FacturesData, setFacturesData] = useState<any[]>([]);
  const [download, setDownload] = useState<any[]>([]);
  const [contact, setContact] = useState<any[]>([]);
  // const [productData, setProduct] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(()=> {
    const getData = async () => {
      try {
        const getUsers = await users();
        const getPayment = await payment();
        const getDownload = await Download();
        const getContact = await Contact();
        const getfactures = await facturesData();
        // const getProduct = await products();

        // setProduct(getProduct)
        setFacturesData(getfactures || [])
        setpaymentData(getPayment);
        setusersData(getUsers);
        setDownload(getDownload);
        setContact(getContact)
      } catch (error) {
        //console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [loading])

  const [cardsAnalytics, setcardsAnalytics] = useState<any []>([]);

  const totalThisMonth = paymentData
  ?.filter((item) => {
    const createdDate = new Date(item.createdAt);
    const now = new Date();

    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  })
  .reduce((sum, item) => sum + item.totalPricePay, 0);

  useEffect(()=> {
    if(loading) return;
    setcardsAnalytics([
      {
        title: t("dashboardAdmin_totalUsers_client"),
        icon: FaUsers,
        value: usersData?.filter((e: any) => e.role !== "admin")?.length,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 8.4,
        isDark: true,
        isPercent: false,
        path: "/tableau-de-board/utilisateurs",
        parag: t("dashboardAdmin_totalActiveUsers")
      },
      {
        title: t("dashboardAdmin_monthlyRevenue"),
        icon: AiFillDollarCircle,
        value: totalThisMonth,
        isGrowth: false,
        isCurrency: true,
        valueGrowth: 1.5,
        isDark: false,
        isPercent: true,
        path: "/tableau-de-board/paiements",
        parag: t("dashboardAdmin_totalAmountThisMonth"),
      },
      {
        title: t("dashboardAdmin_supportTickets"),
        icon: IoTicketSharp,
        value: contact?.length,
        isGrowth: false,
        isCurrency: false,
        valueGrowth: 23,
        isDark: false,
        isPercent: true,
        path: "",
        parag: t("dashboardAdmin_supportRequests"),
      },
    ])
  }, [loading, t])

  const [lastPayments, setLastPayments] = useState<any []>([]);

  useEffect(()=> {
    setLastPayments(paymentData?.slice(0, 10))
  }, [loading])

  const totalAmount = lastPayments?.slice(0, 10).reduce((curr, arr)=> curr + arr.totalPricePay, 0).toFixed(2) || 0

  const [mostUse, setMostUse] = useState<any []>([]);

  const downloadsPerPlatform = download.reduce((acc, entry) => {
    const platform = entry.productId?.platform?.toLowerCase();
    if (!platform) return acc;
  
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  useEffect(() => {
    const mostUseData = platforms.map(({ name, color }) => ({
      name,
      value: downloadsPerPlatform[name] || 0,
      color,
    }));
  
    setMostUse(mostUseData);
  }, [download]);

  const totalDownloadsPlatform = mostUse.reduce((curr, arr)=> curr + arr.value, 0)

  // variable download
  const [countryChartData, setCountryChartData] = useState([]);

  const processCountryData = () => {
    // Count downloads per country
    const countryCounts = download.reduce((acc, download) => {
      const countryCode = download.country; // "MA", "FR", etc.
      acc[countryCode] = (acc[countryCode] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and calculate percentages
    const totalDownloads = download.length;
    const countryData = Object.entries(countryCounts)
      .map(([countryCode, count]: any) => ({
        countryCode,
        country: countries.find((e)=> e.code === countryCode)?.name, // Convert code to full name
        visitors: (count / totalDownloads) * 100,
        count: count
      }))
      .sort((a, b) => b.visitors - a.visitors); // Sort by percentage descending

    // Group small countries into "Autre" (Other)
    const threshold = 5; // Minimum percentage to show individually
    const mainCountries = countryData.filter(item => item.visitors >= threshold);
    const otherCountries = countryData.filter(item => item.visitors < threshold);
    
    const otherTotal = otherCountries.reduce((sum, item) => sum + item.visitors, 0);
    const otherCount = otherCountries.reduce((sum, item) => sum + item.count, 0);

    // Prepare final data with colors
    const finalData: any = [
      ...mainCountries.map((item, index) => ({
        country: item.country,
        visitors: Number(item.visitors.toFixed(2)), // Round to 2 decimals
        count: item.count,
        fill: `var(--chart-${index + 1})`
      }))
    ];

    // Add "Autre" category if there are small countries
    if (otherTotal > 0) {
      finalData.push({
        country: "Autre",
        visitors: Number(otherTotal.toFixed(2)),
        count: otherCount,
        fill: `var(--chart-${finalData.length + 1})`
      });
    }

    setCountryChartData(finalData);
  };

  useEffect(() => {
    if (download.length > 0) {
      processCountryData();
    }
  }, [download]);

  const [chartData, setChartData] = useState<any []>([]);

  useEffect(()=> {
    setChartData(getMonthlyStats(paymentData, download))
  }, [loading]);

  // Process data to group downloads by country with user information
  const countryUsers = useMemo(() => {
    if (!download || !usersData) return [];

    // Group downloads by country
    const downloadsByCountry = download.reduce((acc, download) => {
      const country = download.country || 'Unknown';
      
      if (!acc[country]) {
        acc[country] = [];
      }

      // Find user info if userId exists
      let userInfo = { email: 'Unknown', name: 'Unknown' };

      if (usersData) {        
        // Priorité 1: Utiliser download.userId s'il existe
        const userCheck = usersData.find((e: { _id: any; })=> e._id === download?.userId?._id)
        if (userCheck?.email || userCheck?.name) {
          userInfo = { 
            email: userCheck.email || "Unknown", 
            name: userCheck.name || "Unknown"
          };
        }  else if (download.ip) {
          const user = usersData.find((e: any) => e?.ipAdresse === download.ip);
          
          if (user && user.name) {
            userInfo = { 
              email: user.email || "Unknown", 
              name: user.name || "Unknown"
            };
          }
        }
      }

      acc[country].push({
        email: userInfo.email,
        name: userInfo.name,
        downloadDate: download.createdAt,
        ip: download.ip,
        platform: `${download.productId? `${download.productId.platform} - ${download.productId?.version}` : "ZWCAD - v1.1"}`
      });


      return acc;
    }, {});

    // Convert to array and sort by number of downloads (descending)
    return Object.entries(downloadsByCountry)
      .map(([country, users]: any) => {
        // Get full country name from countryData
        const countryInfo = countries?.find(c => c.code === country);
        const countryLabel = countryInfo?.name || country;
        
        return {
          country: countryLabel,
          countryCode: country,
          users: users,
          downloadCount: users.length
        };
      })
      .sort((a, b) => b.downloadCount - a.downloadCount);
  }, [download, usersData]);

  // Get country color from your chart data
  const getCountryColor = (countryCode: string) => {
    const countryChart: any = countryChartData?.find((c: any) => c.country === countryCode);
    return countryChart?.fill || '#6b7280';
  };
  

  if(loading) {
    return <Loading />
  }
  return (
    <div className='mb-5 flex flex-col gap-5'>
      <Shortcuts />
      <div className='grid grid-cols-2 max-md:grid-cols-1 gap-5'>
        <div className='grid grid-cols-2 max-md:grid-cols-1 gap-5'>
          {
            cardsAnalytics.map((analytic, index)=> (
              <Card 
                key={index} 
                analytic={analytic} 
              />
            ))
          }
        </div>
        <div className='bg-white rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg'>
          <h4 className='font-bold text-sm w-1/2 px-6'>{t("dashboardAdmin_analyzeViewsDownloads")}</h4>
          <ChartLineMultiple chartData={chartData} />
          <div className='flex items-center gap-6 px-6'>
            <div className='flex items-center gap-2'>
              <div className='bg-[#b9c5ec] h-4 w-4 rounded-full'></div>
              <p className='font-bold text-xs'>{t("dashboardAdmin_amount")}</p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='bg-[#4a3aff] h-4 w-4 rounded-full'></div>
              <p className='font-bold text-xs'>{t("dashboardAdmin_download")}</p>
            </div>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 max-md:grid-cols-1 gap-5'>
        <div className='bg-white p-7 rounded-2xl transition-all duration-200 hover:shadow-lg'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='font-bold text-sm'>{t("dashboardAdmin_latestPayments")}</h4>
              <p className='font-medium text-xs text-black/40 w-8/12'>{t("dashboardAdmin_latestTransactionsDesc")}</p>
            </div>
            <div className='flex items-center gap-4'>
              <Link to="/tableau-de-board/paiements">
                <FiExternalLink />
              </Link>
              <HiRefresh />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboardClient_paymentId")}</TableHead>
                <TableHead>{t("dashboardClient_paymentDate")}</TableHead>
                <TableHead>{t("dashboardAdmin_username")}</TableHead>
                <TableHead>{t("dashboardClient_paymentAmount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lastPayments.slice(0, 9).map((invoice, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{FacturesData.find((e)=> e.payId._id === invoice._id)?.factureId || ""}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell>{usersData.find((e: any)=> e._id === invoice.userId)?.name}</TableCell>
                    <TableCell className="text-right font-medium">€ {invoice.totalPricePay}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>{t("dashboardClient_total")}</TableCell>
                <TableCell className="text-right font-medium">€ {totalAmount}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
        <div className='flex flex-col gap-5'>
          <div className='bg-white p-7 rounded-2xl flex justify-between items-start gap-4 transition-all duration-200 hover:shadow-lg'>
            <div className='flex flex-col gap-7 w-1/2'>
              <div>
                <h4 className='font-bold text-sm'>{t("dashboardAdmin_mostUsedSoftwares")}</h4>
                <p className='font-medium text-xs text-black/40'>{t("dashboardAdmin_mostUsedSoftwaresDesc")}</p>
              </div>
              <div className='flex flex-col gap-3'>
                {
                  mostUse.map((use, i)=> (
                    <div key={i} className='flex items-center justify-between gap-5'>
                      <div className='flex items-center gap-2'>
                        <div className={`h-2 w-2 rounded-full`} style={{ backgroundColor: use.color }}></div>
                        <h6 className='font-bold text-[13px] text-black/50'>{use.name.toUpperCase()}</h6>
                      </div>
                      <p className='text-sm font-medium text-black/30'>{formatNumber(use.value)}</p>
                    </div>
                  ))
                }
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <h6 className='font-medium text-sm'>{t("dashboardAdmin_totalUsersCount")}</h6>
                  </div>
                  <p className='text-sm font-medium'>{formatNumber(totalDownloadsPlatform)}</p>
                </div>
              </div>
            </div>
            <div className='relative w-1/2 h-full flex justify-center items-center'>
              <div 
                className='w-44 h-44 absolute top-[8%] right-[13%] rounded-full bg-[#4A3AFF] text-2xl flex justify-center items-center font-bold text-white border-2 border-white'
              >
                {
                  mostUse.find((e)=> e?.name.toLowerCase() === 'autocad')?.value ?
                    ((100 * mostUse.find((e)=> e?.name.toLowerCase() === 'autocad')?.value) / totalDownloadsPlatform).toFixed(0)
                  :
                    0
                }%
              </div>
              {/*<div 
                className='w-28 h-28 absolute top-[10%] right-[-13px] rounded-full bg-[#C893FD] text-xl flex justify-center items-center font-bold text-white border-6 border-white'
              >
                {
                  mostUse.find((e)=> e?.name.toLowerCase() === 'revit')?.value ?
                    ((100 * mostUse.find((e)=> e?.name.toLowerCase() === 'revit')?.value) / totalDownloadsPlatform).toFixed(0)
                  :
                    0
                }%
              </div>*/}
              <div 
                className='w-18 h-18 absolute bottom-[15%] right-2 rounded-full bg-[#1E1B39] flex justify-center items-center font-bold text-white border-6 border-white'
              >
                {
                  mostUse.find((e)=> e?.name.toLowerCase() === 'zwcad')?.value ?
                    ((100 * mostUse.find((e)=> e?.name.toLowerCase() === 'zwcad')?.value) / totalDownloadsPlatform).toFixed(0)
                  :
                    0
                }%
              </div>
            </div>
          </div>
          <div className='flex gap-5 flex-nowrap max-md:flex-wrap'>
            <div className='bg-white p-5 rounded-2xl w-[50%] max-md:w-full flex flex-col justify-between transition-all duration-200 hover:shadow-lg'>
              <h4 className='font-bold text-sm'>{t("dashboardAdmin_emailOpenRate")}</h4>
              <p className='font-medium text-6xl text-center py-10'>14%</p>
              <div className='flex flex-col gap-2'>
                <Select>
                  <SelectTrigger className='w-full text-xs'>
                    <SelectValue placeholder="Email Campaigne Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tous">{t("dashboardAdmin_all")}</SelectItem>
                    <SelectItem value="Newsletter">{t("dashboardAdmin_newsletter")}</SelectItem>
                    <SelectItem value="mise-a-jour">{t("dashboardAdmin_update")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-[10px] font-medium text-black/30 text-center'>{t("dashboardAdmin_selectCompanyType")}</p>
              </div>
            </div>
            <div className='bg-white p-5 rounded-2xl w-[50%] max-md:w-full transition-all duration-200 hover:shadow-lg'>
              <div>
                <div className='flex items-center gap-2'>
                  <h4 className='font-bold text-sm'>{t("dashboardAdmin_topCountry")}</h4>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="hover:text-blue-600 transition-colors">
                        <IoIosInformationCircleOutline className="w-5 h-5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                          {t("dashboardAdmin_topCountry")}
                        </DialogTitle>
                        <DialogDescription>
                          <p className="text-xs text-gray-600">
                            Liste détaillée des utilisateurs ayant téléchargé Ferracad, classée par pays.<br />
                            <span className='font-medium'>Nombre total de téléchargements: {download?.length || 0}</span>
                          </p>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="">
                        <div className="space-y-4">
                          {countryUsers.length > 0 ? (
                            countryUsers.map((countryData, index) => (
                              <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <div 
                                    style={{ backgroundColor: getCountryColor(countryData.countryCode) }} 
                                    className='w-3 h-3 rounded-full flex-shrink-0'
                                  ></div>
                                  <h3 className="font-semibold text-gray-800">
                                    {countryData.country}
                                  </h3>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({countryData.downloadCount} Téléchargements)
                                  </span>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {countryData.users.map((user: any, userIndex: number) => (
                                    <div 
                                      key={userIndex} 
                                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                    >
                                      <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full"></div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-700">
                                          {user.name} <span className=''>({user.platform?.toUpperCase()})</span>
                                        </p>
                                          {
                                            user.email !== "Unknown" && (
                                              <p className="text-xs font-medium mt-1 text-gray-400">
                                                {user.email}
                                              </p>
                                            )
                                          }
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-gray-400">
                                            {new Date(user.downloadDate).toLocaleDateString()}
                                          </span>
                                          <span className="text-xs text-gray-400">•</span>
                                          <span className="text-xs text-gray-400">
                                            IP: {user.ip}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No download data available.
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>


                </div>
                <p className='font-medium text-xs text-black/40'>{t("dashboardAdmin_topCountryDesc")}</p>
              </div>
              <div className='mt-2 items-center justify-between'>
                <div className='flex flex-col gap-2'>
                  {
                    countryChartData?.slice(0, 5)?.map((country: any, i: number)=> (
                      <div key={i} className='flex items-center justify-between gap-3 w-full'>
                        <div className='flex items-center gap-2'>
                          <div style={{ backgroundColor: country.fill }} className='w-2 h-2 rounded-full'></div>
                          <p className='text-sm text-black/50'>{country.country}</p>
                        </div>
                        <p className='text-right text-sm text-black/50 font-medium'>{country.visitors}%</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin;