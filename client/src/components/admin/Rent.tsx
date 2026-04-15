import React, { useEffect, useState } from "react";
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
import {
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type LicenseHistory,
  coupon,
  licenseHistory,
  payment,
  registrations,
  rentals,
  users,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  MdDeleteOutline,
  MdKey,
  // MdLoop,
  MdOutlineModeEdit,
} from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import CardDetails from "@/components/dashboard/Card";
import { Button } from "@/components/ui/button";
import { IoCloseCircleOutline, IoCopyOutline } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { AiFillEuroCircle } from "react-icons/ai";
import { getTotalLicenseDays } from "@/utils/getTotalLicenseDays";
import { formatDate } from "@/utils/formatDate";
import apiClient from "@/services/api";
import { toast } from "sonner";
import Loading from "../elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import { FaRegClock } from "react-icons/fa";
import FilterByType from "../dashboard/FilterByType";
import { useLocation } from "react-router-dom";

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

const LicensesAdmin: React.FC = () => {
  const { t } = useLanguage();
  const [rentalData, setRentalData] = useState<any[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [userData, setuserData] = useState<any[]>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [historyData, sethistoryData] = useState<any[]>([]);
  const [_, setcouponData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ChangeUp, setChangeUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formDataUpdate, setformDataUpdate] = useState({
    nameComputer: "",
    codeComputer: "",
    username: "",
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await users();
        const getPayment = await payment();
        const getHistoryLicense = await licenseHistory();
        const getCoupon = await coupon();

        setRentalData(getRentls || []);
        setregistrationData(getRegistrations || []);
        setuserData(getUser || []);
        setpaymentData(getPayment || []);
        sethistoryData(getHistoryLicense || []);
        setcouponData(getCoupon || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [ChangeUp, loading]);

  const enrichedLicenses = registrationData
    .map((license) => {
      const user = userData.find((u) => u._id === license.userId);
      const licenseHistories = historyData.find(
        (e) => e.registerId === license._id
      );
      const expirationDate = new Date(license.expirationDate);
      const now = new Date();
      const isExpired = expirationDate < now;
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...license,
        user,
        isExpired,
        licenseHistories,
        daysUntilExpiration,
        status:
          license.status === "freetrial"
            ? "Période d'essai"
            : isExpired
            ? "expired"
            : license.status === "pending"
            ? "pending"
            : "active",
      };
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const filteredLicenses = enrichedLicenses.filter((e) => e.status !== "expired").filter(
    (license) =>
      license.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.computerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeLicenses = enrichedLicenses.filter(
    (l) => l.status === "active"
  ).length;
  // const expiringLicenses = enrichedLicenses.filter(
  //   (l) => l.status === "expiring"
  // ).length;
  const expiredLicenses = enrichedLicenses.filter(
    (l) => l.status === "expired"
  ).length;

  const getStatusBadge = (license: (typeof enrichedLicenses)[0]) => {
    const status = license.status.toLocaleLowerCase();
  
    if (status === "période d'essai") {
      return (
        <Badge
          variant="secondary"
          className="bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-1"
        >
          <FaRegClock className="h-3 w-3" />
          Période d'essai
        </Badge>
      );
    } else if (status === "pending") {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
        >
          <FaRegClock className="h-3 w-3" />
          Pending
        </Badge>
      );
    } else if (status === "expired") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("dashboardClient_orders_expired")}
        </Badge>
      );
    } else if (status === "expiring") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          {t("dashboardClient_orders_expiring_soon")}
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          {t("dashboardClient_orders_active")}
        </Badge>
      );
    }
  };

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([]);

  useEffect(() => {
    setQuickAnalytic([
      {
        title: t("dashboardClient_orders_total_licenses"),
        icon: MdKey,
        value: enrichedLicenses.length,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_rent_registeredLicenses"),
        path: "/tableau-de-board/locations",
      },
      {
        title: t("dashboard_rent_active"),
        icon: IoMdCheckmarkCircleOutline,
        value: activeLicenses,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: true,
        isPercent: false,
        parag: t("dashboard_rent_activeDescription"),
        path: "/tableau-de-board/locations?filter=active",
      },
      // {
      //   title: t("dashboard_rent_expiringSoon"),
      //   icon: MdLoop,
      //   value: expiringLicenses,
      //   isGrowth: true,
      //   isCurrency: false,
      //   valueGrowth: 2,
      //   isDark: false,
      //   isPercent: false,
      //   parag: t("dashboard_rent_expiringSoonDescription"),
      //   path: "/tableau-de-board/locations?filter=expiring",
      // },
      {
        title: t("dashboard_rent_expired"),
        icon: IoCloseCircleOutline,
        value: expiredLicenses,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: true,
        isPercent: false,
        parag: t("dashboard_rent_expiredDescription"),
        path: "/tableau-de-board/locations?filter=expired",
      },
    ]);
  }, [loading, t]);

  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);

    const formattedDate = today.toISOString().split("T")[0];
    setMinDate(formattedDate);
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t("dashboardClient_orders_code_copied"));
      })
      .catch(() => {
        toast.warning(t("dashboardClient_orders_error_retry"));
      });
  };

  const totalPriceSpendLicense = (license: any) => {
    /*const totalDaysSpend = calculateTotalDays(
      historyData.filter((e) => e.registerId === license._id)
    );*/
    const paymentId = rentalData.find((e) => e._id === license.rentalId);
    const getPaymentData = paymentData.find((e)=> e._id === paymentId?.payId)
    if(!getPaymentData?._id) {
      return 0
    }

    let totalPrice = getPaymentData.totalPricePay;

    return totalPrice;
  };

  const handleShow = (license: {
    computerName: any;
    computerCode: any;
    username: any;
  }) => {
    setformDataUpdate({
      nameComputer: license.computerName,
      codeComputer: license.computerCode,
      username: license.username,
    });
  };

  const handleChangeUpdate = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setformDataUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateRegistration = async (id: any) => {
    if (
      !formDataUpdate.codeComputer ||
      !formDataUpdate.nameComputer ||
      !formDataUpdate.username
    ) {
      toast.warning(t("dashboard_rent_fillRequiredFields"));
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.put(`/registration/${id}`, formDataUpdate);
      if (res.status === 200) {
        toast.success(t("dashboardClient_orders_operationSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error) {
      toast.warning(t("dashboardClient_orders_errorOccurred"));
    } finally {
      setChangeUp(!ChangeUp);
      setLoading(false);
    }
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterLicence = searchParams.get("filter");

  const [companySelected, setCompanySelected] = useState("");
  const [typeSelected, setTypeSelected] = useState("Touts");

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("dashboard_rent_licensesRental")}
          </h2>
          <p className="text-sm text-black/40">
            {t("dashboard_rent_manageLicenses")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QuickAnalytic.map((analytic, index) => (
          <CardDetails key={index} analytic={analytic} />
        ))}
      </div>

      {/* Licenses Table */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle>
            {t("dashboard_rent_registeredLicensesOverview")}
          </CardTitle>
          <CardDescription>
            {t("dashboard_rent_licensesOverviewDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboardClient_orders_search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <FilterByType
            setCompanySelected={setCompanySelected}
            companySelected={companySelected}
            setTypeSelected={setTypeSelected}
            typeSelected={typeSelected}
            className="mb-5"
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboardClient_orders_user")}</TableHead>
                  <TableHead>
                    {t("dashboardClient_orders_computer_name")}
                  </TableHead>
                  <TableHead>
                    {t("dashboardClient_orders_expiration_date")}
                  </TableHead>
                  <TableHead>{t("dashboardClient_orders_status")}</TableHead>
                  <TableHead>{t("dashboardClient_orders_days_left")}</TableHead>
                  <TableHead>{t("dashboardClient_orders_action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses
                  .filter((e) =>
                    filterLicence ? e.status === filterLicence : true
                  )
                  .filter(
                    (e: any) =>
                      e?.user?.company
                        ?.toLowerCase()
                        .includes(companySelected.toLowerCase()) ||
                      e?.user?.name
                        ?.toLowerCase()
                        .includes(companySelected.toLowerCase())
                  )
                  .filter((e) => {
                    if (typeSelected === "Touts") return true;
                    if (typeSelected === "Société") return !!e.user.nTva;
                    if (typeSelected === "Individual") return !e.user.nTva;
                    return true;
                  })
                  .map((license) => (
                    <TableRow key={license._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{license.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {license.company}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {license.computerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {license.computerCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(license.expirationDate)}
                      </TableCell>
                      <TableCell>{getStatusBadge(license)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm",
                            license.status === "expired" && "text-red-600",
                            license.status === "expiring" && "text-yellow-600",
                            license.status === "active" && "text-green-600"
                          )}
                        >
                          {license.isExpired
                            ? `${t(
                                "dashboardClient_orders_left_days"
                              )} ${Math.abs(license.daysUntilExpiration)} ${t(
                                "dashboardClient_orders_days_ago"
                              )}`
                            : `${license.daysUntilExpiration} ${t("pay_03_j")}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("dashboard_rent_licenseDetails")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t(
                                    "dashboard_rent_licenseDetailsDescription"
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4">
                                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                                  <CardDetails
                                    analytic={{
                                      title: t("dashboard_rent_totalDaysUsed"),
                                      icon: MdKey,
                                      value: `${calculateTotalDays(
                                        historyData.filter(
                                          (e) => e.registerId === license._id
                                        )
                                      )} Jours`,
                                      isGrowth: true,
                                      isCurrency: false,
                                      valueGrowth: 2,
                                      isDark: true,
                                      isPercent: false,
                                      parag: t("dashboard_rent_totalUsageDays"),
                                    }}
                                  />
                                  <CardDetails
                                    analytic={{
                                      title: t("dashboard_rent_totalReceived"),
                                      icon: AiFillEuroCircle,
                                      value: totalPriceSpendLicense(license),
                                      isGrowth: true,
                                      isCurrency: true,
                                      valueGrowth: 2,
                                      isDark: false,
                                      isPercent: false,
                                      parag: t(
                                        "dashboard_rent_totalAmountReceived"
                                      ),
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium text-stone-800">
                                    {license.user?.name || license.username}{" "}
                                    <small>
                                      (€ {totalPriceSpendLicense(license)})
                                    </small>
                                  </h3>
                                  <p className="text-xs text-black/40 font-medium">
                                    {license.company}
                                  </p>
                                  <div className="mt-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-black/50 font-medium">
                                        {t("dashboard_rent_licenseStatus")}{" "}
                                      </p>
                                      {getStatusBadge(license)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-black/50 font-medium">
                                        {t("dashboard_rent_autoPayment")}{" "}
                                      </p>
                                      {rentalData.find(
                                        (r) => r._id === license.rentalId
                                      )?.deductionAuto ? (
                                        <Badge
                                          variant="default"
                                          className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1"
                                        >
                                          <CheckCircle className="h-3 w-3" />
                                          {t("dashboard_rent_enable")}
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="destructive"
                                          className="flex items-center gap-1"
                                        >
                                          <AlertTriangle className="h-3 w-3" />
                                          {t("dashboard_rent_disable")}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-black/50 font-medium">
                                      {t("dashboard_rent_username")}{" "}
                                      <span className="text-black/80">
                                        {license.username}
                                      </span>
                                    </p>
                                    <p className="text-sm text-black/50 font-medium">
                                      {t("dashboard_rent_computerName")}{" "}
                                      <span className="text-black/80">
                                        {license.computerName}
                                      </span>
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-black/50 font-medium">
                                        {t("dashboard_rent_identificationCode")}{" "}
                                        <span className="text-black/80">
                                          {license.computerCode}
                                        </span>
                                      </p>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() =>
                                              copyToClipboard(
                                                license.computerCode
                                              )
                                            }
                                            className="cursor-pointer"
                                          >
                                            <IoCopyOutline />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{t("dashboard_rent_copy")}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-black/50 font-medium">
                                        {t("dashboard_rent_authenticationCode")}{" "}
                                        <span className="text-black/80">
                                          {license.authCode}
                                        </span>
                                      </p>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() =>
                                              copyToClipboard(license.authCode)
                                            }
                                            className="cursor-pointer"
                                          >
                                            <IoCopyOutline />
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{t("dashboard_rent_copy")}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>
                                            {t("dashboard_rent_startDate")}
                                          </TableHead>
                                          <TableHead>
                                            {t("dashboard_rent_endDate")}
                                          </TableHead>
                                          <TableHead>
                                            {t("dashboard_rent_totalDays")}
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {historyData
                                          .filter(
                                            (e) => e.registerId === license._id
                                          )
                                          .map((l: any, i: any) => (
                                            <TableRow key={i}>
                                              <TableCell>
                                                {formatDate(l.startAt)}
                                              </TableCell>
                                              <TableCell>
                                                {formatDate(l.expirationDate)}
                                              </TableCell>
                                              <TableCell>
                                                {getTotalLicenseDays(
                                                  l.startAt,
                                                  l.expirationDate
                                                )}{" "}
                                                {t("pay_03_j")}
                                              </TableCell>
                                            </TableRow>
                                          ))}
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
                                onClick={() => handleShow(license)}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                              >
                                <MdOutlineModeEdit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("dashboard_rent_editLicenseInfo")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t("dashboard_rent_updateLicenseInfo")}
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <form className="grid gap-5 mt-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h3 className="font-medium text-stone-800">
                                        {license.user?.name || license.username}
                                      </h3>
                                      <p className="text-xs text-black/40 font-medium">
                                        {license?.company}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid gap-3">
                                    <Label htmlFor="name">
                                      {t("dashboard_rent_userName")}
                                    </Label>
                                    <Input
                                      id="username"
                                      name="username"
                                      placeholder={t("dashboard_rent_userName")}
                                      value={formDataUpdate.username}
                                      onChange={handleChangeUpdate}
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="nameComputer">
                                      {t("dashboard_rent_computerNameLabel")}
                                    </Label>
                                    <Input
                                      id="nameComputer"
                                      name="nameComputer"
                                      placeholder={t(
                                        "dashboard_rent_computerNameLabel"
                                      )}
                                      value={formDataUpdate.nameComputer}
                                      onChange={handleChangeUpdate}
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="codeComputer">
                                      {t(
                                        "dashboard_rent_identificationCodeLabel"
                                      )}
                                    </Label>
                                    <Input
                                      id="codeComputer"
                                      name="codeComputer"
                                      placeholder={t(
                                        "dashboard_rent_identificationCodeLabel"
                                      )}
                                      value={formDataUpdate.codeComputer}
                                      onChange={handleChangeUpdate}
                                    />
                                  </div>
                                  <div className="grid gap-3">
                                    <Label htmlFor="date">
                                      {t("dashboard_rent_expirationDate")}
                                    </Label>
                                    <Input
                                      id="date"
                                      type="date"
                                      name="date"
                                      min={
                                        license.status.toLocaleLowerCase() ===
                                          "active" ||
                                        license.status.toLocaleLowerCase() ===
                                          "expiring"
                                          ? license.expirationDate.split("T")[0]
                                          : minDate
                                      }
                                      defaultValue={
                                        license.expirationDate.split("T")[0]
                                      }
                                      readOnly
                                    />
                                  </div>
                                </form>
                              </div>
                              <DialogFooter>
                                {license.status.toLocaleLowerCase() !==
                                  "active" &&
                                  license.status.toLocaleLowerCase() !==
                                    "expiring" && (
                                    <Button variant="outline">
                                      <MdDeleteOutline />
                                    </Button>
                                  )}
                                <DialogClose asChild>
                                  <Button variant="outline">
                                    {t("dashboardAdmin_users_cancel")}
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button
                                    onClick={() =>
                                      handleUpdateRegistration(license._id)
                                    }
                                  >
                                    {t("dashboardAdmin_users_save")}
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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

export default LicensesAdmin;
