import { useEffect, useState, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  user,
  payment,
  coupon,
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatDate";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { LuCopy } from "react-icons/lu";
import { TbReload } from "react-icons/tb";
import Facture from "@/components/dashboard/Facture";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Loading from "../elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";

const CommandeClient = () => {
  const { t } = useLanguage();
  const [rentalData, setRentalData] = useState<any[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [userData, setuserData] = useState<any>({});
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [couponData, setcouponData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ChangeUp, setChangeUp] = useState(false);
  const [AutoPay, setAutoPay] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getUser = await user();
        const getPayment = await payment();
        const getCoupon = await coupon();

        setRentalData(getRentls);
        setregistrationData(getRegistrations);
        setuserData(getUser);
        setpaymentData(getPayment);
        setcouponData(getCoupon);
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

  const enrichedCommande = rentalData
    .filter((e) =>
      userData?.role === "admin" ? true : e.userId === userData?._id
    )
    .map((c) => {
      const licenses = registrationData.filter((e) => e.rentalId === c?._id);
      const paiements = paymentData.find((e) => e._id === c?.payId);
      const getCoupon = couponData?.find((e) => e._id === paiements?.couponId);
      const expirationDate = c?.nextBillingDate ? new Date(c.nextBillingDate) : (licenses.length > 0 ? new Date(licenses[0]?.expirationDate) : null);
      const now = new Date();
      const isExpired = expirationDate ? expirationDate < now : false;
      const daysUntilExpiration = expirationDate
        ? Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...c,
        userData,
        licenses,
        coupon: getCoupon,
        paiements: paiements || { totalPricePay: 0, type: 'none' },
        isExpired,
        daysUntilExpiration,
        statusDuree: isExpired
          ? "expired"
          : "active",
      };
    });

  const filteredLicenses = enrichedCommande.filter(
    (command) => {
      const commandIdFormatted = `COM-${command._id.toString().slice(5, 10).toUpperCase()}`;

      return (
        // Custom filter for command ID (exact match or partial)
        commandIdFormatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Also search in the raw ID without formatting
        command._id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        // License filters
        command.licenses.some((e: { computerName: string; }) =>
          e.computerName.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        command.licenses.some((e: { username: string; }) =>
          e.username.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        command.licenses.some((e: { computerCode: string; }) =>
          e.computerCode.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  );

  const getStatusBadge = (license: (typeof enrichedCommande)[0]) => {
    const isActuallyExpired = license.isExpired ||
      license.statusDuree === "expired" ||
      license.status === "expire" ||
      (license.status === "freetrial" && license.isExpired);

    if (isActuallyExpired || license.status === "inactive") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("dashboardClient_orders_expired")}
        </Badge>
      );
    } else if (license.statusDuree.toLocaleLowerCase() === "expiring") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          {t("dashboardClient_orders_expiring_soon")}
        </Badge>
      );
    } else if (license.statusDuree === "transferred") {
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-300">
          {t("dashboardClient_orders_transferred") || "Transférée"}
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

  const handleShow = (com: any) => {
    setAutoPay(com.deductionAuto);
  };

  const handleUpdateAuto = async (id: any) => {
    setLoading(true);
    try {
      const res = await apiClient.put(`/rental/${id}`, {
        deductionAuto: AutoPay,
      });
      if (res.status === 200) {
        toast.success(t('dashboardClient_orders_operationSuccess'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error) {
      toast.warning(t('dashboardClient_orders_errorOccurred'));
    } finally {
      setLoading(false);
      setChangeUp(!ChangeUp);
    }
  };

  const handleSendCommand = (data: any, id: string) => {
    const license = [data];
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: license, id },
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
        const getRentalData = enrichedCommande.find((e) => e._id === rentalId);
        if (!getRentalData) return;
        // const freeTrial = location.state?.freetrial
        // Invoice is no longer auto-sent on order creation
        setRentalId(location.state?.id || "");
      }
    }
  }, [rentalId, rentalData, loading]);

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
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
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
                  <TableHead className="text-right">
                    {t("dashboardClient_orders_action")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((com) => (
                  <TableRow key={com._id}>
                    <TableCell>
                      <div className="flex flex-col ">
                        <span className="text-sm font-medium">
                          COM-{com._id.slice(5, 10).toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-stone-400">
                          {t("dashboardClient_orders_total_licenses")}{" "}
                          {com.licenses.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {com.nextBillingDate || com.licenses.length > 0
                        ? formatDate(com.nextBillingDate || com.licenses[0]?.expirationDate)
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(com)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm",
                          com.statusDuree === "expired" && "text-red-600",
                          com.statusDuree === "expiring" && "text-yellow-600",
                          com.statusDuree === "active" && "text-green-600"
                        )}
                      >
                        {com.licenses.length === 0
                          ? "-"
                          : com.isExpired
                            ? `${t(
                              "dashboardClient_orders_left_days"
                            )} ${Math.abs(com.daysUntilExpiration)} ${t(
                              "dashboardClient_orders_days_ago"
                            )}`
                            : `${com.daysUntilExpiration} ${t("pay_03_j")}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="font-semibold rounded-full bg-green-100 text-green-800">
                        € {com?.price || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-end justify-end gap-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                            onClick={() => handleShow(com)}
                          >
                            <MdOutlineModeEdit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                          <DialogHeader>
                            <DialogTitle>
                              {t('dashboardClient_orders_editInfo')}
                            </DialogTitle>
                            <DialogDescription>
                              {t('dashboardClient_orders_updateInfo')}
                            </DialogDescription>
                          </DialogHeader>
                          <div>
                            <form className="grid gap-5 mt-2">
                              <div className="grid gap-3">
                                <Label htmlFor="name">
                                  {t('dashboardClient_orders_autoRenewal')}
                                </Label>
                                <Select
                                  value={AutoPay ? "active" : "desactive"}
                                  onValueChange={(val) =>
                                    setAutoPay(val === "active" ? true : false)
                                  }
                                  disabled={(com.paiements?.totalPricePay <= 0 || com.paiements?.type !== "stripe") ? true : false}
                                >
                                  <SelectTrigger className="w-full text-xs font-medium">
                                    <SelectValue placeholder={t('dashboardClient_orders_autoRenewal')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      className="text-xs font-medium"
                                      value="active"
                                    >
                                      {t('dashboardClient_orders_activate')}
                                    </SelectItem>
                                    <SelectItem
                                      className="text-xs font-medium"
                                      value="desactive"
                                    >
                                      {t('dashboardClient_orders_deactivate')}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {
                                  (com.paiements?.totalPricePay <= 0 || com.paiements?.type !== "stripe") && (
                                    <p className="text-xs text-black/60 font-semibold">{t("dashboardClient_orders_autoRenewal_desc")}</p>
                                  )
                                }
                              </div>
                            </form>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">{t('dashboardClient_orders_cancel')}</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={() => handleUpdateAuto(com._id)} disabled={(com.paiements?.totalPricePay <= 0 || com.paiements?.type !== "stripe") ? true : false}>
                                {t('dashboardAdmin_users_save')}
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
                            <DialogTitle>
                              {t("dashboardClient_orders_order_details")}
                            </DialogTitle>
                            <DialogDescription>
                              {t("dashboardClient_orders_order_info")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
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
                                  {com.licenses.map((license: { username: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; computerName: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; computerCode: string | any[]; authCode: string; }, i: Key | null | undefined) => (
                                    <TableRow key={i}>
                                      <TableCell>{license.username}</TableCell>
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
                                                {t("dashboardClient_orders_cancel")}
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() =>
                                                  handleSendCommand(
                                                    license,
                                                    com._id
                                                  )
                                                }
                                              >
                                                {t("dashboardClient_orders_confirm")}
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                        <Button
                                          onClick={() =>
                                            copyToClipboard(license.authCode)
                                          }
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 cursor-pointer"
                                        >
                                          <LuCopy className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              <div className="flex flex-col gap-2">
                                <DialogClose asChild>
                                  <button
                                    onClick={() =>
                                      handleUpgradeCom(com.licenses, com._id)
                                    }
                                    className="cursor-pointer text-xs font-medium bg-blue-900 text-white p-2 rounded-lg w-full"
                                  >
                                    {t("dashboardClient_orders_renew_subscription")}
                                  </button>
                                </DialogClose>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default CommandeClient;
