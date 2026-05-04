import React, { useEffect, useMemo, useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import { IoGift } from "react-icons/io5";
import { MdInfo } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { parseISO, format } from "date-fns";
import { useLanguage } from "@/lang/LanguageProvider";
import countries from "@/data/countries.json";
import { getUser } from "@/utils/auth";
import { user, settings, couponById, tauxTva, registrations } from "@/data/mockData";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { useLocation } from "react-router-dom";
import Loading from "../elements/Loading";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  FaLock,
  FaInfoCircle,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaCreditCard,
  FaCalendarAlt,
  FaCcDinersClub,
  FaDesktop,
  FaCheck
} from 'react-icons/fa';
import { User as UserIcon, Building2, Briefcase, CheckCircle2, ShieldCheck, Users, Calendar, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatDate";

const ELEMENT_OPTIONS = {
  style: {
    base: {
      // color: '#2d3748',
      fontSize: "14px",
      fontFamily: "Ubuntu, sans-serif",
      // '::placeholder': {
      //   color: '#a0aec0',
      // },
    },
    invalid: { color: "#ef4444" },
  },
};

const NewLicence = () => {
  const [userData, setuserData] = useState<any>({});
  const [SettingsData, setSettings] = useState<any>({});
  const [registrationData, setregistrationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const location = useLocation();
  const licenses = location.state?.commandData;
  const idRental = location.state?.id;
  const freeTrial = location.state?.freeTrial || false;
  const stripe = useStripe();
  const elements = useElements();
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [ValidateDateExp, setValidateDateExp] = useState(false);
  const [minDate, setMinDate] = useState("");

  const [formData, setFormData] = useState<any>({
    licenses: 1,
    idRental: null,
    isUniformExpiration: true,
    users: [
      {
        username: "",
        email: "",
        computerName: "",
        identificationCode: "",
        startDate: "",
        expirationDate: "",
        excluded: false,
      },
    ],
    id_coupon: "",
    totalPayer: "",
    message: "",
    startDate: "",
    expirationDate: "",
    autoRenewal: false,
    id_paiement: "68de5ca745ef19db9415a248",
    agree: false,
    tva: "",
    freetrial: location.state?.freeTrial || false,
    daysUntilExpiration: 0,
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const getUser = await user();
        const getSettings = await settings();
        const getTax = await tauxTva();
        const getRegistrations = await registrations();
        
        // New VAT Logic based on Belgian seller rules
        let valueTva = getTax?.taux_tva || 0;
        const userCountry = getUser?.country || '';
        const isOutsideBelgium = userCountry !== 'Belgique' && userCountry !== 'BE';
        
        if (isOutsideBelgium) {
          if (getUser?.clientType === 'company' && getUser?.nTva) {
            valueTva = 0;
          } else if (getUser?.clientType === 'professional' && getUser?.isVatSubject && getUser?.nTva) {
            valueTva = 0;
          }
        }

        setFormData((prev: any) => ({
          ...prev,
          tva: valueTva
        }));

        setregistrationData(getRegistrations || []);

        setuserData(getUser);
        setSettings(getSettings);
      } catch (error) {
        // console.error("Failed to fetch rentals:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []); // Changed from [loading] to [] to prevent infinite loops and fix navigation issues

  useEffect(() => {
    if (selectedRegistrations.length === 0) {
      // Reset to default (today + 1) if no registration is selected
      if (!licenses) {
        const dateToday = new Date();
        dateToday.setDate(dateToday.getDate() + 1);
        const formattedDate = dateToday.toISOString().split("T")[0];
        setMinDate(formattedDate);
      }
      return;
    }

    // Find the furthest expiration date among selected registrations
    let maxExp = new Date();
    selectedRegistrations.forEach((id) => {
      const reg = registrationData.find((r) => r._id === id);
      if (reg && reg.expirationDate) {
        const d = new Date(reg.expirationDate);
        if (d > maxExp) maxExp = d;
      }
    });

    // The new minimum date must be at least the day after the latest existing expiration
    const newMin = new Date(maxExp);
    newMin.setDate(newMin.getDate() + 1);
    const formattedMin = newMin.toISOString().split("T")[0];

    setMinDate(formattedMin);
    
    // Update the 'today' reference so that daysUntilExpiration only counts the NEW days
    setToday(maxExp);

    // If the currently chosen expiration date is before this new minimum, auto-update it
    if (formData.expirationDate < formattedMin) {
      setFormData((prev: any) => ({
        ...prev,
        expirationDate: formattedMin,
      }));
      setValidateDateExp(false);
    }
  }, [selectedRegistrations, registrationData]);

  const userIdn = getUser();

  const { t } = useLanguage();

  const [today, setToday] = useState(new Date());

  const [couponCode, setCouponCode] = useState("");
  const [CouponValue, setCouponValue] = useState({ type: "percent", value: 0 });

  useEffect(() => {
    if (licenses) return;
    const dataToday = new Date();
    dataToday.setDate(dataToday.getDate() + 1);
    const formattedDate = dataToday.toISOString().split("T")[0];
    setMinDate(formattedDate);
    dataToday.setDate(dataToday.getDate() + 29);
    const formattedDateExp = dataToday.toISOString().split("T")[0];
    setFormData((prev: any) => ({
      ...prev,
      expirationDate: formattedDateExp,
      freeTrial,
    }));
  }, []);

  useEffect(() => {
    if (!licenses) return;

    const expDate = new Date(licenses[0].expirationDate);
    let formattedDate: string;
    let formattedMinDate: string;
    const dateToday = new Date();

    if (expDate > dateToday) {
      // Minimum is still +1 day
      const minDate = new Date(expDate);
      minDate.setDate(minDate.getDate() + 1);
      formattedMinDate = minDate.toISOString().split("T")[0];

      // Default target is the same day (no automatic +30 days)
      formattedDate = expDate.toISOString().split("T")[0];
    } else {
      // Minimum is still +1 day
      const minDate = new Date(dateToday);
      minDate.setDate(minDate.getDate() + 1);
      formattedMinDate = minDate.toISOString().split("T")[0];

      // Default target is +30 days only if expired
      dateToday.setDate(dateToday.getDate() + 30);
      formattedDate = dateToday.toISOString().split("T")[0];
    }

    setMinDate(formattedMinDate);

    setFormData((prev: any) => ({
      ...prev,
      licenses: licenses?.length,
      idRental,
      users: licenses.map((license: any) => ({
        id: license?._id,
        username: license?.username,
        email: license?.email || "",
        computerName: license?.computerName,
        identificationCode: license?.computerCode,
        startDate: "",
        expirationDate: license?.expirationDate ? new Date(license.expirationDate).toISOString().split('T')[0] : formattedDate,
        excluded: false,
      })),
      expirationDate: formattedDate,
      freeTrial,
    }));

    setToday(
      expDate >= today ? new Date(licenses[0].expirationDate) : new Date()
    );
  }, []);

  const handleSubmit = async () => {
    const isCompanyOrPro = userData.clientType === 'company' || userData.clientType === 'professional';
    const isNameMissing = !userData.name && !isCompanyOrPro;
    const isCompanyMissing = !userData.company && isCompanyOrPro;

    if (isNameMissing || isCompanyMissing || !userData.address || !userData.country) {
      toast.warning(t("dashboardClient_orders_completeCompanyInfoFirst"))
      return;
    }

    if (!formData.agree) {
      toast.warning(t("dashboardClient_orders_acceptTerms"));
      return;
    }

    if (!freeTrial) {
      if (!ValidateDateExp) {
        toast.warning("Veuillez valider la date d'expiration avant de continuer");
        return;
      }
    }

    // Validate licences
    let licensesValid = false;
    formData.users.forEach(
      (
        user: {
          username: string;
          computerName: string;
          identificationCode: string;
          excluded: boolean;
        },
        index: number
      ) => {
        if (user.excluded) return;

        if (!user.username.trim()) {
          toast.warning(
            `${t("dashboardClient_orders_license1")} ${index + 1}: ${t(
              "dashboardClient_orders_usernameRequired"
            )}`
          );
          licensesValid = true;
          return;
        }
        if (!user.computerName.trim()) {
          toast.warning(
            `${t("dashboardClient_orders_license1")} ${index + 1}: ${t(
              "dashboardClient_orders_computerNameRequired"
            )}`
          );
          licensesValid = true;
          return;
        }
        if (!user.identificationCode.trim()) {
          toast.warning(
            `${t("dashboardClient_orders_license1")} ${index + 1}: ${t(
              "dashboardClient_orders_idCodeRequired"
            )}`
          );
          licensesValid = true;
          return;
        }
      }
    );

    if (licensesValid) {
      return;
    }

    if (!formData.id_paiement.trim()) {
      toast.warning(t("dashboardClient_orders_paymentMethodRequired"));
      return;
    }

    // --- CASE 1: FREE TRIAL ---
    if (formData.freeTrial) {
      setLoading(true);
      try {
        const res = await apiClient.post("/rental/admin", {
          ...formData,
          users: formData.detailedUsers,
          daysUntilExpiration: formData.daysUntilExpiration
        });

        if (res.status === 201) {
          toast.success(t("dashboardClient_orders_paymentSuccess"));
          await localStorage.setItem("reloadCount", "0");
          navigate('/tableau-de-board/paiements', {
            state: {
              freetrial: formData.freeTrial,
              id: res.data.id,
            },
          });
        } else {
          toast.success(res.data.message);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Error creating free trial order");
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- CASE 2: PAID ORDER (Requires Stripe) ---
    if (!stripe || !elements) {
      toast.error(t("dashboardClient_orders_stripeNotReady"));
      return;
    }

    const NumberElement = elements.getElement(CardNumberElement);
    if (!NumberElement) {
      toast.error(t("dashboardClient_orders_enterCardInfo"));
      return;
    }

    try {
      setPaying(true);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: NumberElement,
        billing_details: {
          email: userData.email || "",
          name: userData.name || "",
        },
      });

      if (error) {
        toast.error(error.message || t("dashboardClient_orders_paymentError"));
        setPaying(false);
        return;
      }

      // Create Payment Intent
      const createIntentResponse = await apiClient.post("/rental/create-payment-intent", {
        ...formData,
        users: formData.detailedUsers,
        daysUntilExpiration: formData.daysUntilExpiration,
        paymentMethodId: paymentMethod.id,
      });

      let currentPaymentIntentId = createIntentResponse.data.payment_intent_id;
      let requiresAction = createIntentResponse.data.requires_action;

      if (requiresAction) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(createIntentResponse.data.client_secret);

        if (confirmError) {
          throw new Error(confirmError.message || "Échec de l'authentification 3D Secure");
        }

        currentPaymentIntentId = paymentIntent.id;
      }

      // Finalize Payment
      let confirmResponse = await apiClient.post("/rental/confirm-payment", {
        paymentIntentId: currentPaymentIntentId
      });

      while (confirmResponse.data.requires_action) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(confirmResponse.data.client_secret);

        if (confirmError) {
          throw new Error(confirmError.message || "Échec de l'authentification 3D Secure pour l'abonnement");
        }

        confirmResponse = await apiClient.post("/rental/confirm-payment", {
          paymentIntentId: paymentIntent.id
        });
      }

      toast.success(t("dashboardClient_orders_paymentSuccess"));
      await localStorage.setItem("reloadCount", "0");
      navigate("/tableau-de-board/paiements", {
        state: {
          id: confirmResponse.data.id,
          isSend: true,
        },
      });

    } catch (error: any) {
      toast.error(error.response?.data?.message || t("dashboardClient_orders_payment_decline"));
    } finally {
      setPaying(false);
    }
  };

  const verifyCoupon = async () => {
    try {
      // Check if code is empty
      if (!couponCode) {
        toast.warning(t("dashboardClient_orders_couponCodeRequired"));
        return;
      }

      // Call API
      const response = await couponById(couponCode);
      // console.log("Coupon response:", response);

      // Defensive checks
      if (!response) {
        toast.error("");
        return;
      }

      // Check HTTP status
      if (response?.id) {
        const coupon = response;

        // Update state
        setFormData((prev: any) => ({
          ...prev,
          id_coupon: coupon.id,
        }));

        setCouponValue({
          type: coupon.percent_off ? "percentage" : "fixed",
          value: coupon.percent_off || coupon.amount_off,
        });

        toast.success(t("dashboardClient_orders_couponApplied"));
      } else {
        // Display error returned by API or fallback message
        const message = response.data?.error;
        toast.warning(message);
      }
    } catch (error: any) {
      // console.error("verifyCoupon error:", error);

      // Handle network / unexpected errors gracefully
      if (error.response) {
        // Server responded with an error
        toast.error(error.response.data?.error);
      } else if (error.request) {
        // No response from server
        toast.error("error no coupon");
      } else {
        // Something unexpected happened
        toast.error("server error");
      }
    }
  };

  // Handle licenses count change
  const handleLicensesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const licenses = Number(e.target.value);
    if (licenses < 1) return; // prevent zero or negative licenses

    setFormData((prev: any) => {
      const users = [...prev.users];
      if (licenses > users.length) {
        // add empty user objects
        for (let i = users.length; i < licenses; i++) {
          users.push({
            username: "",
            email: "",
            computerName: "",
            identificationCode: "",
            startDate: prev.startDate || "",
            expirationDate: prev.expirationDate || "",
            excluded: false,
          });
        }
      } else if (licenses < users.length) {
        // truncate the users array
        users.splice(licenses);
      }
      return { ...prev, licenses, users };
    });
  };

  // Handle change for each user's Input
  const handleUserChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      const users = [...prev.users];
      users[index] = { ...users[index], [name]: value };
      return { ...prev, users };
    });
  };

  // Handle other Inputs like expirationDate and autoRenewal
  const handleOtherChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "expirationDate") {
      setValidateDateExp(false);
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const pricePerDay = freeTrial ? 0 : (userData.basedPrice || 5);

  const minExpirationDate = useMemo(() => {
    let referenceDate = new Date();

    if (selectedRegistrations.length > 0) {
      const dates = selectedRegistrations.map((id) => {
        const reg = registrationData.find((r) => r._id === id);
        return reg ? new Date(reg.expirationDate) : new Date();
      });
      referenceDate = new Date(Math.max(...dates.map((d: any) => d.getTime()), referenceDate.getTime()));
    } else if (licenses && licenses.length > 0) {
      const dates = licenses.map((l: any) => new Date(l.expirationDate));
      referenceDate = new Date(Math.max(...dates.map((d: any) => d.getTime()), referenceDate.getTime()));
    }

    const nextDay = new Date(referenceDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  }, [selectedRegistrations, registrationData, licenses]);

  useEffect(() => {
    setValidateDateExp(formData.expirationDate >= minExpirationDate);
  }, [formData.expirationDate, minExpirationDate]);

  const calculateAddedDays = (reg: any, index?: number) => {
    const targetDateStr = (formData.isUniformExpiration || index === undefined)
      ? formData.expirationDate
      : formData.users[index]?.expirationDate;

    if (!targetDateStr) return 0;
    const targetExp = new Date(targetDateStr);
    let currentExp = new Date();

    if (reg?.expirationDate) {
      const regExp = new Date(reg.expirationDate);
      if (regExp > currentExp) currentExp = regExp;
    }
    const diffTime = targetExp.getTime() - currentExp.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const totalAdditionalDays = formData.users.reduce((acc: number, user: any, index: number) => {
    if (user.excluded) return acc;
    const reg = registrationData.find(r => 
      (user.id && r._id === user.id) || 
      (user.identificationCode && r.computerCode === user.identificationCode)
    );

    return acc + calculateAddedDays(reg, index);
  }, 0);

  const includedLicensesCount = useMemo(() => {
    return formData.users.filter((u: any) => !u.excluded).length;
  }, [formData.users]);

  const discountType: any = "percent";
  const discountValue =
    discountType === "percent" ? CouponValue.value / 100 : CouponValue.value;
  const discountSup =
    includedLicensesCount > (SettingsData?.licenseThresholdForDiscount || 4)
      ? 0.1
      : 0;

  // Price based on TOTAL CUMULATIVE DAYS
  const basedPrice = totalAdditionalDays * pricePerDay;

  const totalHT =
    discountType === "percent"
      ? basedPrice * (1 - discountValue) * (1 - discountSup)
      : (basedPrice - discountValue) * (1 - discountSup);

  const tva = formData.tva / 100;

  let totalPayer = (totalHT * tva + totalHT).toFixed(2);

  useEffect(() => {
    // Pre-calculate individual details for each user
    const usersWithDetails = formData.users.map((user: any, index: number) => {
      const reg = registrationData.find(r => 
        (user.id && r._id === user.id) || 
        (user.identificationCode && r.computerCode === user.identificationCode)
      );

      const diffDays = calculateAddedDays(reg, index);
      
      return {
        ...user,
        addedDays: diffDays,
        priceHT: diffDays * pricePerDay,
        // In uniform mode, always use the global date (user may have changed it after initialization)
        expirationDate: formData.isUniformExpiration ? formData.expirationDate : (user.expirationDate || formData.expirationDate),
        startDate: formData.isUniformExpiration ? (formData.startDate || new Date().toISOString().split('T')[0]) : (user.startDate || formData.startDate || new Date().toISOString().split('T')[0]),
      };
    });

    // Sync calculated values to formData
    const activeDates = formData.users
      .filter((u: any) => !u.excluded && u.expirationDate)
      .map((u: any) => u.expirationDate);

    const currentMaxDate = (!formData.isUniformExpiration && activeDates.length > 0)
      ? activeDates.reduce((a: string, b: string) => (a > b ? a : b))
      : formData.expirationDate;

    setFormData((prev: any) => {
      // Only update if values actually changed to avoid infinite loops
      if (
        prev.totalPayer === totalPayer &&
        prev.daysUntilExpiration === totalAdditionalDays &&
        prev.expirationDate === currentMaxDate &&
        JSON.stringify(prev.detailedUsers) === JSON.stringify(usersWithDetails)
      ) {
        return prev;
      }

      return {
        ...prev,
        totalPayer: totalPayer,
        daysUntilExpiration: totalAdditionalDays,
        expirationDate: currentMaxDate,
        detailedUsers: usersWithDetails
      };
    });
  }, [totalPayer, totalAdditionalDays, formData.users, registrationData, pricePerDay, formData.isUniformExpiration]);

  const navigate = useNavigate();

  const [os, setOs] = useState<"Windows" | "Mac" | "Other">("Other");
  const [popupOs, setPopupOs] = useState(false);

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();
    if (platform.includes("win")) setOs("Windows");
    else if (platform.includes("mac")) setOs("Mac");
    else setOs("Other");
  }, []);

  const handleClick = () => {
    if (os === "Windows") {
      // cannot open settings directly, but you can open docs or show instructions
      window.open(
        "ms-settings:about",
        "_self"
      );
    } else if (os === "Mac") {
      // macOS doesn’t support a direct URL scheme for System Settings
      alert(
        "To find your computer name on Mac:\n1. Click the Apple menu \n2. Choose 'System Settings' → 'General' → 'About'\n3. See 'Name' at the top."
      );
    } else {
      setPopupOs(true);
    }
  };

  const [cardType, setCardType] = useState("");

  const handleCardNumberChange = (event: { brand: any; }) => {
    setCardType(event.brand);
  };

  // Map Stripe card brands to icons
  const getCardIcon = (brand: any) => {
    switch (brand) {
      case "visa":
        return <FaCcVisa className="text-2xl text-gray-600" />;
      case "mastercard":
        return <FaCcMastercard className="text-2xl text-gray-600" />;
      case "amex":
        return <FaCcAmex className="text-2xl text-gray-600" />;
      case "discover":
        return <FaCcDiscover className="text-2xl text-gray-600" />;
      default:
        return <FaCreditCard className="text-2xl text-gray-400" />; // fallback generic icon
    }
  };

  const handleQuickDate = (months: number) => {
    if (freeTrial) return;

    const today = new Date();
    const newDate = new Date(today.setMonth(today.getMonth() + months));

    // Format date as YYYY-MM-DD for the input
    const formattedDate = newDate.toISOString().split('T')[0];

    // Update your form data
    handleOtherChange({
      target: {
        name: 'expirationDate',
        value: formattedDate
      }
    });
  };

  useEffect(() => {
    if (!formData.freeTrial) return;

    const today = new Date();
    today.setDate(today.getDate() + 30);

    // Format date as YYYY-MM-DD for the input
    const formattedDate = today.toISOString().split('T')[0];
    handleOtherChange({
      target: {
        name: 'expirationDate',
        value: formattedDate
      }
    });

  }, [formData.freeTrial])

  const handleRegistrationSelect = (index: number, regId: string) => {
    const selectedReg = registrationData.find((r) => r._id === regId);

    setFormData((prev: any) => {
      const users = [...prev.users];
      if (selectedReg) {
        users[index] = {
          ...users[index],
          id: selectedReg._id,
          username: selectedReg.username || "",
          email: selectedReg.email || "",
          computerName: selectedReg.computerName || "",
          identificationCode: selectedReg.computerCode || "",
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          expirationDate: formData.expirationDate,
          excluded: false,
        };
      }
      return { ...prev, users };
    });

    // Update which registration is selected at that index
    setSelectedRegistrations((prev) => {
      const updated = [...prev];
      updated[index] = regId;
      return updated;
    });
  };

  const handleBulkSelect = (reg: any) => {
    const isSelected = selectedRegistrations.includes(reg._id);
    
    if (isSelected) {
      // Remove license
      const indexToRemove = selectedRegistrations.indexOf(reg._id);
      if (indexToRemove !== -1) {
        setFormData((prev: any) => {
          const newUsers = [...prev.users];
          newUsers.splice(indexToRemove, 1);
          // Ensure at least one empty slot if all removed
          if (newUsers.length === 0) {
            newUsers.push({
              username: "",
              email: "",
              computerName: "",
              identificationCode: "",
            });
          }
          return { ...prev, users: newUsers, licenses: newUsers.length };
        });
        setSelectedRegistrations(prev => prev.filter(id => id !== reg._id));
      }
    } else {
      // Add license
      setSelectedRegistrations(prev => [...prev, reg._id]);
      
      setFormData((prev: any) => {
        const newUsers = prev.users.filter((u: any) => u.identificationCode !== "");
        newUsers.push({
          id: reg._id,
          username: reg.username || "",
          email: reg.email || "",
          computerName: reg.computerName || "",
          identificationCode: reg.computerCode || "",
          startDate: prev.startDate || new Date().toISOString().split('T')[0],
          expirationDate: prev.expirationDate,
          excluded: false,
        });

        // Only move the global expiration date if the newly added workstation already expires later than our target
        const regExp = new Date(reg.expirationDate);
        const currentTarget = new Date(prev.expirationDate);
        let newExpirationDate = prev.expirationDate;

        if (regExp >= currentTarget) {
          // Set to next day after current expiry to ensure at least 1 day is added
          const nextDay = new Date(regExp);
          nextDay.setDate(nextDay.getDate() + 1);
          newExpirationDate = nextDay.toISOString().split('T')[0];
        }

        return { 
          ...prev, 
          users: newUsers, 
          licenses: newUsers.length,
          expirationDate: newExpirationDate 
        };
      });
    }
  };

  if (!userIdn.role) {
    return <Loading />;
  }

  if (!userData._id) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="space-y-6 mb-6">
      {/* popup for tell user how to find name of compter */}
      <Dialog open={popupOs} onOpenChange={setPopupOs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Find your computer name</DialogTitle>
            <DialogDescription>
              Choose your operating system below for detailed instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-3">
            {[
              {
                name: "Windows",
                href: "https://support.microsoft.com/en-us/office/do-you-need-help-locating-your-computer-name-00384381-8aa9-4398-b81b-475f09fed618",
                icon: "🪟",
              },
              {
                name: "Mac",
                href: "https://support.apple.com/en-us/HT201581",
                icon: "🍎",
              },
              {
                name: "Ubuntu / Debian",
                href: "https://tech.rochester.edu/tutorials/finding-the-computer-name-on-linux/",
                icon: "🐧",
              },
            ].map((os) => (
              <a
                key={os.name}
                href={os.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full rounded-lg border border-border bg-muted/30 px-4 py-2 transition-colors hover:bg-muted hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{os.icon}</span>
                  <span className="font-medium text-primary">{os.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  View guide ↗
                </span>
              </a>
            ))}
          </div>
          <DialogFooter className="mt-6">
            <Button onClick={() => setPopupOs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("dashboardClient_orders_addLicense")}{" "}
            {freeTrial && (
              <span className="">
                ({t("dashboardClient_orders_freeTrial")})
              </span>
            )}
          </h2>
          <p className="text-sm text-black/40">
            {t("dashboardClient_orders_fillLicenseInfo")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {(!userData.address || !userData.country) && (
            <div className="bg-yellow-100 flex items-center justify-between gap-2 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <MdInfo className="text-yellow-800 mt-1" />
                <p className="text-yellow-800 text-xs font-medium">
                  {t("dashboardClient_orders_completeCompanyInfoFirst")}
                </p>
              </div>
              <Link to="/tableau-de-board/parametres">
                <HiExternalLink />
              </Link>
            </div>
          )}
          <div className="bg-green-100 flex items-center justify-between gap-2 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <IoGift className="text-green-800" />
              <p className="text-xs font-medium">
                <span className="font-bold">-10%</span>{" "}
                {t("dashboardClient_orders_discountForMoreLicenses")}{" "}
                {SettingsData?.licenseThresholdForDiscount || 4}{" "}
                {t("dashboardClient_orders_licences")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-start max-lg:flex-col gap-5">
        <div className="w-[65%] max-lg:w-full flex flex-col gap-5">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            {/* En-tête avec icône */}
            <div className="flex items-center justify-between mb-3 pb-4 border-b border-gray-100">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {t("dashboardClient_orders_billingInfo")}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {t('dashboardClient_orders_info_fac')}
                </p>
              </div>
              <Link 
                to="/tableau-de-board/parametres" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <HiExternalLink className="w-3 h-3" />
                {t("dashboardClient_orders_editProfile")}
              </Link>
            </div>

            {/* Grille des informations */}
            <div className="space-y-6">
              {/* Ligne 1 - Société/Nom et Adresse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {userData.clientType === 'company' ? <Building2 className="w-4 h-4 text-gray-400" /> : 
                     userData.clientType === 'professional' ? <Briefcase className="w-4 h-4" /> : 
                     <UserIcon className="w-4 h-4 text-gray-400" />}
                    {userData.clientType === 'company' ? t("dashboardClient_orders_companyName") : 
                     userData.clientType === 'professional' ? "Nom complet (ou nom commercial)" : 
                     "Nom complet"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="company"
                      name="company"
                      value={userData.clientType === 'individual' ? userData.name : userData.company}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {userData.clientType === 'company' ? <Building2 className="h-5 w-5 text-gray-400" /> : 
                       userData.clientType === 'professional' ? <Briefcase className="h-5 w-5 text-gray-400" /> : 
                       <UserIcon className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adress" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t("dashboardClient_orders_address")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="adress"
                      name="adress"
                      value={userData.address}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ligne 2 - Pays et TVA */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pays" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("dashboardClient_orders_country")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="pays"
                      name="pays"
                      value={countries.find((e) => e.code === userData.country)?.name || userData.country}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tvanum" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    {t("pay_01_tva")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="tvanum"
                      name="tvanum"
                      value={userData.nTva || "Non renseigné"}
                      readOnly
                      className="bg-gray-50 border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-mono text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note informative */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">{t('dashboardClient_orders_fac_title')}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {t('dashboardClient_orders_subtitle')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm">
            {/* Header Section */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {t("dashboardClient_orders_licenseInfo")}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {t('dashboardClient_orders_subtitle_licence')}
                </p>
              </div>
            </div>

            {/* Global License Selection */}
            {!licenses && registrationData.length > 0 && (
              <div className="mb-10">
                {/* Enhanced Info Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-6 rounded-r-2xl shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FaDesktop className="text-blue-600 text-base" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">
                        {t("dashboardClient_orders_manageFleet")}
                      </h4>
                      <p className="text-xs text-blue-700 mt-1.5 leading-relaxed font-medium">
                        {t("dashboardClient_orders_manageFleetDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registrationData.map((reg) => {
                    const isSelected = selectedRegistrations.includes(reg._id);
                    const isExpired = new Date(reg.expirationDate) < new Date();
                    
                    return (
                      <div 
                        key={reg._id}
                        onClick={() => handleBulkSelect(reg)}
                        className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${
                          isSelected 
                          ? "border-blue-500 bg-blue-50/40 shadow-md transform scale-[1.01]" 
                          : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "bg-blue-600 border-blue-600 rotate-0" : "bg-white border-slate-200 group-hover:border-blue-300 -rotate-12"
                        }`}>
                          {isSelected && <FaCheck className="text-white text-[10px] stroke-[3]" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className={`text-sm font-bold truncate transition-colors ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                            {reg.computerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                            }`}>
                              {isExpired ? "Expiré" : `Expire le ${new Date(reg.expirationDate).toLocaleDateString()}`}
                            </span>

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[11px] text-slate-400 italic flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  {t("dashboardClient_orders_syncNote")}
                </p>
              </div>
            )}

            {/* Number of Licenses */}
            <div className="mb-6">
              <Label htmlFor="licenses" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("dashboardClient_orders_numberOfLicenses")}
              </Label>
              <div className="relative">
                <Input
                  id="licenses"
                  name="licenses"
                  type="number"
                  min={1}
                  value={formData.licenses}
                  onChange={handleLicensesChange}
                  readOnly={freeTrial || licenses?.length > 0}
                  className="bg-gray-50 border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expiration Logic Selector (From Admin) */}
            <div className="mb-8">
              <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                Mode d'expiration
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, isUniformExpiration: false }));
                    setValidateDateExp(true);
                  }}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group",
                    !formData.isUniformExpiration 
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" 
                      : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      !formData.isUniformExpiration ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500"
                    )}>
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className={cn(
                        "font-bold text-sm",
                        !formData.isUniformExpiration ? "text-blue-900" : "text-slate-700"
                      )}>
                        Individuelle
                      </h6>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Une date spécifique pour chaque licence
                      </p>
                    </div>
                    {!formData.isUniformExpiration && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setFormData((prev: any) => ({ ...prev, isUniformExpiration: true }));
                    setValidateDateExp(false);
                  }}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group",
                    formData.isUniformExpiration 
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" 
                      : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      formData.isUniformExpiration ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500"
                    )}>
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className={cn(
                        "font-bold text-sm",
                        formData.isUniformExpiration ? "text-blue-900" : "text-slate-700"
                      )}>
                        Uniforme
                      </h6>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Une seule date pour toutes les licences
                      </p>
                    </div>
                    {formData.isUniformExpiration && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* User Licenses */}
            <div className="space-y-4">
              {formData.users.map((user: any, index: number) => (
                <div
                  key={index}
                  className="p-6 border-2 border-slate-100 rounded-xl bg-gradient-to-r from-slate-50 to-white-50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-lg">
                      {t("dashboardClient_orders_license1")} {index + 1}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full border transition-all duration-300",
                        user.excluded 
                          ? "bg-slate-100 text-slate-400 border-slate-200" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        + {calculateAddedDays(registrationData.find(r => 
                          (user.id && r._id === user.id) || 
                          (user.identificationCode && r.computerCode === user.identificationCode)
                        ), index)} j
                      </span>
                      {!user.excluded && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Expire le: {formatDate(formData.isUniformExpiration ? formData.expirationDate : (user.expirationDate || formData.expirationDate))}
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
                        <input
                          type="checkbox"
                          checked={!user.excluded}
                          onChange={(e) => {
                            const users = [...formData.users];
                            users[index] = { ...users[index], excluded: !e.target.checked };
                            setFormData((prev: any) => ({ ...prev, users }));
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">
                          Inclure
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className={cn("transition-opacity duration-200", user.excluded && "opacity-40 grayscale pointer-events-none")}>
                    {
                      !formData.freeTrial && (
                        <div className="grid grid-cols-1 gap-2 mb-4">
                          <Label htmlFor={`username-${index}`} className="text-sm font-medium text-gray-700">
                            Licences de période d'essai
                          </Label>
                          <Select
                            onValueChange={(value) => handleRegistrationSelect(index, value)}
                            value={selectedRegistrations[index] || ""}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionnez une licence non liée" />
                            </SelectTrigger>
                            <SelectContent>
                              {registrationData.filter((reg) => !selectedRegistrations.includes(reg._id) || selectedRegistrations[index] === reg._id).map((reg) => (
                                <SelectItem key={reg._id} value={reg._id}>
                                  <span className="text-sm font-medium">{reg.username} ({reg.computerName})</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    }

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor={`username-${index}`} className="text-sm font-medium text-gray-700">
                          {t("dashboardClient_orders_username")}
                        </Label>
                        <Input
                          id={`username-${index}`}
                          name="username"
                          placeholder={t("dashboardClient_orders_username")}
                          value={user.username}
                          onChange={(e) => handleUserChange(index, e)}
                          readOnly={licenses?.length > 0}
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor={`email-${index}`} className="text-sm font-medium text-gray-700">
                          {t("dashboardClient_orders_email")}
                        </Label>
                        <div className="relative">
                          <Input
                            id={`email-${index}`}
                            name="email"
                            type="email"
                            placeholder="support@ferracad.com"
                            value={user.email}
                            onChange={(e) => handleUserChange(index, e)}
                            readOnly={licenses?.length > 0}
                            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-10"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 font-medium">
                          {t("dashboardClient_orders_authCodeSent")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      {/* Computer Name */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`computerName-${index}`} className="text-sm font-medium text-gray-700">
                            {t("dashboardClient_orders_computerName")}
                          </Label>
                        </div>
                        <Input
                          id={`computerName-${index}`}
                          name="computerName"
                          placeholder="Nom de votre ordinateur"
                          value={user.computerName}
                          onChange={(e) => handleUserChange(index, e)}
                          readOnly={licenses?.length > 0}
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleClick}
                          className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
                        >
                          {t('dashboardClient_orders_computerNameRequired_how')}
                        </button>
                        <p className="text-xs text-gray-500">
                          {t("dashboardClient_orders_computerNameHint")}
                        </p>
                      </div>

                      {/* Identification Code */}
                      <div className="space-y-2">
                        <Label htmlFor={`identificationCode-${index}`} className="text-sm font-medium text-gray-700">
                          {t("dashboardClient_orders_idCode")}
                        </Label>
                        <Input
                          id={`identificationCode-${index}`}
                          name="identificationCode"
                          placeholder="Code d'identification unique"
                          value={user.identificationCode}
                          onChange={(e) => handleUserChange(index, e)}
                          readOnly={licenses?.length > 0}
                          className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                        />
                        <p className="text-xs text-gray-500">
                          {t("dashboardClient_orders_idCodeHint")}
                        </p>
                      </div>
                    </div>

                    {!formData.isUniformExpiration && (
                      <div className="mt-6 p-4 bg-blue-50/30 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-blue-800">
                            Date de début (Poste {index + 1})
                          </Label>
                          <DatePicker
                            date={user.startDate ? parseISO(user.startDate) : undefined}
                            setDate={(date) => {
                              if (date) {
                                handleUserChange(index, { target: { name: 'startDate', value: format(date, 'yyyy-MM-dd') } } as any);
                              }
                            }}
                            className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-blue-800">
                            Date d'expiration (Poste {index + 1})
                          </Label>
                          <DatePicker
                            date={user.expirationDate ? parseISO(user.expirationDate) : undefined}
                            setDate={(date) => {
                              if (date) {
                                handleUserChange(index, { target: { name: 'expirationDate', value: format(date, 'yyyy-MM-dd') } } as any);
                              }
                            }}
                            className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Expiration Date Section (Uniform only) */}
            {formData.isUniformExpiration && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate" className="text-sm font-semibold text-gray-800">
                      {t("dashboardClient_orders_expirationDate")}
                    </Label>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Date Input with Icon */}
                      <div className="relative flex-1">
                        <DatePicker
                          date={formData.expirationDate ? parseISO(formData.expirationDate) : undefined}
                          setDate={(date) => {
                            if (date) {
                              handleOtherChange({ target: { name: 'expirationDate', value: format(date, 'yyyy-MM-dd') } });
                            }
                          }}
                          placeholder={t("dashboardClient_orders_expirationDate")}
                        />
                      </div>

                      {/* Validation Button */}
                      <button
                        type="button"
                        onClick={() => setValidateDateExp(true)}
                        disabled={!formData.expirationDate || freeTrial}
                        className="px-6 py-2.5 h-11 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-transparent rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 shadow-sm hover:shadow-md"
                      >
                        {"Validate Date"}
                      </button>
                    </div>
                  </div>

                  {/* Quick Date Selection */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickDate(2)}
                          disabled={formData.freeTrial}
                          className="px-4 py-2 text-xs font-medium bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                          2 mois
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDate(3)}
                          disabled={formData.freeTrial}
                          className="px-4 py-2 text-xs font-medium bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                          3 mois
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickDate(6)}
                          disabled={formData.freeTrial}
                          className="px-4 py-2 text-xs font-medium bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                          6 mois
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Hint Text */}
                  <p className="text-xs text-blue-600 leading-relaxed font-medium bg-blue-50/50 p-2 rounded border border-blue-100">
                    <FaInfoCircle className="inline mr-1 mb-0.5" />
                    {selectedRegistrations.length > 0 || (licenses && licenses.length > 0)
                      ? `Date minimale requise : ${new Date(minExpirationDate).toLocaleDateString()} (pour prolonger vos licences sélectionnées).`
                      : t("dashboardClient_orders_expirationDateHint") || "La date à laquelle la licence expirera (minimum 1 jour)."}
                  </p>

                  {/* Validation Status */}
                  {ValidateDateExp && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700 font-medium">Date validée avec succès</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auto Renewal 
              {!freeTrial && (
                <div className="flex items-center gap-3 mt-4 p-3 bg-white rounded-lg border border-gray-200">
                  <input
                    id="autoRenewal"
                    name="autoRenewal"
                    type="checkbox"
                    checked={formData.autoRenewal}
                    onChange={handleOtherChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="autoRenewal" className="text-xs text-gray-700 cursor-pointer">
                    {t("dashboardClient_orders_enableAutoRenewal")}
                  </Label>
                  <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Recommandé
                  </div>
                </div>
              )*/}
            </div>
          </div>
        <div className="flex flex-col gap-5 w-[35%] max-lg:w-full sticky top-5">
          <div className="bg-white p-10 rounded-lg z-50 shadow-sm">
            <h4 className="text-sm font-bold mb-6">
              {t("dashboardClient_orders_billingSummary")}
            </h4>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {t("checkout_price_j")} ({includedLicensesCount}{" "}
                {includedLicensesCount > 1 ? t("checkout_licences") : t("checkout_licence")})
              </span>
              <span className="font-bold text-sm">
                {includedLicensesCount * pricePerDay} €
              </span>
            </div>

            <div className="flex flex-col mb-4 border-b border-gray-100 pb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-700">{t("pay_01_exp_date")}</span>
                <span className="font-bold text-sm text-gray-900">
                  {formData.expirationDate ? formatDate(formData.expirationDate) : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-700">{t("dashboardClient_orders_cumulativeDays")}</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">
                  {totalAdditionalDays} {t("pay_03_j")}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight">
                {t("dashboardClient_orders_cumulativeDaysNote")}
              </p>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {t("checkout_discount")}
              </span>
              <span className="font-bold text-sm text-red-600">
                -{" "}
                {discountType === "percent"
                  ? (discountValue * 100).toFixed(2)
                  : discountValue.toFixed(2)}{" "}
                {discountType === "percent" ? "%" : "€"}
              </span>
            </div>

            <div className="flex justify-between mb-2 pb-2">
              <span className="text-sm font-medium">
                {t("pay_03_discount")}
              </span>
              <span className="font-bold text-sm text-red-600">
                - {(discountSup * 100).toFixed(2)} %
              </span>
            </div>

            <div className="flex justify-between mb-2 pt-4 border-t border-gray-300">
              <span className="text-sm font-medium">
                {t("checkout_sous_total")}
              </span>
              <span className="font-bold text-sm">{totalHT} €</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                {t("checkout_tva")} ({(tva * 100).toFixed(2)} %)
              </span>
              <span className="font-bold text-sm">
                {(totalHT * tva).toFixed(2)} €
              </span>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-gray-100 mb-6 bg-gradient-to-r from-transparent to-primary/5 -mx-10 px-10 py-4">
              <span className="font-bold text-gray-900">{t("checkout_total")}</span>
              <div className="flex flex-col items-end">
                {(CouponValue.value > 0 || includedLicensesCount > 4) && (
                  <span className="line-through text-red-500 text-[10px] font-medium">
                    {(basedPrice * (1 + tva)).toFixed(2)} € TTC
                  </span>
                )}
                <span className="text-xl font-black text-primary leading-none">{totalPayer} €</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-1">TVA Incluse ({formData.tva}%)</span>
              </div>
            </div>

            <div className="relative text-[#B2BCCA] w-full mb-7">
              <label
                htmlFor="promo"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("checkout_code_discount")}
              </label>
              <input
                type="text"
                id="promo"
                name="promo"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={t("dashboardClient_orders_typeHere")}
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                required
              />
              <div className="absolute right-2 top-0 h-full flex items-center">
                <button
                  onClick={verifyCoupon}
                  className="bg-secondary text-xs p-2 px-5 font-bold text-stone-100 rounded-lg transition-all duration-200 hover:bg-stone-700 cursor-pointer"
                >
                  {t("checkout_check")}
                </button>
              </div>
            </div>

            <div className="relative text-[#B2BCCA] w-full mb-4">
              <label
                htmlFor="manoteil"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("checkout_note")}
              </label>
              <textarea
                placeholder={t("dashboardClient_orders_typeHere")}
                name="message"
                onChange={handleOtherChange}
                value={formData.message}
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                rows={3}
              ></textarea>
            </div>
          </div>
          <div className="bg-white p-10 rounded-lg z-50 shadow-sm">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <FaLock className="text-green-600 text-sm" />
                  <span className="text-green-700 text-xs font-medium">{t('pay_04_title_secure')}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('pay_04_title_new')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('pay_04_subtitle')}
              </p>
            </div>

            {/* Payment Form */}
            <div className="mx-auto space-y-4 mb-6">
              <div>
                <Label className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                  {t("dashboardClient_orders_cardNumber")}
                  <div className="flex gap-2">
                    <FaCcVisa className="text-blue-900 text-sm" title="Visa" />
                    <FaCcMastercard className="text-red-600 text-sm" title="Mastercard" />
                    <FaCcAmex className="text-blue-600 text-sm" title="American Express" />
                    <FaCcDiscover className="text-orange-600 text-sm" title="Discover" />
                    <FaCcDinersClub className="text-green-700 text-sm" title="Diners Club" />
                  </div>
                </Label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white shadow-sm">
                  {getCardIcon(cardType)}
                  <CardNumberElement
                    options={ELEMENT_OPTIONS}
                    onChange={handleCardNumberChange}
                    className="w-full bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex max-2xl:flex-col max-2xl:space-y-4 space-x-4">
                {/* Expiration */}
                <div className="w-1/2 max-2xl:w-full">
                  <Label className="text-gray-900 font-medium mb-2">
                    {t("dashboardClient_orders_expiration")}
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white shadow-sm">
                    <FaCalendarAlt className="text-gray-500 text-sm" />
                    <CardExpiryElement
                      options={ELEMENT_OPTIONS}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* CVC */}
                <div className="w-1/2 max-2xl:w-full">
                  <Label className="text-gray-900 font-medium mb-2 flex items-center gap-2">
                    {t("dashboardClient_orders_cvc")}
                    <span className="text-xs text-gray-500">({t('pay_04_ccv_num')})</span>
                  </Label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-3 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white shadow-sm">
                    <FaLock className="text-gray-500 text-sm" />
                    <CardCvcElement
                      options={ELEMENT_OPTIONS}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  <strong>{t('pay_04_way_store_title')} :</strong> {t('pay_04_way_store_subtitle')}
                </p>
              </div>
            </div>

            {/* Terms Agreement - Improved */}
            <label className="flex items-start space-x-3 text-xs text-gray-700 mb-6 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 text-blue-600 focus:ring-blue-500 rounded"
                name="agree"
                checked={formData.agree}
                onChange={handleOtherChange}
                required
              />
              <p
                className="font-medium text-stone-500"
                dangerouslySetInnerHTML={{
                  __html: t("checkout_checkbox_description"),
                }}
              />
            </label>

            {/* Payment Button */}
            <button
              className={`w-full bg-blue-900 cursor-pointer transition-all duration-200 hover:bg-blue-800 text-white py-3 rounded-lg font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${(!formData.agree || paying) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              onClick={handleSubmit}
              disabled={!formData.agree || paying}
            >
              <div className="flex items-center justify-center gap-2">
                {paying ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaLock className="text-white" />
                )}
                <span>{paying ? t("checkout_processing") || "Traitement..." : `${t("checkout_paiment")} ${totalPayer} €`}</span>
              </div>
            </button>

            {/* Enhanced Secure Footer */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  <FaLock className="text-green-600" style={{ display: 'none' }} />
                </div>
                <p className="text-center font-medium text-xs text-gray-500">
                  {t("dashboardClient_orders_paymentSecureStripe")}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div>
        <p className="text-center font-medium text-sm">
          {t("dashboardClient_orders_problemContact")}{" "}
          <Link to="/contact" className="underline">
            {t("dashboardClient_orders_contactUsNow")}
          </Link>
        </p>
      </div>
    </>
  );
};

export default NewLicence;
