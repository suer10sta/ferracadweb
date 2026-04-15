import { Lock } from 'lucide-react'
import countries from "@/data/countries.json"
import { useLanguage } from "@/lang/LanguageProvider";

export default function BillingSummary({ Step, formData }: any) {
  const { t } = useLanguage();
  
  const pricePerDay = 5;
  const licenceNumber = formData.licence;
  const numberDays = formData.numberDays;
  const discountType = "percent"
  const discount = formData.licence > 4 ? 0.1: 0;

  const totalPriceHT = licenceNumber * pricePerDay * numberDays
  const discountValue = discount
  const tva = (Number(countries.find((e)=> e.code === formData.pays)?.standard_rate)/100)
  
  let totalPayer = ((totalPriceHT - (totalPriceHT * discountValue)) * (1 + tva)).toFixed(2);
  return (
    <div className="mx-auto p-6 border rounded-lg shadow-sm font-sans text-gray-800">
      <h2 className="text-lg font-bold mb-6">
        {t("checkout_title")}
      </h2>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{t("checkout_price_j")} ({licenceNumber} {t("checkout_licence")})</span>
        <span className="font-bold text-sm">{(licenceNumber * pricePerDay).toFixed(2)} €</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{t("pay_03_num_j")}</span>
        <span className="font-bold text-sm">{numberDays} {t("pay_03_j")}</span>
      </div>
      <div className="flex justify-between mb-2 pt-4 border-t border-gray-300">
        <span className="text-sm font-medium">{t("checkout_sous_total")}</span>
        <span className="font-bold text-sm">{(totalPriceHT).toFixed(2)} €</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{t("checkout_discount")}</span>
        <span className="font-bold text-sm text-red-600">-{(discountValue * 100).toFixed(2)} {discountType === "percent" ? "%" : "€"}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{t("checkout_tva")} ({(tva * 100).toFixed(2)} %)</span>
        <span className="font-bold text-sm">{(totalPriceHT * tva).toFixed(2)} €</span>
      </div>
      <div className="flex justify-between font-bold text-sm pt-4 border-t border-gray-300 mb-6">
        <span>{t("checkout_total")}</span>
        <span>{totalPayer} € TTC</span>
      </div>

      <div className="relative text-[#B2BCCA] w-full mb-5">
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
          placeholder="Tapez ici..."
          className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
          required
        />
        <div className="absolute right-2 top-0 h-full flex items-center">
          <button className="bg-secondary text-xs p-2 px-5 font-bold text-stone-100 rounded-lg transition-all duration-200 hover:bg-stone-700 cursor-pointer">
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
          placeholder="Tapez ici..."
          className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
          rows={3}
        ></textarea>
      </div>

      <label className="flex items-start text-xs text-gray-600 mb-6">
        <input type="checkbox" className="mr-2" />
        <p className="font-medium text-stone-500" dangerouslySetInnerHTML={{ __html: t("checkout_checkbox_description") }} />
      </label>

      <button
        className={`w-full ${Step === 2 ? "bg-blue-900 cursor-pointer transition-all duration-200 hover:bg-blue-800": "bg-stone-400 cursor-not-allowed"} text-white py-2 rounded-md font-bold text-sm`}
        disabled={Step === 2 ? false : true}
      >
        {t("checkout_paiment")} {totalPayer} €
      </button>

      <div className="flex items-center justify-center mt-4 gap-1">
        <Lock size={16} color="#99a1af" />
        <p className="text-center font-medium text-xs text-gray-400">
          {t("checkout_security_pau")}
        </p>
      </div>
    </div>
  );
}
