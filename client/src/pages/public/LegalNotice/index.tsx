import { useLanguage } from "@/lang/LanguageProvider";
import React from "react";

const LegalMentions: React.FC = () => {
  const { t } = useLanguage()
  return (
    <div
      className=""
      dangerouslySetInnerHTML={{
        __html: t("LegalMentions_page"),
      }}
    />
  );
};

export default LegalMentions;