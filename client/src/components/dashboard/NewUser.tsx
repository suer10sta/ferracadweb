import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import countries from "@/data/countries.json";
import { useLanguage } from "@/lang/LanguageProvider";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { FaPlus } from "react-icons/fa";

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

const NewUser = ({ type = "normal" }: any) => {
  const { t } = useLanguage();
  const [_, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
    country: "",
    nTva: "",
    basedPrice: "5",
    isAdmin: true,
    role: "client",
    platform: "-",
  });

  const roles = [
    {
      label: "Client",
      value: "client",
    },
    {
      label: "Administrateur",
      value: "admin",
    },
  ];

  const handleChangeRole = (role: string) => {
    setFormData((prev) => ({ ...prev, role: role }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChangePlatform = (value: string) => {
    setFormData((prev) => ({ ...prev, platform: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.country
    ) {
      toast.warning(t("dashboardAdmin_users_allFieldsRequired"));
      return;
    }

    if (formData.role === "client") {
      if (Number(formData.basedPrice) <= 0) {
        toast.warning(t("dashboardAdmin_users_allFieldsRequired"));
        return;
      }
    }

    if (formData.nTva) {
      const expReg = countries.find((e) => e.code === formData.country);

      if (expReg?.VATFormat) {
        // Nettoyer l'expression régulière (enlever les slashs et guillemets)
        const formate = expReg.VATFormat;
        const cleanExp = formate.replace(/^\/|\/$/g, "");
        const regex = new RegExp(cleanExp);

        if (!regex.test(formData.nTva)) {
          // Numéro TVA invalide
          toast.warning(`Format TVA invalide pour ${expReg.name}.`);
          return false;
        }
      }
    }

    setLoading(true);

    try {
      const res = await apiClient.post("/user/create", formData);
      if (res.status === 201) {
        toast.success(t("dashboardAdmin_users_registrationSuccess"));
        setFormData({
          name: "",
          company: "",
          email: "",
          password: "",
          phone: "",
          address: "",
          postal: "",
          city: "",
          country: "",
          nTva: "",
          isAdmin: true,
          basedPrice: "",
          role: "client",
          platform: "-",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {type === "normal" ? (
          <Button className="w-fit bg-stone-800 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboardAdmin_users_newUser")}
          </Button>
        ) : (
          <button className="border rounded-full text-xs p-2 transition-all duration-200 hover:bg-stone-900 hover:text-white cursor-pointer">
            <FaPlus />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="w-1/2 max-md:w-[90%] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("dashboardAdmin_users_addUser")}</DialogTitle>
          <DialogDescription>
            {t("dashboardAdmin_users_fillInfo")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              {roles.map((role, i) => (
                <button
                  key={i}
                  onClick={() => handleChangeRole(role.value)}
                  className={`${
                    formData.role === role.value
                      ? "bg-stone-900 text-white"
                      : ""
                  } rounded-full text-xs px-4 p-1`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          {/* Name */}
          <div className="grid gap-3">
            <Label htmlFor="name">{t("dashboardAdmin_users_name")}</Label>
            <Input id="name" name="name" onChange={handleChange} />
          </div>

          {formData.role === "client" && (
            <>
              <div className="grid gap-3">
                <Label htmlFor="basedPrice">Prix ​​de base (EUR) *</Label>
                <Input
                  type="number"
                  id="basedPrice"
                  min={1}
                  name="basedPrice"
                  onChange={handleChange}
                  value={formData.basedPrice}
                />
              </div>
              {/* Company */}
              <div className="grid gap-3">
                <Label htmlFor="company">
                  {t("dashboardAdmin_users_company")}
                </Label>
                <Input id="company" name="company" onChange={handleChange} />
              </div>

              {/* TVA */}
              <div className="grid gap-3">
                <Label htmlFor="nTva">{t("checkout_tva")}</Label>
                <Input
                  id="nTva"
                  name="nTva"
                  onChange={handleChange}
                  type="text"
                />
                {formData.country && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span>{getVatFormatDescription(formData.country)}</span>
                  </p>
                )}
              </div>

              {/* platform */}
              <div className="grid gap-3">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  name="platform"
                  onValueChange={handleSelectChangePlatform}
                  value={formData.platform}
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
            </>
          )}

          {/* Email */}
          <div className="grid gap-3">
            <Label htmlFor="email">{t("dashboardAdmin_users_email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="grid gap-3">
            <Label htmlFor="password">
              {t("dashboardAdmin_users_password")}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {/* Phone */}
          <div className="grid gap-3">
            <Label htmlFor="phone">{t("dashboardAdmin_users_phone")}</Label>
            <Input id="phone" name="phone" type="tel" onChange={handleChange} />
          </div>

          {/* Address */}
          <div className="grid gap-3">
            <Label htmlFor="address">{t("dashboardAdmin_users_address")}</Label>
            <Input id="address" name="address" onChange={handleChange} />
          </div>

          {/* Postal Code */}
          <div className="grid gap-3">
            <Label htmlFor="postal">
              {t("dashboardAdmin_users_postalCode")}
            </Label>
            <Input id="postal" name="postal" onChange={handleChange} />
          </div>

          {/* City */}
          <div className="grid gap-3">
            <Label htmlFor="city">{t("dashboardAdmin_users_city")}</Label>
            <Input id="city" name="city" onChange={handleChange} />
          </div>

          {/* Country */}
          <div className="grid gap-3">
            <Label htmlFor="country">{t("dashboardAdmin_users_country")}</Label>
            <Select name="country" onValueChange={handleSelectChange}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue
                  placeholder={t("dashboardAdmin_users_selectCountry")}
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country, index) => (
                  <SelectItem key={index} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {t("dashboardAdmin_users_cancel")}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              {t("dashboardAdmin_users_save")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewUser;
