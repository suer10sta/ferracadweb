import { CreditCard, Lock } from "lucide-react";
import { useLanguage } from "@/lang/LanguageProvider";
import paypalIcon from "@/assets/icon/paypal.png"

const CheckoutThree = ({ Step, formData, setFormData }: any) => {
  const { t } = useLanguage();
  return (
    <div className="border p-8 py-8 w-full rounded-lg shadow-sm text-stone-800">
      <h2 className="font-bold text-lg">2. {t("pay_04_title")}</h2>
      <p className="text-stone-500 text-sm">{t("pay_04_description")}</p>
      <form
        className={`transition-all duration-200 ${
          Step === 2 ? "mt-6 h-full" : "h-0 overflow-hidden m-0"
        } flex flex-col gap-6`}
      >
        <div>
          <div
            onClick={() => {
              setFormData((prev: any) => ({
                ...prev,
                payment: "cart",
              }));
            }}
            className="cursor-pointer flex justify-between items-center border-b border-stone-300 pb-5"
          >
            {" "}
            <div className="flex items-center gap-2">
              <CreditCard size={19} />
              <p className="font-semibold text-stone-800 text-sm">
                {t("pay_04_cart")}
              </p>
            </div>
            <div
              className={`transition-all duration-200 ${
                formData.payment === "cart"
                  ? "border-8 border-stone-800"
                  : "border-2 border-gray-500"
              } w-6 h-6 rounded-full`}
            ></div>
          </div>
          <div
            onClick={() => {
              setFormData((prev: any) => ({
                ...prev,
                payment: "paypal",
              }));
            }}
            className="cursor-pointer pt-5 flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <img
                src={paypalIcon}
                alt="paypal"
                className="w-5"
              />
              <p className="font-semibold text-stone-800 text-sm">PayPal</p>
            </div>
            <div
              className={`transition-all duration-200 ${
                formData.payment === "paypal"
                  ? "border-8 border-stone-800"
                  : "border-2 border-gray-500"
              } w-6 h-6 rounded-full`}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <Lock size={16} color="#1e2939" />
            <p className="text-center font-medium text-xs text-gray-800">
              {t("checkout_security_pau")}
            </p>
          </div>
          <p className="text-xs text-stone-600 mt-2">{t("pay_04_note")}</p>
        </div>
      </form>
    </div>
  );
};

export default CheckoutThree;
