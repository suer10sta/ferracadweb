import { useEffect, useRef, useState } from "react";
import { Shield, User, Building2, Briefcase, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { user } from "@/data/mockData";
import countriesData from "@/data/countries.json";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import apiClient from "@/services/api";
import Loading from "../elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import api from "@/services/api";
import { TfiImport } from "react-icons/tfi";
import { IoCopyOutline } from "react-icons/io5";
import { LuSend } from "react-icons/lu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import countries from "@/data/countries.json";

const getVatFormatDescription = (countryCode: string): string => {
  const country = countries.find((e) => e.code === countryCode);
  if (!country || !country.VATFormat) return "";

  const cleanExp = country.VATFormat.replace(/^\/|\/$/g, "");

  // Specific user-friendly descriptions for common EU formats
  if (countryCode === "FR") {
    return "Format requis : FR + 2 caractères (lettres/chiffres) + 9 chiffres. Exemple : FR89123456789. Ne pas saisir le SIRET (14 chiffres).";
  }
  if (countryCode === "BE") {
    return "Format requis : BE + 10 chiffres. Exemple : BE0123456789.";
  }
  if (countryCode === "IE") {
    return "Format requis : IE + 1 chiffre + 1 lettre/chiffre (ou +/*) + 5 chiffres + 1 lettre. Exemple : IE8D23456T.";
  }
  if (countryCode === "ES") {
    return "Format requis : ES + 1 lettre/chiffre + 7 chiffres + 1 lettre/chiffre. Exemple : ESX1234567Y.";
  }
  if (countryCode === "CY") {
    return "Format requis : CY + 8 chiffres + 1 lettre. Exemple : CY12345678X.";
  }
  if (countryCode === "IN") {
    return "Format requis : 11 chiffres + 1 lettre + 1 chiffre + Z + 1 lettre/chiffre (15 caractères au total). Exemple : 22AAAAA1111A1Z1.";
  }

  // Refined generic parser to convert regex to human-readable format
  let desc = cleanExp
    .replace(/\^/g, "")
    .replace(/\$/g, "")
    .replace(/\{1\}/g, "") // Remove quantifier of exactly 1
    .replace(/-\?/g, " - (optionnel) "); // Replace optional hyphen early

  // Handle custom bracket ranges with min,max (e.g. [A-Z&Ñ]{3,4})
  desc = desc.replace(/\[([^\]]+)\]\{(\d+),(\d+)\}/g, (_, chars, min, max) => {
    let type = "caractères";
    if (chars.includes("A-Z") && chars.includes("0-9")) type = "lettres/chiffres";
    else if (chars.includes("A-Z")) type = "lettres";
    else if (chars.includes("0-9") || chars.includes("\\d")) type = "chiffres";
    return ` + ${min} à ${max} ${type}`;
  });

  // Handle custom bracket ranges with exact count (e.g. [A-Z0-9]{3})
  desc = desc.replace(/\[([^\]]+)\]\{(\d+)\}/g, (_, chars, count) => {
    let type = "caractères";
    if (chars.includes("A-Z") && chars.includes("0-9")) type = "lettres/chiffres";
    else if (chars.includes("A-Z")) type = "lettres";
    else if (chars.includes("0-9") || chars.includes("\\d")) type = "chiffres";
    return ` + ${count} ${type}`;
  });

  desc = desc
    .replace(/\\d\{(\d+)\}/g, (_, count) => ` + ${count} chiffres`)
    .replace(/\\d\{(\d+),(\d+)\}/g, (_, min, max) => ` + ${min} à ${max} chiffres`)
    .replace(/\[([^\]]+)\]/g, (_, chars) => {
      if (chars.length === 1) return chars;
      if (chars.includes("+") || chars.includes("*")) return " + 1 lettre/chiffre/symbole";
      if (chars.includes("A-Z") && chars.includes("0-9")) return " + 1 lettre/chiffre";
      if (chars.includes("A-Z")) return " + 1 lettre";
      if (chars.includes("0-9") || chars.includes("\\d")) return " + 1 chiffre";
      return " + 1 caractère";
    })
    .replace(/\\d/g, " + 1 chiffre")
    .replace(/\|/g, " OU ")
    .replace(/\\/g, "")
    .replace(/\s*-\s*\(optionnel\)\s*\+\s*/g, " - (optionnel) ") // Clean up plus signs after optional hyphens
    .replace(/\s*\+\s*-\s*\(optionnel\)\s*/g, " - (optionnel) ") // Clean up plus signs before optional hyphens
    .replace(/\s*\+\s*/g, " + ") // Clean spaces around plus signs
    .trim();

  // If the string starts with a plus, remove it
  if (desc.startsWith("+")) {
    desc = desc.substring(1).trim();
  }

  return `Format requis : ${desc}`;
};

const SettingsClient = () => {
  const { t } = useLanguage();
  const [userData, setuserData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const getUser = await user();

        setuserData(getUser || []);
      } catch (error) {
        // console.error('Failed to fetch rentals:', error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const [settingsData, setSettingsData] = useState<any>({});

  useEffect(() => {
    let initialType: "individual" | "company" | "professional" = "individual";
    let vatSubject = false;

    if (userData?.company) {
      if (userData?.nTva) {
        initialType = "company";
        vatSubject = true;
      } else {
        initialType = "professional"; // Map back to 'professional' internally if needed, or update to 'autoentrepreneur'
        vatSubject = false;
      }
    }

    setSettingsData({
      name: userData?.name || "",
      company: userData?.company || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      postal: userData?.postal || "",
      city: userData?.city || "",
      country: userData?.country || "",
      nTva: userData?.nTva || "",
      photoProfile: userData?.photoProfile
        ? `${import.meta.env.VITE_API_BASED_URL}/uploads/profile/${
            userData.photoProfile
          }`
        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD-ea1oy4pyFqyT1NAg5MX792lRkucCPKvhA&s",
      platform: userData.platform || "",
      clientType: userData?.clientType || initialType, // Use the DB field if it exists
      isVatSubject: vatSubject,
    });
  }, [loading, userData]);

  const updateSettingsData = (key: string, value: any) => {
    setSettingsData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    const { clientType, isVatSubject, name, company, email, address, country, nTva } = settingsData;

    if (!email || !address || !country) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }

    if (clientType === "individual" && !name) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }

    if ((clientType === "company" || clientType === "professional") && !company) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }

    if ((clientType === "company" || (clientType === "professional" && isVatSubject)) && !nTva) {
      toast.warning("Le numéro de TVA est requis.");
      return;
    }

    if (settingsData.nTva && (clientType === 'company' || (clientType === 'professional' && isVatSubject))) {
      const expReg = countries.find((e) => e.code === settingsData.country);

      if (expReg?.VATFormat) {
        const formate = expReg.VATFormat;
        const cleanExp = formate.replace(/^\/|\/$/g, "");
        const regex = new RegExp(cleanExp);

        if (!regex.test(settingsData.nTva)) {
          toast.warning(`Format TVA invalide pour ${expReg.name}.`);
          return false;
        }
      }
    }

    // Clean data before sending to API
    const dataToSend = { ...settingsData };
    
    if (clientType === "individual") {
      dataToSend.company = "";
      dataToSend.nTva = "";
      dataToSend.isVatSubject = false;
    } else if (clientType === "company") {
      dataToSend.isVatSubject = true; // Companies are always VAT subject in this logic
    } else if (clientType === "professional" && !isVatSubject) {
      dataToSend.nTva = "";
    }

    try {
      const res = await apiClient.put("/user", dataToSend);
      if (res.status === 200) {
        toast.success(t("dashboardAdmin_users_updateSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      toast.warning(error.response?.data?.message || "Une erreur est survenue");
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const change2Fa = async (value: boolean) => {
    setIs2FAEnabled(value);
    try {
      const res = await apiClient.put("/auth/2fac", { is2FAEnabled: value });
      if (res.status === 200) {
        toast.success(t("dashboardClient_orders_operationSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.error(error)
      toast.warning(error.response.data.message);
    }
  };

  useEffect(() => {
    setIs2FAEnabled(userData?.twoFac);
  }, [userData]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.warning(t("form_02_error_password_mismatch"));
      return;
    }

    if (newPassword.length < 8) {
      toast.warning(t("dashboard_settings_passwordMinLength"));
    }

    try {
      const res = await apiClient.put("/auth", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if ((res.status = 200)) {
        toast.success(t("dashboard_settings_passwordUpdated"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.error(error)
      toast.warning(error.response.data.message);
    } finally {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // uploaded photo profile
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (1 MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      toast.warning("L'image doit être inférieure à 1 Mo");
      e.target.value = ""; // reset input
      return;
    }

    // Prepare data for upload
    const formData = new FormData();
    formData.append("photo", file);

    setLoading(true);
    try {
      // Optionally show loading indicator here
      const response = await api.put("/user/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        window.location.reload();
        toast.success("Photo téléchargée avec succès !");
      } else {
        toast.warning(response.data.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload photo.");
    } finally {
      // Clear the input to allow re-uploading the same file if needed
      setLoading(false);
      e.target.value = "";
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

  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddEmail = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = inputValue.trim().replace(",", "");
      if (value && !emails.includes(value)) {
        setEmails([...emails, value]);
      }
      setInputValue("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length === 0) {
      return toast.warning("Veuillez ajouter au moins un email.");
    }
    setLoading(true);
    try {
      // Example API call
      const res = await api.post("/user/invitation", {
        invitationId: userData.invitationId,
        emails,
      });

      if (res.status === 200) {
        toast.success("Invitations envoyées avec succès !");
        setEmails([]);
      } else {
        toast.warning(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invitations.");
    } finally {
      setLoading(false);
    }
  };

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

  if (!userData._id) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Billing Information */}
        <Card className="xl:col-span-7 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>{t("dashboardClient_orders_billingInfo")}</CardTitle>
            <CardDescription>
              {t("dashboardClient_orders_info_fac")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    crossOrigin="anonymous"
                    src={settingsData.photoProfile}
                    alt="user"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/10 shadow-md"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="photoprofile"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={handleClick}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  >
                    <TfiImport className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h3 className="font-semibold text-lg">{settingsData.name}</h3>
                  <p className="text-sm text-muted-foreground">{settingsData.email}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded text-muted-foreground">
                      {t("dashboard_settings_invid")}: {userData.invitationId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(userData.invitationId)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title={t("dashboardClient_orders_code_copied")}
                    >
                      <IoCopyOutline className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <Drawer direction="right">
                      <DrawerTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <LuSend className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </DrawerTrigger>

                      <DrawerContent className="border-l p-6">
                        <div className="flex flex-col h-full">
                          <DrawerHeader>
                            <DrawerTitle>
                              {t("dashboard_settings_invid_title")}
                            </DrawerTitle>
                            <DrawerDescription>
                              {t("dashboard_settings_invid_sub_title")}
                            </DrawerDescription>
                          </DrawerHeader>

                          <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto"
                          >
                            <div>
                              <label className="text-sm font-medium">
                                {t("dashboard_settings_invid_email_label")}
                              </label>
                              <Input
                                type="email"
                                placeholder={t(
                                  "dashboard_settings_invid_email_input"
                                )}
                                value={inputValue}
                                onChange={(e) =>
                                  setInputValue(e.target.value)
                                }
                                onKeyDown={handleAddEmail}
                              />
                              <div className="flex flex-wrap gap-2 mt-2">
                                {emails.map((email) => (
                                  <button
                                    key={email}
                                    className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-sm cursor-pointer"
                                    onClick={() => handleRemoveEmail(email)}
                                  >
                                    {email}
                                    <span className="text-muted-foreground hover:text-destructive">
                                      ×
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <DrawerFooter className="mt-auto flex justify-end gap-2 border-t pt-4">
                              <DrawerClose asChild>
                                <Button variant="outline">
                                  {t("dashboardAdmin_users_cancel")}
                                </Button>
                              </DrawerClose>
                              <Button type="submit" disabled={loading}>
                                {loading
                                  ? `${t(
                                      "dashboard_settings_invid_email_loading"
                                    )}...`
                                  : t("dashboard_settings_invid_email_btn")}
                              </Button>
                            </DrawerFooter>
                          </form>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-xl border border-primary/10 space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                    <User className="w-4 h-4" /> Type de client
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Sélectionnez votre statut juridique pour adapter la facturation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "individual", label: "Particulier", icon: User, desc: "Physique" },
                    { id: "company", label: "Entreprise", icon: Building2, desc: "Société" },
                    { id: "professional", label: "Auto-entrepreneur", icon: Briefcase, desc: "Indépendant" },
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => updateSettingsData("clientType", type.id)}
                      className={`relative overflow-hidden cursor-pointer p-3 rounded-lg border-2 transition-all duration-300 group ${
                        settingsData.clientType === type.id
                          ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
                          : "border-muted bg-card hover:border-primary/40 hover:bg-primary/[0.01]"
                      }`}
                    >
                      <div className="flex flex-col gap-1.5 relative z-10">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                          settingsData.clientType === type.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <type.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs">{type.label}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{type.desc}</p>
                        </div>
                      </div>
                      {settingsData.clientType === type.id && (
                        <CheckCircle2 className="absolute top-2 right-2 w-3.5 h-3.5 text-primary" />
                      )}
                      <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                        settingsData.clientType === type.id ? "w-full" : "w-0"
                      }`} />
                    </div>
                  ))}
                </div>

                <div className="transition-all duration-300 ease-in-out">
                  {settingsData.clientType === "individual" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-200 text-blue-700 animate-in fade-in slide-in-from-top-1">
                      <div className="p-1.5 bg-blue-100 rounded-md shrink-0">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">Régime Particulier</p>
                        <p className="text-[10px] leading-tight opacity-90">La TVA est appliquée normalement sur toutes vos factures conformément à la réglementation.</p>
                      </div>
                    </div>
                  )}

                  {settingsData.clientType === "company" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-orange-50/50 border border-orange-200 text-orange-700 animate-in fade-in slide-in-from-top-1">
                      <div className="p-1.5 bg-orange-100 rounded-md shrink-0">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">Régime Entreprise</p>
                        <p className="text-[10px] leading-tight opacity-90">Autoliquidation : En tant qu'entreprise hors Belgique (UE), renseignez votre n° de TVA pour être facturé Hors Taxes (HT).</p>
                      </div>
                    </div>
                  )}

                  {settingsData.clientType === "professional" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
                        <div className="flex items-center gap-2.5">
                          <Switch
                            id="vat-subject"
                            className="scale-90"
                            checked={settingsData.isVatSubject}
                            onCheckedChange={(val) => updateSettingsData("isVatSubject", val)}
                          />
                          <div>
                            <Label htmlFor="vat-subject" className="text-xs font-bold">Assujetti à la TVA</Label>
                            <p className="text-[9px] text-muted-foreground">Cochez si vous collectez et déduisez la TVA.</p>
                          </div>
                        </div>
                      </div>
                      
                      {settingsData.isVatSubject ? (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-orange-50/50 border border-orange-200 text-orange-700">
                          <div className="p-1.5 bg-orange-100 rounded-md shrink-0">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold">Possibilité d’autoliquidation</p>
                            <p className="text-[10px] leading-tight opacity-90">En tant qu'auto-entrepreneur assujetti, vous devez fournir un numéro de TVA valide.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-200 text-blue-700">
                          <div className="p-1.5 bg-blue-100 rounded-md shrink-0">
                            <Info className="w-3.5 h-3.5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold">En franchise de TVA</p>
                            <p className="text-[10px] leading-tight opacity-90">Régime de franchise de taxe : L'autoliquidation ne s'applique pas et la TVA doit être facturée normalement.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {settingsData.clientType === "individual" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("dashboard_settings_name")} *</Label>
                    <Input
                      id="name"
                      value={settingsData.name}
                      onChange={(e) => updateSettingsData("name", e.target.value)}
                    />
                  </div>
                )}

                {settingsData.clientType === "company" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">{t("dashboard_settings_company")} *</Label>
                    <Input
                      id="company"
                      value={settingsData.company}
                      onChange={(e) => updateSettingsData("company", e.target.value)}
                    />
                  </div>
                )}

                {settingsData.clientType === "professional" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Nom complet (ou nom commercial s’il existe) *</Label>
                    <Input
                      id="company"
                      value={settingsData.company}
                      onChange={(e) => updateSettingsData("company", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t("dashboard_settings_email")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settingsData.email}
                    onChange={(e) => updateSettingsData("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    name="platform"
                    value={settingsData.platform}
                    onValueChange={(e) => updateSettingsData("platform", e)}
                  >
                    <SelectTrigger id="platform" className="w-full">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((plat, index) => (
                        <SelectItem key={index} value={plat.value}>
                          {plat.label === "Touts" ? "-" : plat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("dashboard_settings_phone")}</Label>
                  <Input
                    id="phone"
                    value={settingsData.phone}
                    onChange={(e) => updateSettingsData("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("dashboard_settings_address")} *</Label>
                  <Input
                    id="address"
                    value={settingsData.address}
                    onChange={(e) => updateSettingsData("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal">{t("dashboard_settings_postalCode")}</Label>
                  <Input
                    id="postal"
                    value={settingsData.postal}
                    onChange={(e) => updateSettingsData("postal", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("dashboard_settings_city")}</Label>
                  <Input
                    id="city"
                    value={settingsData.city}
                    onChange={(e) => updateSettingsData("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">{t("dashboard_settings_country")} *</Label>
                  <Select
                    name="country"
                    value={settingsData.country}
                    onValueChange={(e) => updateSettingsData("country", e)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder={t("dashboard_settings_selectCountry")} />
                    </SelectTrigger>
                    <SelectContent>
                      {countriesData.map((country, index) => (
                        <SelectItem key={index} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(settingsData.clientType === "company" || (settingsData.clientType === "professional" && settingsData.isVatSubject)) && (
                  <div className="space-y-2">
                    <Label htmlFor="nTva">{t("pay_01_tva")} *</Label>
                    <Input
                      id="nTva"
                      value={settingsData.nTva}
                      onChange={(e) => updateSettingsData("nTva", e.target.value)}
                    />
                    {settingsData.country && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                        <span>{getVatFormatDescription(settingsData.country)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8">
                  {t("dashboard_settings_saveChanges")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System & Security */}
        <Card className="xl:col-span-5 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("dashboard_settings_systemSecurity")}
            </CardTitle>
            <CardDescription>
              {t("dashboard_settings_advancedSystemSettings")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col gap-8">
              {/* Change Password */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t("dashboard_settings_updatePassword")}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">
                      {t("dashboard_settings_currentPassword")}
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">
                      {t("dashboard_settings_newPassword")}
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      {t("dashboard_settings_confirmPassword")}
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} className="w-full">
                    {t("dashboard_settings_updatePassword")}
                  </Button>
                </div>
              </div>

              {/* Security Options */}
              <div className="space-y-6">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t("dashboard_settings_2FA")}
                </h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-muted">
                  <div className="space-y-1 pr-4">
                    <p className="text-sm font-medium">
                      {t("dashboard_settings_2FA")}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("dashboard_settings_2FADescription")}
                    </p>
                  </div>
                  <Switch checked={is2FAEnabled} onCheckedChange={change2Fa} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsClient;
