import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, CheckCircle, XCircle } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  coupon,
  payment,
  registrations,
  rentals,
  users,
  facturesData,
} from "@/data/mockData";
import {
  PiFilePdfBold,
  PiTrashBold,
  PiWarningCircleBold,
} from "react-icons/pi";
import { GrTransaction } from "react-icons/gr";
import { AiFillDollarCircle } from "react-icons/ai";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { VscError } from "react-icons/vsc";
import CardDetails from "@/components/dashboard/Card";
import Facture from "@/components/dashboard/Facture";
import { toast } from "sonner";
import { useLanguage } from "@/lang/LanguageProvider";
import FilterByType from "../dashboard/FilterByType";
import { MdDeleteOutline } from "react-icons/md";
import apiClient from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PaymentsAdmin: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [rentalData, setRentalData] = useState<any[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [userData, setuserData] = useState<any[]>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [couponData, setcouponData] = useState<any[]>([]);
  const [FacturesData, setFacturesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await users();
        const getPayment = await payment();
        const getCoupon = await coupon();
        const getfactures = await facturesData();

        setFacturesData(getfactures || []);
        setRentalData(getRentls || []);
        setregistrationData(getRegistrations || []);
        setuserData(getUser || []);
        setpaymentData(getPayment || []);
        setcouponData(getCoupon || []);
      } catch (error) {
        // console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
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
    setOpenFacture(pay);
    setAutoSendFacture(true);
  }, [loading, location.state, rentalData, paymentData]);

  const enrichedPayments = paymentData.map((payment) => {
    const facture = FacturesData.find((e) => e.payId._id === payment._id);
    const rentalInfos = rentalData.filter((e) => e.payId === payment._id);
    const registerInfos = registrationData.filter(
      (e) => e.rentalId === rentalData.find((e) => e.payId === payment._id)?._id
    );
    const coupon = couponData.find((u) => u._id === payment.couponId);
    const user = userData.find((u) => u._id === payment.userId);
    return {
      ...payment,
      user,
      facture,
      coupon,
      registerInfos,
      rentalInfos,
    };
  });

  const filteredPayments = enrichedPayments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      payment.user?.name?.toLowerCase().includes(searchLower) ||
      payment.user?.email?.toLowerCase().includes(searchLower) ||
      payment.operatorId?.toLowerCase().includes(searchLower) ||
      payment.facture?.factureId?.toLowerCase().includes(searchLower) ||
      false;

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.type === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalRevenue = paymentData
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.totalPricePay, 0);

  const successfulPayments = paymentData.filter(
    (p) => p.status === "success"
  ).length;
  const failedPayments = paymentData.filter(
    (p) => p.status === "unsuccess"
  ).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === "success") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-200"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          {t("dashboardClient_success")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" />
          {t("dashboardClient_failed")}
        </Badge>
      );
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    if (method === "stripe") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Stripe
        </Badge>
      );
    } else if (method === "paypal") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          PayPal
        </Badge>
      );
    } else if (method === "free") {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          {t("dashboard_payment_free")}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {t("dashboard_payment_cash")}
        </Badge>
      );
    }
  };

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([]);

  useEffect(() => {
    setQuickAnalytic([
      {
        title: t("dashboard_payment_totalRevenue"),
        icon: AiFillDollarCircle,
        value: totalRevenue,
        isGrowth: true,
        isCurrency: true,
        valueGrowth: 12.5,
        isDark: true,
        isPercent: false,
        parag: t("dashboard_payment_totalRevenueDescription"),
      },
      {
        title: t("dashboard_payment_transactions"),
        icon: GrTransaction,
        value: paymentData.length,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_payment_totalPayments"),
      },
      {
        title: t("dashboard_payment_successful"),
        icon: IoMdCheckmarkCircleOutline,
        value: successfulPayments,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: true,
        isPercent: false,
        parag: `${Math.round(
          (successfulPayments / paymentData.length) * 100
        )}% ${t("dashboard_payment_successRate")}`,
      },
      {
        title: t("dashboard_payment_failed"),
        icon: VscError,
        value: failedPayments,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_payment_failedDescription"),
      },
    ]);
  }, [loading, t]);

  const [companySelected, setCompanySelected] = useState("");
  const [typeSelected, setTypeSelected] = useState("Touts");

  const handleDelete = async (id: any) => {
    try {
      if (!id) return;
      setLoading(true)
      const res = await apiClient.delete(`/facture/${id}`);
      if (res.status === 200) {
        toast.success("Facture supprimée avec succès");
        setFacturesData(FacturesData.filter((e) => e._id !== id));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message);
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {openFacture?._id && (
        <Facture
          payment={openFacture}
          setOpenFacture={setOpenFacture}
          isHide={autoSendFacture}
          setisHide={setAutoSendFacture}
        />
      )}
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t("sidebarPayments")}
        </h2>
        <p className="text-sm text-black/40">
          {t("dashboard_payment_tracking")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {QuickAnalytic.map((analytic, index) => (
          <CardDetails key={index} analytic={analytic} />
        ))}
      </div>

      {/* Payments Table */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle>{t("dashboard_payment_paymentHistory")}</CardTitle>
          <CardDescription>{t("dashboard_payment_fullList")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboard_payment_searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard_payment_allStatuses")}
                </SelectItem>
                <SelectItem value="success">
                  {t("dashboardClient_success")}
                </SelectItem>
                <SelectItem value="unsuccess">
                  {t("dashboardClient_failed")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("dashboard_payment_method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard_payment_allMethods")}
                </SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="cash">{t("dashboard_payment_cash")}</SelectItem>
                <SelectItem value="free">{t("dashboard_payment_free")}</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>ID</TableHead>
                  <TableHead>{t("dashboard_payment_user")}</TableHead>
                  <TableHead>{t("dashboard_payment_operatorId")}</TableHead>
                  <TableHead>{t("dashboard_payment_method")}</TableHead>
                  <TableHead>{t("dashboard_payment_amount")}</TableHead>
                  <TableHead>{t("dashboard_payment_status")}</TableHead>
                  <TableHead>{t("dashboard_payment_date")}</TableHead>
                  <TableHead>{t("dashboard_payment_action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments
                  .filter(
                    (e: any) =>
                      e?.user?.company
                        ?.toLowerCase()
                        .includes(companySelected.toLowerCase()) ||
                      e?.user?.name
                        ?.toLowerCase()
                        .includes(companySelected.toLowerCase())
                  )
                  .filter((e: any) => {
                    if (typeSelected === "Touts") return true;
                    if (typeSelected === "Société") return !!e.user.nTva;
                    if (typeSelected === "Individual") return !e.user.nTva;
                    return true;
                  })
                  .map((payment: any) => (
                    <TableRow key={payment._id}>
                      <TableCell className="text-sm font-semibold">
                        {payment.facture?.factureId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 rounded text-xs bg-gray-200">
                          {payment.operatorId.toUpperCase()}
                        </code>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodBadge(payment.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        € {payment.totalPricePay}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <div className="flex items-center space-x-2">
                          <button
                            className="cursor-pointer"
                            onClick={() => {
                              if (payment.status !== "success") {
                                toast.warning(
                                  t("dashboard_payment_invoiceRestriction")
                                );
                                return;
                              }
                              setOpenFacture(payment);
                            }}
                          >
                            <PiFilePdfBold className="h-4 w-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="cursor-pointer">
                                <MdDeleteOutline className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <div className="flex items-center gap-2">
                                  <PiWarningCircleBold className="h-5 w-5 text-destructive" />
                                  <AlertDialogTitle>
                                    {"Supprimer la facture"}
                                  </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="pt-2">
                                  {
                                    "Êtes-vous sûr de vouloir supprimer cette facture ?"
                                  }
                                  <span className="block mt-2 font-medium text-foreground">
                                    {"Cette action est irréversible."}
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("dashboardClient_orders_cancel") ||
                                    "Annuler"}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(payment.facture._id)
                                  }
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                >
                                  <PiTrashBold className="mr-2 h-4 w-4" />
                                  {"Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

export default PaymentsAdmin;
