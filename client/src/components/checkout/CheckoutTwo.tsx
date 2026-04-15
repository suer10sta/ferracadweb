import { useLanguage } from "@/lang/LanguageProvider";

const CheckoutTwo = ({ Step, setStep, formData, setFormData }: any) => {
  const { t } = useLanguage();

  const handleChange = (e: {
    target: { name: any; value: any; type: any; checked: any };
  }) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setStep(Step + 1);
  };

  const endSubscription =
    formData.startDate && formData.numberDays
      ? new Date(
          new Date(formData.startDate).getTime() +
            parseInt(formData.numberDays) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0]
      : "";

  return (
    <div
      onClick={() => {
        if (Step > 1) {
          setStep(1);
        }
      }}
      className={`border p-8 py-8 w-full rounded-lg shadow-sm text-stone-800 ${
        Step > 1
          ? "cursor-pointer transition-all duration-200 hover:shadow-md"
          : ""
      }`}
    >
      <h2 className="font-bold text-lg">2. {t("pay_02_title")}</h2>
      <p className="text-stone-500 text-sm">{t("pay_02_description")}</p>
      <form
        onSubmit={handleSubmit}
        className={`transition-all duration-200 ${
          Step === 1 ? "mt-6 h-full" : "h-0 overflow-hidden m-0"
        } flex flex-col gap-6`}
      >
        <div className="flex items-start gap-4 justify-between w-full">
          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="licence"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_02_num_ferracad")} *
            </label>
            <input
              type="text"
              id="licence"
              name="licence"
              value={formData.licence}
              onChange={(e) => {
                const newLicenceCount = parseInt(e.target.value, 10) || 0;
                            
                // Ensure minimum of 1
                const adjustedLicenceCount = Math.max(newLicenceCount, 1);
                            
                const currentInfo = [...formData.informationComputer];
                const currentCount = currentInfo.length;
                            
                let updatedInfo = [...currentInfo];
                            
                if (adjustedLicenceCount > currentCount) {
                  // Add new empty objects
                  const toAdd = Array.from({ length: adjustedLicenceCount - currentCount }, () => ({
                    codeIdn: "",
                    nomComputer: ""
                  }));
                  updatedInfo = [...currentInfo, ...toAdd];
                } else if (adjustedLicenceCount < currentCount) {
                  // Remove extra items
                  updatedInfo = currentInfo.slice(0, adjustedLicenceCount);
                }
              
                setFormData({
                  ...formData,
                  licence: adjustedLicenceCount,
                  informationComputer: updatedInfo,
                });
              }}
              placeholder="1"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            />
            <p className="text-xs mt-1">
              {t("pay_02_num_ferracad_description")}
            </p>
          </div>
          <div className="relative text-[#B2BCCA] w-full">
            <label
              htmlFor="numberDays"
              className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
            >
              {t("pay_02_num_j")} *
            </label>
            <input
              type="text"
              id="numberDays"
              name="numberDays"
              value={formData.numberDays}
              onChange={handleChange}
              placeholder="30"
              className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
              required
            />
            <p className="text-xs mt-1">
              {t("pay_02_num_j_description")}
            </p>
          </div>
        </div>

        <div className="">
          {Array.from({ length: formData.licence }, (_, index) => (
            <div key={index} className="mb-5">
              <h4 className="font-bold text-sm mb-5">
                {t("pay_02_licence")}{index + 1} *
              </h4>
              <div className="flex items-start gap-4 justify-between w-full">
                <div className="relative text-[#B2BCCA] w-full">
                  <label
                    htmlFor={`codeIdn-${index}`}
                    className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
                  >
                    {t("pay_02_code_id")} *
                  </label>
                  <input
                    type="text"
                    id={`codeIdn-${index}`}
                    name="codeIdn"
                    placeholder="---------------"
                    className="border border-[#B2BCCA] placeholder:text-stone-200 w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                    required
                    value={formData.informationComputer[index]?.codeIdn || ""}
                    onChange={(e) => {
                      const updatedInfo = [...formData.informationComputer];
                      updatedInfo[index] = {
                        ...updatedInfo[index],
                        codeIdn: e.target.value,
                      };
                      setFormData({
                        ...formData,
                        informationComputer: updatedInfo,
                      });
                    }}
                  />
                </div>

                <div className="relative text-[#B2BCCA] w-full">
                  <label
                    htmlFor={`nomComputer-${index}`}
                    className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
                  >
                    {t("pay_02_name_pc")} *
                  </label>
                  <input
                    type="text"
                    id={`nomComputer-${index}`}
                    name="nomComputer"
                    placeholder="---------------"
                    className="border border-[#B2BCCA] placeholder:text-stone-200 w-full p-3 px-6 rounded-lg text-sm text-stone-800"
                    required
                    value={
                      formData.informationComputer[index]?.nomComputer || ""
                    }
                    onChange={(e) => {
                      const updatedInfo = [...formData.informationComputer];
                      updatedInfo[index] = {
                        ...updatedInfo[index],
                        nomComputer: e.target.value,
                      };
                      setFormData({
                        ...formData,
                        informationComputer: updatedInfo,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative text-[#B2BCCA] w-full">
          <label
            htmlFor="startDate"
            className="absolute top-[-11px] left-2 px-4 bg-white font-medium text-sm"
          >
            {t("pay_02_date_start")} *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className="border border-[#B2BCCA] w-full p-3 px-6 rounded-lg text-sm text-stone-800"
            required
          />
          <p className="text-xs mt-1">
            {t("pay_02_date_fin")} :{" "}
            <span className="font-bold text-stone-600">{endSubscription}</span>
          </p>
        </div>

        <div className="flex items-start gap-2 mt-[-11px]">
          <input
            type="checkbox"
            name="paymentAuto"
            id="paymentAuto"
            checked={formData.paymentAuto}
            onChange={handleChange}
            className="w-4 h-4 accent-gray-700"
          />
          <p className="font-semibold text-stone-500 text-xs">
            {t("pay_02_auto_ren")}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-secondary p-2 px-12 font-semibold text-white text-xs rounded-lg transition-all duration-200 hover:bg-stone-700"
          >
            {t("pay_01_save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutTwo;
