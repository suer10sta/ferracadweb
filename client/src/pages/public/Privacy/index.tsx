import { useLanguage } from "@/lang/LanguageProvider";
import React from "react";

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div
      className=""
      dangerouslySetInnerHTML={{
        __html: t("policy_page"),
      }}
    />
  );
};

export default PrivacyPolicy;