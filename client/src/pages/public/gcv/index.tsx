import { useLanguage } from "@/lang/LanguageProvider";

export default function CGV() {
    const { t } = useLanguage()
  return (
    <section
      className="max-w-4xl mx-auto px-4 pb-1 text-stone-800"
      dangerouslySetInnerHTML={{
        __html: t("cgv_page"),
      }}
    />
  );
}