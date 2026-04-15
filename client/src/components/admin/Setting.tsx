import React, { useEffect, useRef, useState } from "react";
import { Globe, Shield, Mail, Edit2, Trash2, Plus, Info } from "lucide-react";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { settings as getSettingsData, user } from "@/data/mockData";
import { FaPlus } from "react-icons/fa6";
import { FaDiscord, FaDribbble, FaFacebook, FaGithub, FaInstagram, FaLinkedin, FaMedium, FaPinterest, FaReddit, FaSlack, FaSnapchat, FaSoundcloud, FaTelegram, FaTiktok, FaTumblr, FaTwitch, FaTwitter, FaWeibo, FaWhatsapp, FaYoutube } from "react-icons/fa";
import countriesData from "@/data/countries.json"
import { toast } from "sonner";
import apiClient from "@/services/api";
import { MdDeleteOutline } from "react-icons/md";


import Loading from "../elements/Loading";
import { useLanguage } from "@/lang/LanguageProvider";
import { TfiImport } from "react-icons/tfi";
import api from "@/services/api";
import countries from "@/data/countries.json"

const SettingsAdmin: React.FC = () => {
  const { t } = useLanguage();

  const [settings, setSettings] = useState<any>({});
  const [userData, setuserData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState<any>({});

  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateData, setTemplateData] = useState({ name: "", subject: "", body: "" });
  const [templateLoading, setTemplateLoading] = useState(false);


  useEffect(() => {
    const getData = async () => {
      try {
        const getUser = await user();
        const getSettigns = await getSettingsData();

        setuserData(getUser);
        setSettings(getSettigns);

        // Fetch email templates
        const templatesRes = await apiClient.get("/email-templates");
        setEmailTemplates(templatesRes.data);
      } catch (error) {

        // console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }

    getData()
  }, [loading])


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
      iban: userData?.iban,
      factureMail: userData?.factureMail,
      photoProfile: userData?.photoProfile ? `${import.meta.env.VITE_API_BASED_URL}/uploads/profile/${userData.photoProfile}` : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD-ea1oy4pyFqyT1NAg5MX792lRkucCPKvhA&s",
    })
  }, [loading])

  const updateSettingsData = (key: string, value: string) => {
    setSettingsData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSocialMedia = (platform: string, url: string) => {
    setSettings((prev: { socialMedia: any; }) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: url },
    }));
  };

  const handleSave = async () => {
    if (
      !settingsData.name ||
      !settingsData.company ||
      !settingsData.email ||
      !settingsData.address ||
      !settingsData.country
    ) {
      toast.warning(t('dashboard_product_missingInfo'))
      return;
    }


    if (settingsData.nTva) {
      const expReg = countries.find((e) => e.code === settingsData.country);

      if (expReg?.VATFormat) {
        // Nettoyer l'expression régulière (enlever les slashs et guillemets)
        const formate = expReg.VATFormat
        const cleanExp = formate.replace(/^\/|\/$/g, '');
        const regex = new RegExp(cleanExp);

        if (!regex.test(settingsData.nTva)) {
          // Numéro TVA invalide
          toast.warning(`Format TVA invalide pour ${expReg.name}.`)
          return false;
        }
      }
    }

    setLoading(true)
    try {
      const res = await apiClient.put("/user", settingsData);
      if (res.status === 200) {
        toast.success(t('dashboardAdmin_users_updateSuccess'));
      } else {
        toast.warning(res.data.message);
      }
    } catch (error: any) {
      // console.error(error);
      toast.warning(error.response.data.message);
    } finally {
      // setLoading(true);
    }
  };

  const socialMediaIcons: any = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    pinterest: FaPinterest,
    tiktok: FaTiktok,
    snapchat: FaSnapchat,
    reddit: FaReddit,
    tumblr: FaTumblr,
    github: FaGithub,
    discord: FaDiscord,
    twitch: FaTwitch,
    telegram: FaTelegram,
    whatsapp: FaWhatsapp,
    weibo: FaWeibo,
    medium: FaMedium,
    dribbble: FaDribbble,
    slack: FaSlack,
    soundcloud: FaSoundcloud,
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const change2Fa = async (value: boolean) => {
    setIs2FAEnabled(value);
    try {
      const res = await apiClient.put("/auth/2fac", { is2FAEnabled: value })
      if (res.status === 200) {
        toast.success(t('dashboardClient_orders_operationSuccess'))
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      // console.error(error)
      toast.warning(error.response.data.message)
    }
  };

  useEffect(() => {
    setIs2FAEnabled(userData?.twoFac)
  }, [userData])

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.warning(t('form_02_error_password_mismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.warning(t('dashboard_settings_passwordMinLength'));
    }

    try {
      const res = await apiClient.put("/auth", { currentPassword, newPassword, confirmPassword });
      if (res.status = 200) {
        toast.success(t('dashboard_settings_passwordUpdated'))
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      // console.error(error)
      toast.warning(error.response.data.message)
    } finally {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [socialLink, setSocialLink] = useState<string>("");

  const handleUpdateSettings = async (type: string, value = "") => {
    try {
      setLoading(true)
      let data;
      if (type === "social media new") {
        if (!selectedPlatform || !socialLink) {
          toast.warning(t('dashboard_product_missingInfo'));
          return
        }
        const updatedSocialMedia = {
          ...settings.socialMedia,
          [selectedPlatform]: socialLink
        };

        data = {
          ...settings,
          socialMedia: updatedSocialMedia,
          type: "social media",
        }
      } else {
        data = {
          ...settings,
          type,
          value
        }
      }


      const res = await apiClient.put("/settings", data)
      if (res.status === 200) {
        toast.success("Paramètres mis à jour.");
        if (type === 'statut') {
          updateSetting(
            "siteStatus",
            value
          )
        }
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      // console.error(error);
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: string, value: any, langCode?: string) => {
    setSettings((prev: any) => {
      // Handle multilingual SEO fields
      if (["seoTitle", "seoDescription", "seoTags"].includes(key) && langCode) {
        return {
          ...prev,
          [key]: {
            ...prev[key],
            [langCode]: value,   // Update only the selected language
          },
        };
      }

      // Default for other non-multilingual fields
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const removeSocialMedia = (platform: string) => {
    setSettings((prev: any) => {
      const updated = { ...prev.socialMedia };
      delete updated[platform];

      return {
        ...prev,
        socialMedia: updated
      };
    });
  };

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "Anglais" },
    { code: "fl", label: "Nederlands" },
  ]

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
      toast.warning("L'image doit être inférieure à 1 Mo")
      e.target.value = ""; // reset input
      return;
    }

    // Prepare data for upload
    const formData = new FormData();
    formData.append("photo", file);

    setLoading(true)
    try {
      // Optionally show loading indicator here
      const response = await api.put("/user/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        window.location.reload();
        toast.success("Photo téléchargée avec succès !")
      } else {
        toast.warning(response.data.message)
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload photo.");
    } finally {
      // Clear the input to allow re-uploading the same file if needed
      setLoading(false)
      e.target.value = "";
    }
  };

  const handleCreateOrUpdateTemplate = async () => {
    if (!templateData.name || !templateData.subject || !templateData.body) {
      toast.warning("Veuillez remplir tous les champs.");
      return;
    }

    setTemplateLoading(true);
    try {
      if (selectedTemplate) {
        const res = await apiClient.put(`/email-templates/${selectedTemplate._id}`, templateData);
        if (res.status === 200) {
          setEmailTemplates(prev => prev.map(t => t._id === selectedTemplate._id ? res.data : t));
          toast.success("Modèle d'e-mail mis à jour.");
        }
      } else {
        const res = await apiClient.post("/email-templates", templateData);
        if (res.status === 201) {
          setEmailTemplates(prev => [...prev, res.data]);
          toast.success("Modèle d'e-mail créé.");
        }
      }
      setIsTemplateModalOpen(false);
      setTemplateData({ name: "", subject: "", body: "" });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce modèle ?")) return;

    try {
      const res = await apiClient.delete(`/email-templates/${id}`);
      if (res.status === 200) {
        setEmailTemplates(prev => prev.filter(t => t._id !== id));
        toast.success("Modèle d'e-mail supprimé.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  const openEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateData({
      name: template.name,
      subject: template.subject,
      body: template.body
    });
    setIsTemplateModalOpen(true);
  };


  if (loading) {
    return <Loading />
  }
  return (
    <div className="space-y-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('dashboard_settings_title')}</h2>
          <p className="text-sm text-black/40">
            {t('dashboard_settings_generalConfiguration')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t('dashboard_settings_general')}</TabsTrigger>
          {/*<TabsTrigger value="appearance">Apparence</TabsTrigger>*/}
          <TabsTrigger value="seo">{t('dashboard_settings_seo')}</TabsTrigger>
          <TabsTrigger value="social">{t('dashboard_settings_socialMedia')}</TabsTrigger>
          <TabsTrigger value="emails">Modèles d'e-mails</TabsTrigger>
          <TabsTrigger value="system">{t('dashboard_settings_system')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card className="border-0">
              <CardHeader>
                <CardTitle>{t('dashboard_settings_generalInfo')}</CardTitle>
                <CardDescription>
                  {t('dashboard_settings_profileInfoDescription')}
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
                        <span className="font-medium text-sm">{t('dashboard_settings_import')}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-black/60 mt-2">{t('dashboard_settings_size_max')}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">{t('dashboard_settings_name')} *</Label>
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
                      <Label htmlFor="email">{t('dashboard_settings_email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settingsData.email}
                        onChange={(e) =>
                          updateSettingsData("email", e.target.value)
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="phone">{t('dashboard_settings_phone')}</Label>
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
                      <Label htmlFor="address">{t('dashboard_settings_address')}</Label>
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
                      <Label htmlFor="postal">{t('dashboard_settings_postalCode')}</Label>
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
                      <Label htmlFor="city">{t('dashboard_settings_city')}</Label>
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
                      <Label htmlFor="country">{t('dashboard_settings_country')} *</Label>
                      <Select name="country" value={settingsData.country} onValueChange={(e) => updateSettingsData("country", e)}>
                        <SelectTrigger id="country" className='w-full'>
                          <SelectValue placeholder={t('dashboard_settings_selectCountry')} />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            countriesData.map((country, index) => (
                              <SelectItem key={index} value={country.code}>{country.name}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>

                    {
                      userData.mainAccount && (
                        <>
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="company">{t('dashboard_settings_company')} *</Label>
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
                            <Label htmlFor="nTva">{t('pay_01_tva')} *</Label>
                            <Input
                              id="nTva"
                              type="text"
                              value={settingsData.nTva}
                              onChange={(e) =>
                                updateSettingsData("nTva", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="iban">IBAN</Label>
                            <Input
                              id="iban"
                              type="text"
                              value={settingsData.iban}
                              onChange={(e) =>
                                updateSettingsData("iban", e.target.value)
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label htmlFor="factureMail">Email de la Société</Label>
                            <Input
                              id="factureMail"
                              type="text"
                              value={settingsData.factureMail}
                              onChange={(e) =>
                                updateSettingsData("factureMail", e.target.value)
                              }
                            />
                          </div>
                        </>
                      )
                    }


                  </div>
                  <Button onClick={handleSave} className="mt-4 px-6">{t('dashboard_settings_saveChanges')}</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t('dashboard_settings_siteStatus')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard_settings_siteStatusDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="site-status">{t('dashboard_settings_maintenanceMode')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard_settings_enableMaintenanceMode')}
                      </p>
                    </div>
                    <Switch
                      id="site-status"
                      checked={settings?.siteStatus === "maintenance" ? true : false}
                      onCheckedChange={(checked) => {
                        handleUpdateSettings("statut", checked ? "maintenance" : "active")
                      }
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('dashboard_settings_currentStatus')}</span>
                    <Badge
                      variant={
                        settings?.siteStatus === "active"
                          ? "default"
                          : "destructive"
                      }
                      className={
                        settings?.siteStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {settings?.siteStatus === "active" ? t('dashboard_settings_active') : t('dashboard_settings_maintenance')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0">
                <CardHeader>
                  <CardTitle>{t('dashboard_settings_licenseAndDiscounts')}</CardTitle>
                  <CardDescription>
                    {t('dashboard_settings_autoDiscountConfig')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="license-threshold">
                      {t('dashboard_settings_licenseThreshold')}
                    </Label>
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        id="license-threshold"
                        type="number"
                        value={settings?.licenseThresholdForDiscount}
                        onChange={(e) =>
                          updateSetting(
                            "licenseThresholdForDiscount",
                            parseInt(e.target.value)
                          )
                        }
                        className="max-w-xs"
                      />
                      <Button onClick={() => handleUpdateSettings("licenses remise")}>{t('dashboard_settings_apply')}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard_settings_minLicensesForDiscount')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card className="border-0">
            <CardHeader>
              <CardTitle>{t('dashboard_settings_seoConfig')}</CardTitle>
              <CardDescription>
                {t('dashboard_settings_metaConfig')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  {languages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      {lang.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {languages.map((langflag) => (
                  <TabsContent key={langflag.code} value={langflag.code}>
                    <div>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="seo-title">{t('dashboard_settings_siteTitle')} ({langflag.label})</Label>
                          <Input
                            id="seo-title"
                            value={settings?.seoTitle[langflag.code]}
                            onChange={(e) => updateSetting("seoTitle", e.target.value, langflag.code)}
                            placeholder={t('dashboard_settings_searchTitle')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="seo-description">
                            {t('dashboard_settings_description')} ({langflag.label})
                          </Label>
                          <Textarea
                            id="seo-description"
                            value={settings?.seoDescription[langflag.code]}
                            onChange={(e) =>
                              updateSetting("seoDescription", e.target.value, langflag.code)
                            }
                            placeholder={t('dashboard_settings_shortDescription')}
                            rows={3}
                            maxLength={220}
                          />
                          <p className="text-sm text-muted-foreground">
                            {settings?.seoDescription[langflag.code]?.length}/{t('dashboard_settings_charactersRecommended')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('dashboard_settings_seoKeywords')} ({langflag.label})</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {settings?.seoTags?.[langflag.code]?.map((tag: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer"
                                onClick={() => {
                                  setSettings((prev: any) => ({
                                    ...prev,
                                    seoTags: {
                                      ...prev.seoTags,
                                      [langflag.code]: prev.seoTags[langflag.code].filter(
                                        (t: string) => t !== tag
                                      ),
                                    },
                                  }));
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Input
                            placeholder={t('dashboard_settings_addKeywords')}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                const newTags = e.currentTarget.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean);

                                const existingTags = settings?.seoTags?.[langflag.code] || [];

                                updateSetting("seoTags", [...existingTags, ...newTags], langflag.code);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleUpdateSettings("seo")} className="mt-4 px-6">{t('dashboard_settings_saveChanges')}</Button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="border-0">
            <CardHeader>
              <div className="flex items-center justify-between max-lg:flex-wrap max-lg:gap-5">
                <div>
                  <CardTitle>{t('dashboard_settings_socialMediaLinks')}</CardTitle>
                  <CardDescription>
                    {t('dashboard_settings_socialMediaLinksDescription')}
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="max-lg:w-full max-lg:justify-center text-xs font-medium p-2 px-4 rounded-lg bg-stone-200 flex items-center gap-2 transition-all duration-200 hover:bg-stone-300 cursor-pointer">
                      <FaPlus />
                      {t('dashboard_settings_addNew')}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('dashboard_settings_addNewSocialMedia')}</DialogTitle>
                      <DialogDescription>
                        {t('dashboard_settings_addNewSocialMediaDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="socialicon">{t('dashboard_settings_socialMediaLinks')}</Label>
                        <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('dashboard_settings_chooseSocialMedia')} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(socialMediaIcons)
                              .filter((key) => !(key in (settings.socialMedia || {})))
                              .map((key) => (
                                <SelectItem key={key} value={key}>
                                  {capitalize(key)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="socialMedia">{t('dashboard_settings_link')}</Label>
                        <div>
                          <Input
                            id="socialMedia"
                            name="socialMedia"
                            placeholder={`${selectedPlatform || "facebook"}.com/`}
                            value={socialLink}
                            onChange={(e) => setSocialLink(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t('dashboardAdmin_users_cancel')}</Button>
                      </DialogClose>
                      <Button onClick={() => handleUpdateSettings("social media new")}>{t('dashboard_settings_saveChanges')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings?.socialMedia && Object.entries(settings?.socialMedia).map(([platform, url]: any) => {
                const IconComp = socialMediaIcons[platform]
                return (
                  <div key={platform} className="border border-stone-200 p-3 pl-5 text-sm rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 w-[80%]">
                      <IconComp className="m-0" />
                      <input
                        id={platform}
                        value={url}
                        onChange={(e) =>
                          updateSocialMedia(platform, e.target.value)
                        }
                        placeholder={`https://${platform}.com/votre-profil`}
                        className="w-full outline-none"
                      />
                    </div>
                    <button onClick={() => removeSocialMedia(platform)}>
                      <MdDeleteOutline />
                    </button>
                  </div>
                )
              })}
              <Button onClick={() => handleUpdateSettings("social media")} className="mt-4 px-6">{t('dashboard_settings_saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2.5 text-xl font-semibold tracking-tight">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    Modèles d'e-mails
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-sm text-gray-500">
                    Gérez vos modèles d'e-mails. Utilisez <code className="px-1.5 py-0.5 bg-gray-100 rounded-md text-xs font-mono text-primary">{'{{name}}'}</code> pour personnaliser le sujet et le corps du message.
                  </CardDescription>
                </div>

                <Dialog open={isTemplateModalOpen} onOpenChange={(open) => {
                  setIsTemplateModalOpen(open);
                  if (!open) {
                    setSelectedTemplate(null);
                    setTemplateData({ name: "", subject: "", body: "" });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 shadow-sm transition-all duration-200 hover:shadow-md">
                      <Plus className="h-4 w-4" />
                      Nouveau modèle
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                      <DialogTitle className="text-xl font-semibold tracking-tight">
                        {selectedTemplate ? "Modifier le modèle" : "Créer un modèle d'e-mail"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-500">
                        Configurez le sujet et le contenu de votre e-mail. Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 px-6 py-5">
                      <div className="space-y-2">
                        <Label htmlFor="template-name" className="text-sm font-medium">
                          Nom du modèle <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="template-name"
                          value={templateData.name}
                          onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                          placeholder="Ex: Bienvenue, Confirmation de commande..."
                          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="template-subject" className="text-sm font-medium">
                          Sujet de l'e-mail <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="template-subject"
                          value={templateData.subject}
                          onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                          placeholder="Sujet de l'e-mail '{{name}}'"
                          className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="template-body" className="text-sm font-medium">
                            Corps de l'e-mail <span className="text-red-500">*</span>
                          </Label>
                          <span className="text-xs text-gray-400">Markdown supporté</span>
                        </div>
                        <Textarea
                          id="template-body"
                          value={templateData.body}
                          onChange={(e) => setTemplateData({ ...templateData, body: e.target.value })}
                          placeholder="Bonjour {{name}},

Nous sommes ravis de vous accueillir..."
                          rows={10}
                          className="font-mono text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <Info className="h-3.5 w-3.5 text-blue-600" />
                          <p className="text-xs text-blue-700">
                            Variables disponibles : <code className="px-1.5 py-0.5 bg-white rounded text-blue-800 font-mono font-medium">{'{{name}}'}</code>
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                      <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)} className="gap-2">
                        Annuler
                      </Button>
                      <Button onClick={handleCreateOrUpdateTemplate} disabled={templateLoading} className="gap-2 shadow-sm">
                        {templateLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          selectedTemplate ? "Mettre à jour" : "Créer le modèle"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="grid gap-3">
                {emailTemplates.length === 0 ? (
                  <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                    <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucun modèle disponible</p>
                    <p className="text-sm text-gray-400 mt-1">Créez votre premier modèle d'e-mail pour commencer</p>
                  </div>
                ) : (
                  emailTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-gray-300 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h4 className="font-semibold text-gray-900 text-base">{template.name}</h4>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 font-normal text-xs px-2.5 py-0.5 rounded-full border-0">
                              Sujet: {template.subject}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                            {template.body}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTemplate(template)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteTemplate(template._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="system">
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('dashboard_settings_systemSecurity')}
              </CardTitle>
              <CardDescription>{t('dashboard_settings_advancedSystemSettings')}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Change Password */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">{t('dashboard_settings_currentPassword')}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">{t('dashboard_settings_newPassword')}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">{t('dashboard_settings_confirmPassword')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button onClick={handlePasswordChange}>{t('dashboard_settings_updatePassword')}</Button>
              </div>

              {/* 2FA Toggle */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{t('dashboard_settings_2FA')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard_settings_2FADescription')}
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

export default SettingsAdmin;
