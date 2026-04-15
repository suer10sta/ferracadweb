import { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    setSettingsData({
      name: userData?.name,
      company: userData?.company,
      email: userData?.email,
      phone: userData?.phone,
      address: userData?.address,
      postal: userData?.postal,
      city: userData?.city,
      country: userData?.country,
      nTva: userData?.nTva,
      photoProfile: userData?.photoProfile
        ? `${import.meta.env.VITE_API_BASED_URL}/uploads/profile/${
            userData.photoProfile
          }`
        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD-ea1oy4pyFqyT1NAg5MX792lRkucCPKvhA&s",
      platform: userData.platform,
    });
  }, [loading]);

  const updateSettingsData = (key: string, value: string) => {
    setSettingsData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (
      !settingsData.name ||
      !settingsData.email ||
      !settingsData.address ||
      !settingsData.country
    ) {
      toast.warning(t("dashboard_product_missingInfo"));
      return;
    }

    if (settingsData.nTva) {
      const expReg = countries.find((e) => e.code === settingsData.country);

      if (expReg?.VATFormat) {
        // Nettoyer l'expression régulière (enlever les slashs et guillemets)
        const formate = expReg.VATFormat;
        const cleanExp = formate.replace(/^\/|\/$/g, "");
        const regex = new RegExp(cleanExp);

        if (!regex.test(settingsData.nTva)) {
          // Numéro TVA invalide
          toast.warning(`Format TVA invalide pour ${expReg.name}.`);
          return false;
        }
      }
    }

    try {
      const res = await apiClient.put("/user", settingsData);
      if (res.status === 200) {
        toast.success(t("dashboardAdmin_users_updateSuccess"));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.error(error.response.data.message)
      toast.warning(error.response.data.message);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("dashboard_settings_title")}
          </h2>
          <p className="text-sm text-black/40">
            {t("dashboard_settings_generalConfiguration")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            {t("dashboard_settings_general")}
          </TabsTrigger>
          {/*<TabsTrigger value="paiement">Configuration de paiement</TabsTrigger>*/}
          <TabsTrigger value="system">
            {t("dashboard_settings_system")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="border-0">
              <CardHeader>
                <CardTitle>{t("dashboard_settings_generalInfo")}</CardTitle>
                <CardDescription>
                  {t("dashboard_settings_profileInfoDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative flex items-center gap-5">
                    <img
                      crossOrigin="anonymous"
                      src={settingsData.photoProfile}
                      alt="user"
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex flex-col items-start">
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
                        className="bg-gray-200 px-4 py-2 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:bg-gray-100 cursor-pointer"
                      >
                        <TfiImport />
                        <span className="font-medium text-sm">
                          {t("dashboard_settings_import")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-black/60 mt-2">
                    {t("dashboard_settings_size_max")}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm flex gap-3">
                      {t("dashboard_settings_invid")}:{" "}
                      <span className="text-black/40">
                        {userData.invitationId}
                      </span>
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => copyToClipboard(userData.invitationId)}
                      >
                        <IoCopyOutline className="w-4 h-4" />
                      </button>
                      <Drawer direction="right">
                        <DrawerTrigger asChild>
                          <button className="p-2">
                            <LuSend className="w-4 h-4" />
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
                              {/* Email Input */}
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
                                {/* Email Tags */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">
                        {t("dashboard_settings_name")} *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={settingsData.name}
                        onChange={(e) =>
                          updateSettingsData("name", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="company">
                        {t("dashboard_settings_company")}
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={settingsData.company}
                        onChange={(e) =>
                          updateSettingsData("company", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">
                        {t("dashboard_settings_email")} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={settingsData.email}
                        onChange={(e) =>
                          updateSettingsData("email", e.target.value)
                        }
                      />
                    </div>

                    {/* platform */}
                    <div className="flex flex-col gap-2">
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

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="phone">
                        {t("dashboard_settings_phone")}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={settingsData.phone}
                        onChange={(e) =>
                          updateSettingsData("phone", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="address">
                        {t("dashboard_settings_address")} *
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={settingsData.address}
                        onChange={(e) =>
                          updateSettingsData("address", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="postal">
                        {t("dashboard_settings_postalCode")}
                      </Label>
                      <Input
                        id="postal"
                        type="text"
                        value={settingsData.postal}
                        onChange={(e) =>
                          updateSettingsData("postal", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="city">
                        {t("dashboard_settings_city")}
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        value={settingsData.city}
                        onChange={(e) =>
                          updateSettingsData("city", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="country">
                        {t("dashboard_settings_country")} *
                      </Label>
                      <Select
                        name="country"
                        value={settingsData.country}
                        onValueChange={(e) => updateSettingsData("country", e)}
                      >
                        <SelectTrigger id="country" className="w-full">
                          <SelectValue
                            placeholder={t("dashboard_settings_selectCountry")}
                          />
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

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="nTva">{t("pay_01_tva")}</Label>
                      <Input
                        id="nTva"
                        type="text"
                        value={settingsData.nTva}
                        onChange={(e) =>
                          updateSettingsData("nTva", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="px-6">
                    {t("dashboard_settings_saveChanges")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/*<TabsContent value="paiement">
          <Card className="border-0">
            <CardHeader>
              <CardTitle>Configuration de Paiement</CardTitle>
              <CardDescription>Définissez vos préférences de paiement et connectez vos méthodes de transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-col gap-4 mb-5">
                  <div className='bg-blue-100 flex items-center gap-2 p-3 rounded-lg'>
                    <FaInfoCircle className='text-blue-800 mt-1' />
                    <p className='text-xs font-medium'>Vous avez accès à la modification, à la suppression ou à l'ajout de plusieurs modes de paiement que vous ajoutez.</p>
                  </div>
                  {
                    payConfig.map((p: any, i: React.Key | null | undefined)=> (
                      <div key={i} className={`flex items-center gap-4 justify-between`}>
                        <div className="flex items-center gap-2">
                          {
                            p.email ? (
                              <>
                                <FaPaypal />
                                <p className="font-medium text-sm">{p.email}</p>
                              </>
                            ) : (
                              <>
                                <FaCcVisa />
                                <p className="font-medium text-sm">{p.numberCart.slice(0, 4)} **** **** ****</p>
                              </>
                            )
                          }
                        </div>
                        <div className="flex gap-3 items-center">
                          <button>
                            <GoPencil />
                          </button>
                          <button>
                            <MdDeleteOutline />
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div>
                  <Tabs defaultValue="cart">
                    <TabsList>
                      <TabsTrigger value="cart">Carte bancaire</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>

                    <TabsContent value="cart" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Numéro de carte</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="expiry-date">Date d’expiration</Label>
                          <Input id="expiry-date" placeholder="MM/AA" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="card-name">Nom sur la carte</Label>
                        <Input id="card-name" placeholder="Jean Dupont" />
                      </div>

                      <Button className="w-full mt-4">Valider le paiement</Button>
                    </TabsContent>

                    <TabsContent value="paypal" className="space-y-2 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="paypal-email">Adresse e-mail PayPal</Label>
                        <Input id="paypal-email" type="email" placeholder="votre.email@exemple.com" />
                      </div>

                      <Button className="w-full mt-4">Se connecter à PayPal</Button>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  <p className="font-medium text-xs  text-center w-1/2">Toutes les informations de configuration de paiement sont entièrement chiffrées et sécurisées, afin de garantir la confidentialité et la protection de vos données.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>*/}

        <TabsContent value="system">
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("dashboard_settings_systemSecurity")}
              </CardTitle>
              <CardDescription>
                {t("dashboard_settings_advancedSystemSettings")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Change Password */}
              <div className="space-y-4">
                <div className="grid gap-2">
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

                <div className="grid gap-2">
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

                <div className="grid gap-2">
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

                <Button onClick={handlePasswordChange}>
                  {t("dashboard_settings_updatePassword")}
                </Button>
              </div>

              {/* 2FA Toggle */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">
                      {t("dashboard_settings_2FA")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard_settings_2FADescription")}
                    </p>
                  </div>
                  <Switch checked={is2FAEnabled} onCheckedChange={change2Fa} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsClient;
