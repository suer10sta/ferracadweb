import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Eye,
} from "lucide-react";
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
  registrations,
  rentals,
  type Rental,
  // user,
  payment,
  coupon,
  users,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { MdDeleteOutline } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatDate";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { LuCopy } from "react-icons/lu";
import { TbReload } from "react-icons/tb";
import Facture from "@/components/dashboard/Facture";
import { useNavigate } from "react-router-dom";
import Loading from "../elements/Loading";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/lang/LanguageProvider";
import FilterByType from "../dashboard/FilterByType";
import { FaRegClock } from "react-icons/fa";

const CommandeAdmin = () => {
  const { t } = useLanguage();
  const [rentalData, setRentalData] = useState<Rental[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  // const [userData, setuserData] = useState<any>({});
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [couponData, setcouponData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        // const getUser = await user();
        const getUsers = await users();
        const getPayment = await payment();
        const getCoupon = await coupon();

        setRentalData(getRentls);
        setregistrationData(getRegistrations);
        // setuserData(getUser);
        setpaymentData(getPayment);
        setcouponData(getCoupon);
        setUsersData(getUsers);
      } catch (error) {
        // console.error("Failed to fetch rentals:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const [searchTerm, setSearchTerm] = useState("");
  const [factureOpen, setFactureOpen] = useState<any>({});
  const [companySelected, setCompanySelected] = useState("");
  const [typeSelected, setTypeSelected] = useState("Touts");
  const [statusSelected, setStatusSelected] = useState("Touts");

  const enrichedCommande = rentalData
    .map((c) => {
      const licenses = registrationData.filter((e) => e.rentalId === c?._id);
      const paiements = paymentData.find((e) => e._id === c?.payId);
      const getCoupon = couponData.find((e) => e._id === paiements?.couponId);
      const useridn = usersData.find((e: any) => e._id === c.userId);
      const expirationDate = new Date(licenses[0]?.expirationDate);
      const now = new Date();
      const isExpired = expirationDate < now;
      const daysUntilExpiration = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...c,
        useridn,
        licenses,
        coupon: getCoupon,
        paiements,
        isExpired,
        daysUntilExpiration,
        status: isExpired
          ? "expired"
          : c.status === "pending"
          ? "pending"
          : "active",
      };
    })
    .filter((c) => (c.paiements || c.useridn?.role === "admin") && !c.licenses.some((l: any) => l.status === "freetrial"));

  const filteredLicenses = enrichedCommande.filter(
    (command: any) =>
      command.licenses.some((e: { computerName: string }) =>
        e.computerName.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      command.licenses.some((e: { username: string }) =>
        e.username.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      command.licenses.some((e: { computerCode: string }) =>
        e.computerCode.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (command.useridn &&
        command.useridn.name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter((e: any) => {
    if (typeSelected === "Touts") return true;
    if (typeSelected === "Société") return !!e.useridn.nTva;
    if (typeSelected === "Individual") return !e.useridn.nTva;
    return true;
  });

  const getStatusBadge = (license: any) => {
    const status = license.status.toLocaleLowerCase();

    if (status === "pending") {
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

  const handleSendCommand = (data: any, id: string) => {
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: [data], id },
    });
  };

  const handleUpgradeCom = (data: any, id: string) => {
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: data, id },
    });
  };

  const [isHide, setisHide] = useState(false);
  const location = useLocation();
  const [rentalId, setRentalId] = useState(location.state?.id || "");

  useEffect(() => {
    if (loading) return;
    const isSend = location.state?.isSend;
    if(!isSend) return;

    const reloadCount = parseInt(
      localStorage.getItem("reloadCount") || "0",
      10
    );

    if (rentalId && reloadCount === 0) {
      const newCount = reloadCount + 1;
      localStorage.setItem("reloadCount", newCount.toString());

      if (newCount >= 2) {
        // Clear rentalId after 2nd reload
        setRentalId("");
        localStorage.removeItem("reloadCount"); // reset after second reload
      } else {
        // const getRentalData = enrichedCommande.find((e) => e._id === rentalId);
        // Invoice is no longer auto-sent on order creation
        setRentalId(location.state?.id || "");
      }
    }
  }, [rentalId, rentalData]);

  // const sendFacture = async (data: any) => {
  //   if (!rentalId) return;
  //   if (!data) return;
  //   setisHide(true);
  //   setFactureOpen(data);
  // };

  const handleRemove = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/rental/${id}`);
      if (res.status === 200) {
        toast.success(t("dashboardClient_orders_location_deleted"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.error(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="space-y-6 mb-6">
      {factureOpen._id && (
        <Facture
          setOpenFacture={setFactureOpen}
          payment={factureOpen}
          isFromPay={false}
          isHide={isHide}
          setisHide={setisHide}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("dashboardClient_orders_license_orders")}
          </h2>
          <p className="text-sm text-black/40">
            {t("dashboardClient_orders_follow_orders")}
          </p>
        </div>
        <Link to="/tableau-de-board/commande/paiement">
          <Button className="w-fit bg-stone-800 transition-all duration-200 hover:bg-stone-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboardClient_orders_new_order")}
          </Button>
        </Link>
      </div>

      {/* Licenses Table */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle>{t("dashboardClient_orders_saved_orders")}</CardTitle>
          <CardDescription>
            {t("dashboardClient_orders_overview")}
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

          <div className="flex flex-wrap gap-2 items-center mb-6">
            <p className="text-sm font-medium text-stone-500 mr-2">{t("dashboardAdmin_users_status")}:</p>
            {[
              { label: t("dashboardAdmin_all"), value: "Touts" },
              { label: t("dashboardClient_orders_active"), value: "active" },
              { label: t("dashboardClient_orders_expired"), value: "expired" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusSelected(status.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                  statusSelected === status.value
                    ? "bg-stone-800 text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>
                    {t("dashboardClient_orders_expiration_date")}
                  </TableHead>
                  <TableHead>{t("dashboardClient_orders_status")}</TableHead>
                  <TableHead>{t("dashboardClient_orders_days_left")}</TableHead>
                  <TableHead className="text-center">
                    {t("dashboardClient_orders_amount_paid")}
                  </TableHead>
                  <TableHead className="text-center">
                    {t("dashboardClient_orders_message")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("dashboardClient_orders_action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses
                  .filter((e: any) => {
                    if (statusSelected === "Touts") return true;
                    return e.status === statusSelected;
                  })
                  .filter((e: any) =>
                    e?.useridn?.company?.toLowerCase().includes(companySelected.toLowerCase()) ||
                    e?.useridn?.name?.toLowerCase().includes(companySelected.toLowerCase())
                  )
                  .map((com: any) => (
                    <TableRow key={com._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {com.useridn.name} <span className="font-semibold">({com.licenses.map((licence: any) => licence.username).join(", ")})</span>
                          </span>
                          <span className="text-xs font-medium text-stone-400">
                            {t("dashboardClient_orders_total_licenses")}{" "}
                            {com.licenses.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(com.licenses[0]?.expirationDate)}
                      </TableCell>
                      <TableCell>{getStatusBadge(com)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-sm",
                            com.status === "expired" && "text-red-600",
                            com.status === "expiring" && "text-yellow-600",
                            com.status === "active" && "text-green-600"
                          )}
                        >
                          {com.isExpired ? 
                            `${t("dashboardClient_orders_left_days")} ${Math.abs(com.daysUntilExpiration)} ${t("dashboardClient_orders_days_ago")}`
                            : `${com.daysUntilExpiration} ${t("pay_03_j")}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="font-semibold rounded-full bg-green-100 text-green-800">
                          € {com?.price}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {com.message
                          ? `${com.message?.slice(0, 10)}...`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right flex items-end justify-end gap-0">
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
                          <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3 !min-w-1/2">
                            <DialogHeader>
                              <DialogTitle className="font-bold">
                                {t("dashboardClient_orders_order_details")}
                              </DialogTitle>
                              <DialogDescription>
                                {t("dashboardClient_orders_order_info")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                              <div className="">
                                <h4 className="text-sm font-semibold">
                                  {t("dashboardClient_orders_message")} :
                                </h4>
                                <p className="text-sm font-medium text-black/60">
                                  {com.message || "N/A"}
                                </p>
                              </div>
                              <div className="grid grid-cols-1 max-md:grid-cols-1 gap-3">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>
                                        {t("dashboardClient_orders_user")}
                                      </TableHead>
                                      <TableHead>
                                        {t(
                                          "dashboardClient_orders_computer_name"
                                        )}
                                      </TableHead>
                                      <TableHead>
                                        {t(
                                          "dashboardClient_orders_identification_code"
                                        )}
                                      </TableHead>
                                      <TableHead>
                                        Code d'activation
                                      </TableHead>
                                      <TableHead></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {com.licenses.map(
                                      (
                                        license: any,
                                        i: React.Key | null | undefined
                                      ) => (
                                        <TableRow key={i}>
                                          <TableCell>
                                            {com.useridn.name}
                                          </TableCell>
                                          <TableCell>
                                            {license.computerName}
                                          </TableCell>
                                          <TableCell>
                                            {license.computerCode}
                                          </TableCell>
                                          <TableCell>
                                            {license.authCode}
                                          </TableCell>
                                          <TableCell>
                                            <AlertDialog>
                                              <AlertDialogTrigger>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 cursor-pointer"
                                                >
                                                  <TbReload className="h-4 w-4" />
                                                </Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>
                                                    {t(
                                                      "dashboardClient_orders_confirm_operation"
                                                    )}
                                                  </AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    {t(
                                                      "dashboardClient_orders_operation_desc"
                                                    )}
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>
                                                    {t(
                                                      "dashboardClient_orders_cancel"
                                                    )}
                                                  </AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() =>
                                                      handleSendCommand(
                                                        license,
                                                        com._id
                                                      )
                                                    }
                                                  >
                                                    {t(
                                                      "dashboardClient_orders_confirm"
                                                    )}
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>

                                            <Button
                                              onClick={() =>
                                                copyToClipboard(
                                                  license.authCode
                                                )
                                              }
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 cursor-pointer"
                                            >
                                              <LuCopy className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                                <div className="flex flex-col gap-2">
                                  <div className="grid grid-cols-1 gap-2">
                                    <DialogClose asChild>
                                      <button
                                        onClick={() => setFactureOpen(com)}
                                        className="cursor-pointer text-xs font-medium bg-stone-800 text-white p-2 rounded-lg"
                                      >
                                        {t("dashboardClient_orders_invoice")}
                                      </button>
                                    </DialogClose>
                                  </div>
                                  <DialogClose asChild>
                                    <button
                                      onClick={() =>
                                        handleUpgradeCom(com.licenses, com._id)
                                      }
                                      className="cursor-pointer text-xs font-medium bg-blue-900 text-white p-2 rounded-lg w-full"
                                    >
                                      {t(
                                        "dashboardClient_orders_renew_subscription"
                                      )}
                                    </button>
                                  </DialogClose>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={() =>
                            handleUpgradeCom(com.licenses, com._id)
                          }
                        >
                          <TbReload className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <MdDeleteOutline className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("dashboardClient_orders_confirm_delete")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("dashboardClient_orders_delete_warning")}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("dashboardClient_orders_cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(com._id)}
                              >
                                {t("dashboardClient_orders_confirm")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default CommandeAdmin;
