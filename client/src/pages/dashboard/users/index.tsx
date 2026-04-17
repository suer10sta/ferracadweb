import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  ListFilter,
  Mail,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  users,
  payment,
  registrations,
  rentals,
  licenseHistory,
  Download
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import { FaExternalLinkAlt, FaRegClock, FaUsers } from "react-icons/fa";
import { PiRadioactiveBold } from "react-icons/pi";
import { HiMiniUsers } from "react-icons/hi2";
import { MdAdminPanelSettings, MdDeleteOutline, MdKey } from "react-icons/md";
import CardDetails from "@/components/dashboard/Card";
import countries from "@/data/countries.json";
import { AiFillEuroCircle } from "react-icons/ai";
import { IoIosMail } from "react-icons/io";
import { getUser } from "@/utils/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "@/components/elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TbReload } from "react-icons/tb";
import { getTotalLicenseDays } from "@/utils/getTotalLicenseDays";
import FilterByType from "@/components/dashboard/FilterByType";
import { formatDate } from "@/utils/formatDate";
import { IoCopyOutline } from "react-icons/io5";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import NewUser from "@/components/dashboard/NewUser";
import { RiExchangeLine } from "react-icons/ri";
import { BsInfoCircle } from "react-icons/bs";

function toDateOnlyString(dateInput: any) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateTotalDays(histories: any[]): number {
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

const Users: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<any>({
    from: undefined,
    to: undefined,
  });

  const [typeSelected, setTypeSelected] = useState("Touts");
  const [companySelected, setCompanySelected] = useState("");
  const [usersData, setusersData] = useState<any[]>([]);
  const [rentalData, setRentalData] = useState<any[]>([]);
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [paymentData, setpaymentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyData, sethistoryData] = useState<any[]>([]);
  const [downloadsData, setdownloadsData] = useState<any[]>([]);
  const [platform, setPlatform] = useState("-");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [currentLicensePage, setCurrentLicensePage] = useState(1);
  const licensesPerPage = 10;

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailUser, setEmailUser] = useState<any>(null);
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<any>(null);
  const [emailPreview, setEmailPreview] = useState({ subject: "", body: "" });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchEmailLogs = async (userId: string) => {
    setLoadingLogs(true);
    try {
      const res = await apiClient.get(`/email-templates/email-logs/${userId}`);
      setEmailLogs(res.data);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };


  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await apiClient.get("/email-templates");
        setEmailTemplates(res.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t) => t._id === templateId);
    if (template && emailUser) {
      setSelectedEmailTemplate(template);
      const name = emailUser.name || "";
      const replacedSubject = template.subject.replace(/{{name}}/g, name);
      const replacedBody = template.body.replace(/{{name}}/g, name);
      setEmailPreview({
        subject: replacedSubject,
        body: replacedBody,
      });
    }
  };

  const sendCustomEmail = async () => {
    if (!emailUser || !emailPreview.subject || !emailPreview.body) {
      toast.warning("Veuillez sélectionner un modèle et remplir les informations.");
      return;
    }

    setIsSendingEmail(true);
    try {
      await apiClient.post("/email-templates/send", {
        userId: emailUser._id,
        email: emailUser.email,
        subject: emailPreview.subject,
        body: emailPreview.body,
      });

      toast.success("E-mail envoyé avec succès.");
      setEmailModalOpen(false);
      setSelectedEmailTemplate(null);
      setEmailPreview({ subject: "", body: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setIsSendingEmail(false);
    }
  };


  useEffect(() => {
    const getData = async () => {
      try {
        const getUsers = await users();
        const getRentls = await rentals();
        const getRegistrations = await registrations();
        const getPayment = await payment();
        const getHistoryLicense = await licenseHistory();
        const getDownloads = await Download();

        sethistoryData(getHistoryLicense || []);
        setdownloadsData(getDownloads || []);
        setusersData(getUsers || []);
        setRentalData(getRentls || []);
        setregistrationData(getRegistrations || []);
        setpaymentData(getPayment || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const totalPriceSpendLicense = (license: any) => {
    if (!license || !license.rentalId) return 0;

    const paymentId = rentalData.find((e) => e._id === license.rentalId);
    const getPaymentData = paymentData.find((e) => e._id === paymentId?.payId);

    if (!getPaymentData?._id) {
      // Fallback au filtrage par rentalId si payId n'est pas trouvé
      const payments = paymentData.filter((p) => {
        const pRentalId = (p.rentalId?._id || p.rentalId)?.toString();
        const lRentalId = (license.rentalId?._id || license.rentalId)?.toString();
        return pRentalId === lRentalId;
      });
      return payments.reduce((sum, p) => sum + (Number(p.totalPricePay) || 0), 0);
    }

    return getPaymentData.totalPricePay;
  };

  const rawEnrichedUsers = usersData?.map((user: any) => {
    const registration = registrationData.filter((e) => e.userId === user._id);
    const rental = rentalData.filter((e) => e.userId === user._id);
    const payment = paymentData.filter((e) => e.userId === user._id);
    let downloads = downloadsData.filter((e) => e?.userId?._id === user._id);
    if (downloads.length === 0) {
      downloads = downloadsData.filter((e) => e.ipAdresse === user.ip);
    }

    const hasDownloaded = downloads.length > 0;
    const now = new Date();

    const activeCount = registration.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      return l.status?.toLowerCase() === "active" && !isDatePassed;
    }).length;

    const trialCount = registration.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      return (l.status?.toLowerCase() === "freetrial" || l.status?.toLowerCase() === "période d'essai") && !isDatePassed;
    }).length;

    const expiredCount = registration.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      return l.status?.toLowerCase() === "expire" || l.status?.toLowerCase() === "expired" || isDatePassed;
    }).length;

    let licenseStatus = "none";
    if (activeCount > 0) {
      licenseStatus = "active";
    } else if (trialCount > 0) {
      licenseStatus = "trial";
    } else if (expiredCount > 0) {
      licenseStatus = "expired";
    }

    return {
      ...user,
      registration,
      rental,
      payment,
      downloads,
      hasDownloaded,
      licenseStatus,
      licenseStats: {
        active: activeCount,
        trial: trialCount,
        expired: expiredCount,
        total: registration.length,
      },
    };
  });

  // Aplatissement des données : une ligne par licence
  const flattenedUsers = rawEnrichedUsers?.flatMap((user: any) => {
    if (user.registration.length === 0) {
      return [{ ...user, currentRegistration: null, daysUntilExpiration: null }];
    }
    return user.registration.map((reg: any) => {
      const expirationDate = new Date(reg.expirationDate);
      const now = new Date();
      const daysUntilExpiration = reg.expirationDate
        ? Math.ceil(
          (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        : null;

      return {
        ...user,
        currentRegistration: reg,
        daysUntilExpiration,
        // On surcharge l'état de la licence pour cette ligne spécifique
        licenseStatus:
          reg.status?.toLowerCase() === "active" &&
          (!reg.expirationDate || new Date(reg.expirationDate) > new Date())
            ? "active"
            : reg.status?.toLowerCase() === "freetrial" ||
              reg.status?.toLowerCase() === "période d'essai"
            ? "trial"
            : "expired",
      };
    });
  });

  // filter users
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterUser = searchParams.get("filter");

  useEffect(() => {
    if (companySelected === "") return;
    setCompanySelected("");
  }, [filterUser]);

  const platforms = [
    {
      label: "Touts",
      value: "-",
    },
    {
      label: "AutoCAD",
      value: "autocad",
    },
    {
      label: "ZWCAD",
      value: "zwcad",
    },
    {
      label: t("free_trial_both"),
      value: "both",
    },
  ];

  const filteredUsers = (flattenedUsers || [])
    .filter((user) => {
      // Search filter
      const matchesSearchTerm =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase());

      // Company filter
      const matchesCompany = companySelected
        ? user.company?.toLowerCase().includes(companySelected.toLowerCase()) ||
        user.name?.toLowerCase().includes(companySelected.toLowerCase())
        : true;

      // Date filter (date only)
      const matchesDateRange = (() => {
        if (!date?.from && !date?.to) return true;

        const userDate = toDateOnlyString(user.createdAt);

        if (date.from && date.to) {
          const fromDate = toDateOnlyString(date.from);
          const toDate = toDateOnlyString(date.to);
          return userDate >= fromDate && userDate <= toDate;
        }

        if (date.from) {
          const fromDate = toDateOnlyString(date.from);
          return userDate >= fromDate;
        }

        if (date.to) {
          const toDate = toDateOnlyString(date.to);
          return userDate <= toDate;
        }

        return true;
      })();

      // combine base filters
      const matchesBaseFilters =
        matchesSearchTerm && matchesCompany && matchesDateRange;

      if (!matchesBaseFilters) return false;

      // License status filter
      if (
        licenseStatusFilter !== "all" &&
        user.licenseStatus !== licenseStatusFilter
      )
        return false;

      // Account status filter
      if (
        accountStatusFilter !== "all" &&
        user.status !== accountStatusFilter
      )
        return false;

      // Source filter
      if (sourceFilter !== "all") {
        const sourceMatch =
          sourceFilter === "none" ? !user.source : user.source === sourceFilter;
        if (!sourceMatch) return false;
      }

      // User filter (active / inactive / role)
      if (filterUser && filterUser !== "all") {
        if (filterUser === "active" && user.status !== "active") return false;
        if (filterUser === "inactive" && user.status !== "inactive")
          return false;
        if (
          !["active", "inactive"].includes(filterUser) &&
          user.role?.toLowerCase() !== filterUser.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    })
    .filter((user) => {
      if (typeSelected === "Touts") return true;
      if (typeSelected === "Société") return !!user.nTva;
      if (typeSelected === "Individual") return !user.nTva;
      return true;
    })
    .filter((e) => {
      if (platform === "-") return true;
      if (platform) return e.platform === platform;
      return true;
    });

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeSelected, companySelected, date, licenseStatusFilter, accountStatusFilter, sourceFilter, platform, filterUser]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentLicensePage(1);
  }, [companySelected]);

  const [QuickAnalytic, setQuickAnalytic] = useState<any[]>([]);

  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const getTrend = (items: any[]) => {
      const thisMonth = items.filter((i) => {
        const d = new Date(i.createdAt || i.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;
      if (thisMonth === 0) return null;
      return `+${thisMonth} ce mois`;
    };

    // Calculs des statistiques de licences
    const activeLicensesItems = registrationData.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      return l.status?.toLowerCase() === "active" && !isDatePassed;
    });
    const activeLicensesCount = activeLicensesItems.length;

    const trialLicensesItems = registrationData.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      const statusLower = l.status?.toLowerCase();
      return (statusLower === "freetrial" || statusLower === "période d'essai") && !isDatePassed;
    });
    const trialLicensesCount = trialLicensesItems.length;

    const expiredLicensesItems = registrationData.filter((l) => {
      const isDatePassed = l.expirationDate && new Date(l.expirationDate) < now;
      const statusLower = l.status?.toLowerCase();
      return statusLower === "expire" || statusLower === "expired" || isDatePassed;
    });
    const expiredLicensesCount = expiredLicensesItems.length;

    setQuickAnalytic([
      {
        title: "Utilisateurs",
        icon: FaUsers,
        value: usersData.length,
        trend: getTrend(usersData),
        iconBg: "bg-blue-500/20",
        iconColor: "text-blue-400",
        path: "/tableau-de-board/utilisateurs",
        isDark: true,
        parag: "Total des comptes",
      },
      {
        title: "Actifs",
        icon: PiRadioactiveBold,
        value: usersData.filter((u: any) => u.status === "active").length,
        trend: getTrend(usersData.filter((u: any) => u.status === "active")),
        iconBg: "bg-emerald-500/20",
        iconColor: "text-emerald-400",
        path: "/tableau-de-board/utilisateurs?filter=active",
        isDark: true,
        parag: "Connectés récemment",
      },
      {
        title: "Clients",
        icon: HiMiniUsers,
        value: usersData.filter((u: any) => u.role === "client").length,
        trend: getTrend(usersData.filter((u: any) => u.role === "client")),
        iconBg: "bg-sky-500/20",
        iconColor: "text-sky-400",
        path: "/tableau-de-board/utilisateurs?filter=client",
        isDark: true,
        parag: "Utilisateurs standards",
      },
      {
        title: "Admins",
        icon: MdAdminPanelSettings,
        value: usersData.filter((u: any) => u.role === "admin").length,
        trend: getTrend(usersData.filter((u: any) => u.role === "admin")),
        iconBg: "bg-violet-500/20",
        iconColor: "text-violet-400",
        path: "/tableau-de-board/utilisateurs?filter=admin",
        isDark: true,
        parag: "Accès total",
      },
      {
        title: "Licences",
        icon: MdKey,
        value: registrationData.length,
        trend: getTrend(registrationData),
        iconBg: "bg-amber-500/20",
        iconColor: "text-amber-400",
        isDark: true,
        parag: "Total générées",
      },
      {
        title: "Payantes",
        icon: CheckCircle,
        value: activeLicensesCount,
        trend: getTrend(activeLicensesItems),
        iconBg: "bg-cyan-500/20",
        iconColor: "text-cyan-400",
        isDark: true,
        parag: "Licences valides",
      },
      {
        title: "Essais",
        icon: FaRegClock,
        value: trialLicensesCount,
        trend: getTrend(trialLicensesItems),
        iconBg: "bg-indigo-500/20",
        iconColor: "text-indigo-400",
        isDark: true,
        parag: "Périodes de test",
      },
      {
        title: "Expirées",
        icon: AlertTriangle,
        value: expiredLicensesCount,
        trend: getTrend(expiredLicensesItems),
        iconBg: "bg-rose-500/20",
        iconColor: "text-rose-400",
        isDark: true,
        parag: "Nécessitent renouvellement",
      },
    ]);
  }, [usersData, registrationData]);

  const [newFormData, setNewFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
    country: "",
    nTva: "",
    idUser: "",
    basedPrice: "",
    role: "",
    platform: "-",
  });

  const handleChangeUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChangeUpdate = (value: string) => {
    setNewFormData((prev) => ({ ...prev, country: value }));
  };

  const handleSelectChangeUpdatePlatform = (value: string) => {
    setNewFormData((prev) => ({ ...prev, platform: value }));
  };

  const handleSelectChangeUpdateRole = (value: string) => {
    setNewFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmitUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (
      !newFormData.name ||
      !newFormData.email ||
      Number(newFormData.basedPrice) <= 0 ||
      !newFormData.country ||
      !newFormData.role
    ) {
      toast.warning(t("dashboardAdmin_users_allFieldsRequired"));
      return;
    }
    if (newFormData.nTva) {
      const expReg = countries.find((e) => e.code === newFormData.country);

      if (expReg?.VATFormat) {
        // Nettoyer l'expression régulière (enlever les slashs et guillemets)
        const formate = expReg.VATFormat;
        const cleanExp = formate.replace(/^\/|\/$/g, "");
        const regex = new RegExp(cleanExp);

        if (!regex.test(newFormData.nTva)) {
          // Numéro TVA invalide
          toast.warning(`Format TVA invalide pour ${expReg.name}.`);
          return false;
        }
      }
    }

    setLoading(true);

    try {
      const res = await apiClient.put("/user", newFormData);
      if (res.status === 200) {
        toast.success(t("dashboardAdmin_users_updateSuccess"));
        setNewFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          address: "",
          postal: "",
          city: "",
          country: "",
          nTva: "",
          idUser: "",
          basedPrice: "",
          role: "",
          platform: "",
        });
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.log(error)
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: any) => {
    try {
      setLoading(true);
      const res = await apiClient.delete(`/user/${id}`);
      if (res.status === 200) {
        toast.success(t("dashboardAdmin_users_deletionSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.log(error)
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeCom = (data: any, id: string) => {
    navigate("/tableau-de-board/commande/paiement", {
      state: { commandData: data, id },
    });
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

  const getStatusBadge = (license: any) => {
    const now = new Date();
    const expirationDate = license.expirationDate ? new Date(license.expirationDate) : null;
    const isExpired = expirationDate && expirationDate < now;

    if (isExpired || license.status.toLocaleLowerCase() === "expired") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("dashboardClient_orders_expired")}
        </Badge>
      );
    }

    if (license.status.toLocaleLowerCase() === "période d'essai" || license.status.toLocaleLowerCase() === "freetrial") {
      return (
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1"
        >
          <FaRegClock className="h-3 w-3" />
          {t("dashboardClient_orders_freeTrial")}
        </Badge>
      );
    } else if (license.status.toLocaleLowerCase() === "expiring") {
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

  const [formDataUpdate, setformDataUpdate] = useState({
    nameComputer: "",
    codeComputer: "",
    username: "",
    expirationDate: "",
  });

  const handleShow = (license: any) => {
    setformDataUpdate({
      nameComputer: license.computerName,
      codeComputer: license.computerCode,
      username: license.username,
      expirationDate: license.expirationDate ? license.expirationDate.split("T")[0] : "",
    });
  };

  const handleChangeUpdateLicense = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setformDataUpdate((prev) => ({ ...prev, [name]: value }));
  };

  const [, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);

    const formattedDate = today.toISOString().split("T")[0];
    setMinDate(formattedDate);
  }, []);

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
      setLoading(false);
    }
  };

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const handleTransfer = async (registerId: string) => {
    try {
      if (!selectedUserId || !registerId) return;
      setLoading(true);
      const res = await apiClient.put(
        `/registration/transter/${registerId}/${selectedUserId}`
      );
      if (res.status === 200) {
        toast.success(res.data?.message);
      } else {
        toast.warning(res.data?.message);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLicence = async (id: any) => {
    try {
      if (!id) return;
      setLoading(true);
      const res = await apiClient.delete(`/registration/${id}`);
      if (res.status === 200) {
        toast.success(res.data?.message);
      } else {
        toast.warning(res.data?.message);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const userIdn = getUser();
  const navigate = useNavigate();

  if (userIdn.role !== "admin" && userIdn.role) {
    navigate(-1);
    return;
  }

  if (!userIdn.role) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("dashboardAdmin_users_users")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("dashboardAdmin_users_manageAccounts")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tableau-de-board/commande/paiement">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10 shadow-md transition-all">
              <Plus size={16} />
              <span className="hidden sm:inline">{t("dashboardClient_orders_new_order")}</span>
              <span className="sm:hidden">Commande</span>
            </Button>
          </Link>
          <NewUser />
        </div>
      </div>

      {/* Stats Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Group: User Management */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Gestion Utilisateurs
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {QuickAnalytic.slice(0, 4).map((analytic, index) => (
              <CardDetails key={index} analytic={analytic} />
            ))}
          </div>
        </div>

        {/* Group: License Management */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-3 bg-amber-500 rounded-full" />
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Gestion Licences
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {QuickAnalytic.slice(4, 8).map((analytic, index) => (
              <CardDetails key={index} analytic={analytic} />
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0">
        <CardHeader>
          <CardTitle>{t("dashboardAdmin_users_userList")}</CardTitle>
          <CardDescription>
            {t("dashboardAdmin_users_searchManage")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  Filtres
                  {(licenseStatusFilter !== "all" || accountStatusFilter !== "all" || sourceFilter !== "all") && (
                    <Badge variant="secondary" className="ml-1 px-1 h-5 min-w-5 justify-center rounded-full bg-blue-100 text-blue-800">
                      {(licenseStatusFilter !== "all" ? 1 : 0) + (accountStatusFilter !== "all" ? 1 : 0) + (sourceFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Statut Licence</Label>
                    <Select value={licenseStatusFilter} onValueChange={setLicenseStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Payante</SelectItem>
                        <SelectItem value="trial">Essai</SelectItem>
                        <SelectItem value="expired">Expirée</SelectItem>
                        <SelectItem value="none">Aucune</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Statut Compte</Label>
                    <Select value={accountStatusFilter} onValueChange={setAccountStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Source d'inscription</Label>
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir une source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les sources</SelectItem>
                        {[...new Set((rawEnrichedUsers || []).map(u => u.source).filter(Boolean))].map((source: any, i) => (
                          <SelectItem key={i} value={source}>{source}</SelectItem>
                        ))}
                        <SelectItem value="none">Non renseignée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full bg-gray-100 "
                      onClick={() => {
                        setLicenseStatusFilter("all");
                        setAccountStatusFilter("all");
                        setSourceFilter("all");
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative grid grid-cols-4 gap-5 w-full">
              <div className="flex-1 col-span-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("dashboardAdmin_users_searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {/* Date Range Picker */}
              <div className="flex items-center col-span-1 w-full">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date.from && !date.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd/MM/yyyy")} -{" "}
                            {format(date.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(date.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Sélectionner une période</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={fr}
                      disabled={{ after: new Date() }}
                    />
                    <div className="flex justify-end p-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDate({ from: undefined, to: undefined })
                        }
                        className="mr-2"
                      >
                        Effacer
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 flex-wrap mb-5">
            <FilterByType
              setCompanySelected={setCompanySelected}
              companySelected={companySelected}
              setTypeSelected={setTypeSelected}
              typeSelected={typeSelected}
            />
            <div className="flex flex-wrap gap-3 items-center bg-gray-100 rounded-full">
              {platforms.map((plt, i) => (
                <button
                  onClick={() => setPlatform(plt.value)}
                  key={i}
                  className={`p-2 px-5 text-sm font-semibold ${platform === plt.value ? "bg-gray-700 text-white" : ""
                    } rounded-full`}
                >
                  {plt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboardAdmin_users_user")}</TableHead>
                  <TableHead>{t("dashboardAdmin_users_contact")}</TableHead>
                  <TableHead>Détails Licence</TableHead>
                  <TableHead>Code Machine / Auth</TableHead>
                  <TableHead>{t("dashboardAdmin_users_role")}</TableHead>
                  <TableHead>Status Compte</TableHead>
                  <TableHead>Type Licence</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Création / Connexion</TableHead>
                  <TableHead>{t("dashboardAdmin_users_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user: any, index: number) => (
                  <TableRow key={`${user._id}-${user.currentRegistration?._id || index}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.company || "Individuel"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.currentRegistration ? (
                        <div>
                          <p className="text-xs font-bold uppercase text-primary">
                            {user.currentRegistration.platform || user.platform}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate w-32">
                            {user.currentRegistration.username}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Pas de licence</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.currentRegistration ? (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="text-[9px] py-0 h-4 w-fit font-mono">
                            M: {user.currentRegistration.computerCode || "N/A"}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] py-0 h-4 w-fit font-mono border-dashed">
                            A: {user.currentRegistration.authCode || "N/A"}
                          </Badge>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-[10px] py-0 h-5",
                          user.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-stone-100 text-stone-900"
                        )}
                      >
                        {user.role === "admin"
                          ? t("dashboardAdmin_users_status_admin")
                          : t("dashboardAdmin_users_status_client")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-[10px] py-0 h-5 border-transparent",
                          user.status === "active" && "bg-green-100 text-green-800",
                          user.status === "pending" && "bg-slate-100 text-slate-800",
                          user.status === "inactive" && "bg-red-100 text-red-800"
                        )}
                      >
                        {user.status === "active" ? "Actif" : user.status === "pending" ? "Pending" : "Suspendu"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-[10px] py-0 h-5 border-transparent",
                          user.licenseStatus === "active" && "bg-purple-100 text-purple-800",
                          user.licenseStatus === "trial" && "bg-blue-100 text-blue-800",
                          user.licenseStatus === "expired" && "bg-orange-100 text-orange-800",
                          user.licenseStatus === "none" && "bg-gray-100 text-gray-500"
                        )}
                      >
                        {user.licenseStatus === "active"
                          ? "Payante"
                          : user.licenseStatus === "trial"
                            ? "Essai"
                            : user.licenseStatus === "expired"
                              ? "Expirée"
                              : "Aucune"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] font-medium">
                      {user.currentRegistration?.expirationDate
                        ? formatDate(user.currentRegistration.expirationDate)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {user.daysUntilExpiration !== null ? (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full w-fit",
                            user.daysUntilExpiration <= 0
                              ? "bg-red-100 text-red-700"
                              : user.daysUntilExpiration <= 7
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          {user.daysUntilExpiration > 0
                            ? `${user.daysUntilExpiration} j`
                            : `${user.daysUntilExpiration} j`}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </span>
                        <span className="text-[10px] font-medium">
                          {user.lastLogin ? formatDate(user.lastLogin) : "Jamais"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {/* License actions - only show when row has a license */}
                        {user.currentRegistration && (
                          <>
                            {/* Transfer license */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                                  <RiExchangeLine className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-h-[90vh] overflow-y-auto overflow-x-hidden gap-3">
                                <DialogHeader>
                                  <DialogTitle>Transférer une licence vers un autre utilisateur</DialogTitle>
                                  <DialogDescription>
                                    Sélectionnez un nouvel utilisateur pour transférer la licence actuelle.<br />
                                    L'utilisateur actuel perdra l'accès immédiatement après le transfert.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                  <div className="grid gap-1">
                                    <Label htmlFor="company" className="text-sm font-semibold text-gray-700">De</Label>
                                    <div className="flex flex-col items-start bg-gray-100 py-4 px-4 rounded-lg">
                                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                      <span className="text-gray-500 text-xs">{user.company}</span>
                                    </div>
                                  </div>
                                  <div className="grid gap-2">
                                    <div className="flex justify-between items-center">
                                      <Label htmlFor="company" className="text-sm font-semibold text-gray-700">À</Label>
                                      <NewUser type="icon" />
                                    </div>
                                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                      <SelectTrigger className="w-full py-6 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors">
                                        <SelectValue placeholder={t("dashboardClient_orders_selectUserLabel")} />
                                      </SelectTrigger>
                                      <SelectContent className="border-gray-200 shadow-lg">
                                        {usersData
                                          .filter((e) => e._id !== user._id)
                                          .map((u: any, i: number) => (
                                            <SelectItem key={i} value={u._id} className="text-sm hover:bg-gray-50 cursor-pointer">
                                              <div className="flex flex-col items-start">
                                                <span className="font-medium text-gray-900">{u.name}</span>
                                                <span className="text-gray-500 text-xs">{u.company}</span>
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <button
                                    onClick={() => handleTransfer(user.currentRegistration._id)}
                                    className="w-full py-3 text-sm rounded-md bg-stone-600 transition-all duration-200 text-white cursor-pointer font-semibold hover:bg-stone-800"
                                  >
                                    Transfére
                                  </button>
                                </div>
                              </DialogContent>
                            </Dialog>



                            {/* Renew license */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer"
                              onClick={() => handleUpgradeCom([user.currentRegistration], user.currentRegistration.rentalId)}
                            >
                              <TbReload className="h-3 w-3" />
                            </Button>




                          </>
                        )}


                        {/* Edit Button + Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer"
                              onClick={() => {
                                setNewFormData({
                                  name: user.name,
                                  company: user.company,
                                  email: user.email,
                                  phone: user.phone,
                                  address: user.address,
                                  postal: user.postal,
                                  city: user.city,
                                  country: user.country,
                                  idUser: user._id,
                                  nTva: user.nTva,
                                  basedPrice: user.basedPrice,
                                  role: user.role,
                                  platform: user.platform,
                                });
                                if (user.currentRegistration) {
                                  handleShow(user.currentRegistration);
                                }
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-1/2 max-md:w-[90%] max-h-[90vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {t("dashboard_rent_edit")} — {user.name}
                              </DialogTitle>
                              <DialogDescription>
                                {t("dashboardAdmin_users_searchManage")}
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="user_edit" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="user_edit">👤 {t("dashboardAdmin_users_status_client")}</TabsTrigger>
                                <TabsTrigger value="license_edit" disabled={!user.currentRegistration}>🔑 {t("dashboard_rent_license")}</TabsTrigger>
                              </TabsList>

                              <TabsContent value="user_edit" className="space-y-4 mt-4">
                                <div className="border rounded-lg p-4">
                                  <p className="text-sm font-semibold mb-3">{t("dashboardAdmin_users_updateSuccess").replace("réussie", "")}</p>
                                  <div className="grid gap-3">
                                    <div className="grid gap-2">
                                      <Label htmlFor="name">{t("dashboardAdmin_users_name")}</Label>
                                      <Input id="name" name="name" onChange={handleChangeUpdate} value={newFormData.name} />
                                    </div>
                                    {newFormData.role === "client" && (
                                      <>
                                        <div className="grid gap-2">
                                          <Label htmlFor="basedPrice">Prix de base (EUR) *</Label>
                                          <Input id="basedPrice" name="basedPrice" min={1} onChange={handleChangeUpdate} value={newFormData.basedPrice} />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="company">{t("dashboardAdmin_users_company")}</Label>
                                          <Input id="company" name="company" onChange={handleChangeUpdate} value={newFormData.company} />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="nTva">{t("checkout_tva")}</Label>
                                          <Input id="nTva" name="nTva" onChange={handleChangeUpdate} value={newFormData.nTva} type="text" />
                                        </div>
                                        <div className="grid gap-2">
                                          <Label htmlFor="platform">Platform</Label>
                                          <Select name="platform" onValueChange={handleSelectChangeUpdatePlatform} value={newFormData.platform}>
                                            <SelectTrigger id="platform" className="w-full"><SelectValue placeholder="-" /></SelectTrigger>
                                            <SelectContent>
                                              {platforms.map((plat, index) => (<SelectItem key={index} value={plat.value}>{plat.label === "Touts" ? "-" : plat.label}</SelectItem>))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </>
                                    )}
                                    <div className="grid gap-2">
                                      <Label htmlFor="email">{t("dashboardAdmin_users_email")}</Label>
                                      <Input id="email" name="email" onChange={handleChangeUpdate} value={newFormData.email} type="email" />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="phone">{t("dashboardAdmin_users_phone")}</Label>
                                      <Input id="phone" name="phone" onChange={handleChangeUpdate} value={newFormData.phone} type="tel" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="grid gap-2">
                                        <Label htmlFor="address">{t("dashboardAdmin_users_address")}</Label>
                                        <Input id="address" name="address" onChange={handleChangeUpdate} value={newFormData.address} />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="postal">{t("dashboardAdmin_users_postalCode")}</Label>
                                        <Input id="postal" name="postal" onChange={handleChangeUpdate} value={newFormData.postal} />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="grid gap-2">
                                        <Label htmlFor="city">{t("dashboardAdmin_users_city")}</Label>
                                        <Input id="city" name="city" onChange={handleChangeUpdate} value={newFormData.city} />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="country">{t("dashboardAdmin_users_country")}</Label>
                                        <Select name="country" onValueChange={handleSelectChangeUpdate} value={newFormData.country}>
                                          <SelectTrigger id="country" className="w-full"><SelectValue placeholder={t("dashboardAdmin_users_selectCountry")} /></SelectTrigger>
                                          <SelectContent>
                                            {countries.map((country, index) => (<SelectItem key={index} value={country.code}>{country.name}</SelectItem>))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="role">{t("dashboardAdmin_users_role")} *</Label>
                                      <Select name="role" onValueChange={handleSelectChangeUpdateRole} value={newFormData.role}>
                                        <SelectTrigger id="role" className="w-full"><SelectValue placeholder={t("dashboardAdmin_users_selectrole")} /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="admin">Administrateur</SelectItem>
                                          <SelectItem value="client">Client</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button type="submit" onClick={handleSubmitUpdate} className="w-full mt-2">
                                      {t("dashboardAdmin_users_save")}
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="license_edit" className="space-y-4 mt-4">
                                {user.currentRegistration ? (
                                  <div className="border rounded-lg p-4">
                                    <p className="text-sm font-semibold mb-3">Modifier la licence</p>
                                    <form className="grid gap-3">
                                      <div className="grid gap-2">
                                        <Label htmlFor="username">{t("dashboard_rent_userName")}</Label>
                                        <Input id="username" name="username" placeholder={t("dashboard_rent_userName")} value={formDataUpdate.username} onChange={handleChangeUpdateLicense} />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="nameComputer">{t("dashboard_rent_computerNameLabel")}</Label>
                                        <Input id="nameComputer" name="nameComputer" placeholder={t("dashboard_rent_computerNameLabel")} value={formDataUpdate.nameComputer} onChange={handleChangeUpdateLicense} />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="codeComputer">{t("dashboard_rent_identificationCodeLabel")}</Label>
                                        <Input id="codeComputer" name="codeComputer" placeholder={t("dashboard_rent_identificationCodeLabel")} value={formDataUpdate.codeComputer} onChange={handleChangeUpdateLicense} />
                                      </div>
                                      <div className="grid gap-2">
                                        <Label htmlFor="date">{t("dashboard_rent_expirationDate")}</Label>
                                        <Input id="expirationDate" type="date" name="expirationDate" value={formDataUpdate.expirationDate} onChange={handleChangeUpdateLicense} />
                                      </div>
                                      <Button type="button" onClick={() => handleUpdateRegistration(user.currentRegistration._id)} className="w-full mt-2">
                                        {t("dashboardAdmin_users_save")}
                                      </Button>
                                    </form>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">Aucune licence à modifier.</p>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        {/* View Button + Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 cursor-pointer"
                              onClick={() => {
                                fetchEmailLogs(user._id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-1/2 max-md:w-[90%] max-h-[90vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {user.name} — {t("dashboardAdmin_users_userOverview")}
                              </DialogTitle>
                              <DialogDescription>
                                {t("dashboardAdmin_users_userDetails")}
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="user_view" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="user_view">👤 Utilisateur</TabsTrigger>
                                <TabsTrigger value="license_view">🔑 Licence</TabsTrigger>
                              </TabsList>

                              <TabsContent value="user_view" className="space-y-4 mt-4">
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                                    <CardDetails
                                      analytic={{
                                        title: t("dashboardAdmin_users_totalLicenses"),
                                        icon: MdKey,
                                        value: user.registration.length,
                                        isGrowth: true, isCurrency: false, valueGrowth: 2, isDark: true, isPercent: false,
                                        parag: t("dashboardAdmin_users_totalLicensesDescription"),
                                      }}
                                    />
                                    <CardDetails
                                      analytic={{
                                        title: t("dashboardAdmin_users_totalReceived"),
                                        icon: AiFillEuroCircle,
                                        value: user.payment.reduce((curr: any, arr: { totalPricePay: any }) => curr + arr.totalPricePay, 0),
                                        isGrowth: true, isCurrency: true, valueGrowth: 2, isDark: false, isPercent: false,
                                        parag: t("dashboardAdmin_users_totalReceivedDescription"),
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-bold">{user.name}</h3>
                                    <p className="text-xs font-medium text-black/40">{user.company}</p>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-black/80">Source d’inscription : <span className="text-black/40">{user.source || "Non renseignée"}</span></p>
                                      {user.source && (
                                        <Link to={`${user.source === "Formulaire d’inscription" ? "/louer/register" : user.source === "Formulaire d’enregistrement" ? "/enregistrement-du-logiciel" : "#"}`} target="_blanck">
                                          <FaExternalLinkAlt className="text-sm" />
                                        </Link>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-black/80">{t("dashboardAdmin_users_email")} : <span className="text-black/40">{user.email}</span></p>
                                      <button onClick={() => { setEmailUser(user); setEmailModalOpen(true); }}><IoIosMail /></button>
                                    </div>
                                    <p className="text-sm font-medium text-black/80">Invitation ID : <span className="text-black/40">{user.invitationId}</span></p>
                                    <p className="text-sm font-medium text-black/80">{t("pay_01_country")} : <span className="text-black/40">{countries.find((e) => e.code === user.country)?.name}</span></p>
                                    <p className="text-sm font-medium text-black/80">{t("pay_01_phone")} : <span className="text-black/40">{user.phone}</span></p>
                                    {user.role === "client" && (<p className="text-sm font-medium text-black/80">{t("checkout_tva")} : <span className="text-black/40">{user.nTva}</span></p>)}
                                    <p className="text-sm font-medium text-black/80">{t("dashboardAdmin_users_postalCode")} : <span className="text-black/40">{user.postal}</span></p>
                                    <p className="text-sm font-medium text-black/80">{t("dashboardAdmin_users_city")} : <span className="text-black/40">{user.city}</span></p>
                                    <p className="text-sm font-medium text-black/80">{t("dashboardAdmin_users_address")} : <span className="text-black/40">{user.address}</span></p>
                                    <p className="text-sm font-medium text-black/80">{t("dashboardAdmin_users_lastConnection")} : <span className="text-black/40">{formatDate(user.lastLogin)}</span></p>
                                    <p className="text-sm font-medium text-black/80">Compte activé : <span className={cn("font-semibold", user.status !== "pending" ? "text-green-600" : "text-red-500")}>{user.status !== "pending" ? "Oui" : "Non"}</span></p>
                                    <hr className="my-1 border-t border-black/5" />
                                    <p className="text-sm font-medium text-black/80">Téléchargement Ferracad : <span className={cn("font-semibold", user.hasDownloaded ? "text-green-600" : "text-red-500")}>{user.hasDownloaded ? "Oui" : "Non"}</span></p>
                                    <p className="text-sm font-medium text-black/80">Licences : <span className="text-black/40">{user.licenseStats.total} ({user.licenseStats.active} Actives, {user.licenseStats.trial} Essai, {user.licenseStats.expired} Expirées)</span></p>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <p className="text-sm font-medium text-black/80">Compte :</p>
                                      <Badge className={cn("px-2 py-0 h-5 text-[10px] uppercase font-bold border-transparent cursor-help", user.status === "active" && "bg-green-100 text-green-800", user.status === "pending" && "bg-slate-100 text-slate-800", user.status === "inactive" && "bg-red-100 text-red-800")}>
                                        {user.status === "active" ? "Actif" : user.status === "pending" ? "Pending" : "Suspendu"}
                                      </Badge>
                                      <p className="text-sm font-medium text-black/80 ml-2">Licence :</p>
                                      <Badge className={cn("px-2 py-0 h-5 text-[10px] uppercase font-bold border-transparent cursor-help", user.licenseStatus === "active" && "bg-purple-100 text-purple-800", user.licenseStatus === "trial" && "bg-blue-100 text-blue-800", user.licenseStatus === "expired" && "bg-orange-100 text-orange-800", user.licenseStatus === "none" && "bg-gray-100 text-gray-500")}>
                                        {user.licenseStatus === "active" ? "Payante" : user.licenseStatus === "trial" ? "Essai" : user.licenseStatus === "expired" ? "Expirée" : "Aucune"}
                                      </Badge>
                                    </div>
                                    <hr className="my-2 border-stone-100" />
                                    <div>
                                      <p className="text-sm font-semibold text-stone-800 mb-2">Historique des e-mails envoyés</p>
                                      <div className="space-y-2">
                                        {loadingLogs ? (<p className="text-xs text-muted-foreground">Chargement des logs...</p>) : emailLogs.length === 0 ? (<p className="text-xs text-muted-foreground">Aucun e-mail envoyé à ce jour.</p>) : (
                                          emailLogs.map((log) => (
                                            <div key={log._id} className="flex items-center justify-between p-2 border rounded-md bg-stone-50/50">
                                              <div className="flex-1">
                                                <p className="text-xs font-medium text-stone-700 truncate max-w-[250px]">{log.subject}</p>
                                                <p className="text-[10px] text-stone-400">{formatDate(log.createdAt)}</p>
                                              </div>
                                              <Popover>
                                                <PopoverTrigger asChild><Eye className="h-3 w-3 text-stone-500 cursor-pointer" /></PopoverTrigger>
                                                <PopoverContent className="w-80 p-4">
                                                  <div className="space-y-2">
                                                    <p className="text-xs font-bold border-b pb-1">Contenu de l'e-mail</p>
                                                    <div className="text-[11px] text-stone-600 max-h-[300px] overflow-y-auto whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.body.replace(/\n/g, '<br/>') }} />
                                                  </div>
                                                </PopoverContent>
                                              </Popover>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="license_view" className="space-y-4 mt-4">
                                {user.currentRegistration ? (
                                  <>
                                    <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
                                      <CardDetails
                                        analytic={{
                                          title: t("dashboard_rent_totalDaysUsed"),
                                          icon: MdKey,
                                          value: `${calculateTotalDays(historyData.filter((e) => e.registerId === user.currentRegistration._id))} Jours`,
                                          isGrowth: true, isCurrency: false, valueGrowth: 2, isDark: true, isPercent: false,
                                          parag: t("dashboard_rent_totalUsageDays"),
                                        }}
                                      />
                                      <CardDetails
                                        analytic={{
                                          title: t("dashboard_rent_totalReceived"),
                                          icon: AiFillEuroCircle,
                                          value: totalPriceSpendLicense(user.currentRegistration),
                                          isGrowth: true, isCurrency: true, valueGrowth: 2, isDark: false, isPercent: false,
                                          parag: t("dashboard_rent_totalAmountReceived"),
                                        }}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-black/50 font-medium">{t("dashboard_rent_licenseStatus")}</p>
                                        {getStatusBadge(user.currentRegistration)}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-black/50 font-medium">{t("dashboard_rent_autoPayment")}</p>
                                        {rentalData.find((r) => r._id === user.currentRegistration.rentalId)?.deductionAuto ? (
                                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" />{t("dashboard_rent_enable")}
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive" className="flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />{t("dashboard_rent_disable")}
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-black/50 font-medium">{t("dashboard_rent_identificationCode")} <span className="text-black/80">{user.currentRegistration.computerCode}</span></p>
                                        <button onClick={() => copyToClipboard(user.currentRegistration.computerCode)} className="cursor-pointer"><IoCopyOutline /></button>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-black/50 font-medium">{t("dashboard_rent_authenticationCode")} <span className="text-black/80">{user.currentRegistration.authCode}</span></p>
                                        <button onClick={() => copyToClipboard(user.currentRegistration.authCode)} className="cursor-pointer"><IoCopyOutline /></button>
                                      </div>
                                    </div>
                                    {/* License history */}
                                    <div className="mt-4">
                                      <p className="text-sm font-semibold mb-2">Historique de validité</p>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>{t("dashboard_rent_startDate")}</TableHead>
                                            <TableHead>{t("dashboard_rent_endDate")}</TableHead>
                                            <TableHead>{t("dashboard_rent_totalDays")}</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {historyData
                                            .filter((e) => e.registerId === user.currentRegistration._id)
                                            .map((l: any, i: any) => (
                                              <TableRow key={i}>
                                                <TableCell>{formatDate(l.startAt)}</TableCell>
                                                <TableCell>{formatDate(l.expirationDate)}</TableCell>
                                                <TableCell>{getTotalLicenseDays(l.startAt, l.expirationDate)} {t("pay_03_j")}</TableCell>
                                              </TableRow>
                                            ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <p className="text-sm">Aucune licence associée à cet utilisateur.</p>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        {/* Unified delete action (User or License) */}
                        {!user.mainAccount && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("dashboardAdmin_users_confirmDeletion")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user.currentRegistration
                                    ? "Que souhaitez-vous supprimer ? Vous pouvez supprimer uniquement cette licence ou supprimer l'intégralité du compte utilisateur ainsi que toutes ses données."
                                    : t("dashboardAdmin_users_irreversibleAction")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                                <AlertDialogCancel className="mt-0">
                                  {t("dashboardAdmin_users_cancel")}
                                </AlertDialogCancel>

                                {user.currentRegistration && (
                                  <AlertDialogAction
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                    onClick={() => handleDeleteLicence(user.currentRegistration._id)}
                                  >
                                    Supprimer la licence
                                  </AlertDialogAction>
                                )}

                                <AlertDialogAction
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  Supprimer le compte
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Logic to show limited page numbers if there are too many
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (
                        pageNum === currentPage - 3 ||
                        pageNum === currentPage + 3
                      ) {
                        return <span key={pageNum} className="px-1 text-muted-foreground">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Email Selection Dialog */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Envoyer un e-mail à {emailUser?.name}</DialogTitle>
            <DialogDescription>
              Choisissez comment vous souhaitez envoyer cet e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4 text-stone-600">
              <a
                href={`mailto:${emailUser?.email}`}
                className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-stone-50 transition-colors gap-3"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Gmail / Outlook</p>
                  <p className="text-xs text-stone-400">Ouvrir dans votre navigateur</p>
                </div>
              </a>
            </div>

            <hr className="my-2 border-stone-100" />

            <div className="space-y-4 mt-3">
              <Label className="text-stone-700">Sélectionner un modèle</Label>
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger className="border-stone-200 w-full">
                  <SelectValue placeholder="Choisir un modèle..." />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedEmailTemplate && (
                <div className="space-y-4 p-4 border rounded-lg bg-stone-50/50">
                  <div className="space-y-1">
                    <Label className="text-xs text-stone-500">Sujet</Label>
                    <Input
                      value={emailPreview.subject}
                      onChange={(e) => setEmailPreview({ ...emailPreview, subject: e.target.value })}
                      className="bg-white border-stone-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-stone-500">Message</Label>
                    <Textarea
                      className="min-h-[200px] bg-white border-stone-200"
                      value={emailPreview.body}
                      onChange={(e) => setEmailPreview({ ...emailPreview, body: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={sendCustomEmail} disabled={isSendingEmail} className="bg-stone-800 hover:bg-stone-900 border-none">
                      {isSendingEmail ? "Envoi..." : "Envoyer maintenant"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;

