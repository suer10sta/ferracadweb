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
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import countries from "@/data/countries.json";
import { useLanguage } from "@/lang/LanguageProvider";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { FaPlus } from "react-icons/fa";

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
