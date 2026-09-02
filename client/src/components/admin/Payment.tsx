import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
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
  const navigate = useNavigate();
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
  const [invoiceSentFilter, setInvoiceSentFilter] = useState<string>("all");
  const [openFacture, setOpenFacture] = useState<any>({});
  const [autoSendFacture, setAutoSendFacture] = useState<any>(false);
  const [isReminderSend, setIsReminderSend] = useState(false);
  const [isCreditNoteSend, setIsCreditNoteSend] = useState(false);
  const [cancelModePaymentId, setCancelModePaymentId] = useState<string | null>(null);

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
    const matchesInvoiceSent =
      invoiceSentFilter === "all" ||
      (invoiceSentFilter === "sent" && payment.facture?.isSent) ||
      (invoiceSentFilter === "unsent" && !payment.facture?.isSent);

    return matchesSearch && matchesStatus && matchesMethod && matchesInvoiceSent;
  });

  const totalRevenue = paymentData
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.totalPricePay, 0);

  const successfulPayments = paymentData.filter(
    (p) => p.status === "success"
  ).length;
  const pendingPayments = paymentData.filter(
    (p) => p.status === "unsuccess"
  ).length;
  const cancelledPayments = paymentData.filter(
    (p) => p.status === "failed"
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

  const getPaymentStatusBadge = (status: string, type?: string) => {
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
    } else if (status === "failed") {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 hover:bg-red-200 border-none"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Annulé
        </Badge>
      );
    } else if (type === "cash") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        >
          <Clock className="mr-1 h-3 w-3" />
          En attente de virement
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

  const toggleStatusFilter = (filter: string) => {
    setStatusFilter((prev) => (prev === filter ? "all" : filter));
  };

  const quickAnalytics = useMemo(() => {
    return [
      {
        title: t("dashboard_payment_totalRevenue"),
        icon: AiFillDollarCircle,
        value: totalRevenue,
        isCurrency: true,
        isPercent: false,
        cardBg: "bg-emerald-950/90",
        cardBorder: "border-emerald-900/60",
        iconBg: "bg-emerald-600",
        iconColor: "text-white",
        isActive: statusFilter === "success",
        activeBg: "bg-emerald-900",
        activeBorder: "border-emerald-500",
        activeRing: "ring-emerald-400/50",
        onClick: () => toggleStatusFilter("success"),
        parag: t("dashboard_payment_totalRevenueDescription"),
      },
      {
        title: t("dashboard_payment_transactions"),
        icon: GrTransaction,
        value: paymentData.length,
        isCurrency: false,
        isPercent: false,
        cardBg: "bg-slate-900/90",
        cardBorder: "border-slate-700/60",
        iconBg: "bg-slate-600",
        iconColor: "text-white",
        isActive: statusFilter === "all",
        activeBg: "bg-slate-800",
        activeBorder: "border-slate-400",
        activeRing: "ring-slate-400/50",
        onClick: () => setStatusFilter("all"),
        parag: t("dashboard_payment_totalPayments"),
      },
      {
        title: t("dashboard_payment_successful"),
        icon: IoMdCheckmarkCircleOutline,
        value: successfulPayments,
        isCurrency: false,
        isPercent: false,
        cardBg: "bg-green-950/90",
        cardBorder: "border-green-900/60",
        iconBg: "bg-green-600",
        iconColor: "text-white",
        isActive: statusFilter === "success",
        activeBg: "bg-green-900",
        activeBorder: "border-green-500",
        activeRing: "ring-green-400/50",
        onClick: () => toggleStatusFilter("success"),
        parag: `${paymentData.length ? Math.round(
          (successfulPayments / paymentData.length) * 100
        ) : 0}% ${t("dashboard_payment_successRate")}`,
      },
      {
        title: t("dashboard_payment_pending"),
        icon: Clock,
        value: pendingPayments,
        isCurrency: false,
        isPercent: false,
        cardBg: "bg-amber-950/90",
        cardBorder: "border-amber-900/60",
        iconBg: "bg-amber-500",
        iconColor: "text-white",
        isActive: statusFilter === "unsuccess",
        activeBg: "bg-amber-900",
        activeBorder: "border-amber-500",
        activeRing: "ring-amber-400/50",
        onClick: () => toggleStatusFilter("unsuccess"),
        parag: t("dashboard_payment_pendingDescription"),
      },
      {
        title: t("dashboard_payment_cancelled"),
        icon: XCircle,
        value: cancelledPayments,
        isCurrency: false,
        isPercent: false,
        cardBg: "bg-red-950/90",
        cardBorder: "border-red-900/60",
        iconBg: "bg-red-600",
        iconColor: "text-white",
        isActive: statusFilter === "failed",
        activeBg: "bg-red-900",
        activeBorder: "border-red-500",
        activeRing: "ring-red-400/50",
        onClick: () => toggleStatusFilter("failed"),
        parag: t("dashboard_payment_cancelledDescription"),
      },
    ];
  }, [
    t,
    totalRevenue,
    paymentData.length,
    successfulPayments,
    pendingPayments,
    cancelledPayments,
    statusFilter,
  ]);

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

  const handleMarkAsPaid = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/payment/${id}`, { status: "success" });
      if (res.status === 200) {
        if (res.data && res.data.codeSent) {
          toast.success("Virement marqué comme payé. Code d'activation définitif envoyé au client.");
        } else {
          toast.success("Virement marqué comme payé avec succès.");
        }
        setLoading(true); // force reload data
      } else {
        toast.warning(res.data.message);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Erreur lors de la validation du paiement.");
      setLoading(false);
    }
  };

  const handleCancelPayment = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/payment/${id}`, { status: "failed" });
      if (res.status === 200) {
        toast.success("Commande annulée et accès client suspendu.");
        const paymentObj = paymentData.find((p) => p._id === id);
        if (paymentObj) {
          setIsReminderSend(false);
          setIsCreditNoteSend(true);
          setAutoSendFacture(true);
          setOpenFacture({ ...paymentObj, status: "failed" });
        }
        setLoading(true); // force reload data
      } else {
        toast.warning(res.data.message);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || "Erreur lors de l'annulation.");
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6 mb-6">
      {openFacture?._id && (
        <Facture
          payment={openFacture}
          setOpenFacture={setOpenFacture}
          isHide={autoSendFacture}
          setisHide={(val: any) => {
            setAutoSendFacture(val);
            if (val === null) {
              setIsReminderSend(false);
              setIsCreditNoteSend(false);
              setCancelModePaymentId(null);
            }
          }}
          sendAsReminder={isReminderSend}
          sendAsCreditNote={isCreditNoteSend}
          onCancelPayment={
            cancelModePaymentId === openFacture._id
              ? () => handleCancelPayment(openFacture._id)
              : undefined
          }
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickAnalytics.map((analytic, index) => (
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
                  {t("dashboard_payment_pending")}
                </SelectItem>
                <SelectItem value="failed">
                  {t("dashboard_payment_cancelled")}
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
                  <TableHead>Statut Facture</TableHead>
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
                        {getPaymentStatusBadge(payment.status, payment.type)}
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
                        <div className="flex items-center space-x-2">
                          {payment.status === "failed" ? (
                            <>
                              <button
                                className="cursor-pointer text-stone-600 hover:text-stone-900"
                                title="Consulter la facture"
                                onClick={() => {
                                  setIsCreditNoteSend(false);
                                  setOpenFacture(payment);
                                }}
                              >
                                <PiFilePdfBold className="h-4.5 w-4.5" />
                              </button>
                              <button
                                className="cursor-pointer text-red-500 hover:text-red-700"
                                title="Consulter la note de crédit"
                                onClick={() => {
                                  setIsCreditNoteSend(true);
                                  setOpenFacture(payment);
                                }}
                              >
                                <PiFilePdfBold className="h-4.5 w-4.5 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="cursor-pointer"
                                title="Consulter la facture"
                                onClick={() => {
                                  const canViewInvoice =
                                    payment.status === "success" ||
                                    payment.status === "failed" ||
                                    (payment.type === "cash" &&
                                      payment.status === "unsuccess");

                                  if (!canViewInvoice) {
                                    toast.warning(
                                      t("dashboard_payment_invoiceRestriction")
                                    );
                                    return;
                                  }
                                  setIsCreditNoteSend(false);
                                  setOpenFacture(payment);
                                }}
                              >
                                <PiFilePdfBold className="h-4 w-4" />
                              </button>
                              {payment.status === "success" && (
                                <button
                                  className="cursor-pointer text-red-500 hover:text-red-700"
                                  title="Consulter la note de crédit"
                                  onClick={() => {
                                    setIsCreditNoteSend(true);
                                    setOpenFacture(payment);
                                  }}
                                >
                                  <PiFilePdfBold className="h-4 w-4 text-red-500" />
                                </button>
                              )}
                            </>
                          )}
                          {payment.status === "success" && (
                            <button
                              className="cursor-pointer text-red-500 hover:text-red-700"
                              title="Annuler la commande"
                              onClick={() => {
                                setIsReminderSend(false);
                                setIsCreditNoteSend(true);
                                setCancelModePaymentId(payment._id);
                                setOpenFacture(payment);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                           {payment.type === "cash" && payment.status === "unsuccess" && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="cursor-pointer text-green-600 hover:text-green-800" title="Marquer comme payé">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer le virement</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir marquer ce virement bancaire comme payé ? Cela activera les licences à leur durée totale et enverra le code d'activation définitif au client.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleMarkAsPaid(payment._id)}
                                      className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                      Confirmer le paiement
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <button
                                className="cursor-pointer text-red-500 hover:text-red-700"
                                title="Annuler la commande"
                                onClick={() => {
                                  setIsReminderSend(false);
                                  setIsCreditNoteSend(true);
                                  setCancelModePaymentId(payment._id);
                                  setOpenFacture(payment);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="cursor-pointer text-blue-500 hover:text-blue-700" title="Envoyer une relance par e-mail">
                                    <Mail className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Envoyer un e-mail de relance</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir générer la facture et envoyer un e-mail de relance à ce client ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        setIsReminderSend(true);
                                        setOpenFacture(payment);
                                        setAutoSendFacture(true);
                                      }}
                                      className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                      Confirmer l'envoi
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="cursor-pointer text-gray-500 hover:text-red-500" title="Supprimer la facture">
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
