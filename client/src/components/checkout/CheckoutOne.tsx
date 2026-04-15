import countries from "@/data/countries.json";
import { useLanguage } from "@/lang/LanguageProvider";
import apiClient from "@/services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'

const CheckoutOne = ({ Step, setStep, formData, setFormData }: any) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const platforms = [
    {
      label: "-",
      value: "",
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
    }
  ];

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (
      formData.name === "" ||
      formData.prenom === "" ||
      formData.email === "" ||
      formData.pwd === "" ||
      formData.reppwd === "" ||
      formData.pays === "" ||
      formData.number === "" ||
      formData.platform === ""
    ) {
      toast.warning(t("form_01_error_incomplete"))
      return;
    }

    if (!formData.saveAdresse) {
      toast.warning(t("form_02_error_accept"))
      return;
    }

    if (formData.pwd !== formData.reppwd) {
      toast.warning(t("form_02_error_password_mismatch"))
      return;
    }

    if (formData.pwd.length < 8) {
      toast.warning(t('form_02_error_atless_eight'))
      return;
    }

    try {
      setLoading(true)
      const res = await apiClient.post("/auth/inscription", formData);

      if (res.status === 201) {
        toast.success(t("register_show"));
        navigate('/activate-account', { state: { email: formData.email } });
      } else {
        toast.warning(res.data.message)
      }
    } catch (error: any) {
      toast.error(error.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        onClick={() => {
          if (Step > 0) {
            setStep(0);
          }
        }}
        className={`p-8 py-8 w-full rounded-lg text-stone-800 ${Step > 0
            ? "cursor-pointer transition-all duration-200 hover:shadow-md"
            : ""
          }`}
      >
        <h2 className="font-bold text-lg">{t("pay_01_title")}</h2>
        <p className="text-stone-500 text-sm">{t("pay_01_description")}</p>
        <form
          onSubmit={handleSubmit}
          className={`transition-all duration-200 ${Step === 0 ? "mt-6 h-full" : "h-0 overflow-hidden m-0"
            } flex flex-col gap-6 max-md:gap-10`}
        >
          <div className="flex items-start gap-4 justify-between w-full max-md:flex-col max-md:gap-10">
            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="name"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("contact_name")} <span className="">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Joe"
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                required
              />
            </div>
            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="prenom"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("pay_01_prenom")} <span className="">*</span>
              </label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Doe"
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                required
              />
            </div>
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="email"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("contact_email")} <span className="">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            />
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="pwd"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_01_pwd")} <span className="">*</span>
            </label>
            <input
              type="password"
              id="pwd"
              name="pwd"
              value={formData.pwd}
              onChange={handleChange}
              placeholder="**********"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            />
            <span className="font-semibold text-stone-600 text-xs mt-2">{t('form_02_error_eight_car')}</span>
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="reppwd"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_01_reppwd")} <span className="">*</span>
            </label>
            <input
              type="password"
              id="reppwd"
              name="reppwd"
              value={formData.reppwd}
              onChange={handleChange}
              placeholder="**********"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            />
            <span className="font-semibold text-stone-600 text-xs mt-2">{t('form_02_error_eight_car')}</span>
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="platform"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("dashboard_product_platform")}
            </label>
            <select
              id="platform"
              name="platform"
              onChange={(e) => handleChange(e)}
              value={formData.platform}
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            >
              {platforms.map((platform) => (
                <option value={platform.value}>{platform.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-4 justify-between w-full max-md:flex-col max-md:gap-10">
            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="pays"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("pay_01_country")} <span className="">*</span>
              </label>
              <select
                id="pays"
                name="pays"
                value={formData.pays}
                onChange={handleChange}
                className="appearance-none border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800 bg-white"
              >
                {countries.map((country, index) => (
                  <option value={country.code} key={index}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="companyname"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("pay_01_name_company")}
              </label>
              <input
                type="text"
                id="companyname"
                name="companyname"
                value={formData.companyname}
                onChange={handleChange}
                placeholder="Ferracad"
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-4 justify-between w-full max-md:flex-col max-md:gap-10">
            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="number"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("pay_01_phone")} <span className="">*</span>
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="+31 666666666"
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                required
              />
            </div>

            <div className="relative text-[#B2BCCA] w-full">
              <label
                htmlFor="codepostal"
                className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
              >
                {t("pay_01_postal")}
              </label>
              <input
                type="text"
                id="codepostal"
                name="codepostal"
                value={formData.codepostal}
                onChange={handleChange}
                placeholder="75000"
                className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              />
            </div>
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="ville"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_01_city")}
            </label>
            <input
              type="text"
              id="ville"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Paris"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            />
          </div>

          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="adresse"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_01_address")}
            </label>
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="123 Main Street, Apt 4B"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            />
          </div>

          <div className="flex items-start gap-2 mt-[-11px]">
            <input
              type="checkbox"
              name="saveAdresse"
              id="saveAdresse"
              checked={formData.saveAdresse}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-700"
              required
            />
            <p className="font-semibold text-stone-500 text-xs" dangerouslySetInnerHTML={{ __html: t("pay_01_save_address") }} />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-secondary p-2 px-12 font-semibold text-white text-xs rounded-lg transition-all duration-200 hover:bg-stone-700"
            >
              {loading ? t('form_02_error_send') : t("pay_01_save")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CheckoutOne;
