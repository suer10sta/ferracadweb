import React from "react";
import SettingsAdmin from "@/components/admin/Setting";
import SettingsClient from "@/components/client/Setting";
import { getUser } from "@/utils/auth";

const Settings: React.FC = () => {
  const userIdn = getUser()

  return (
    <>
      {
        userIdn.role === "admin"? (
          <SettingsAdmin />
        ) : (
          <SettingsClient />
        )
      }
    </>
  );
};

export default Settings;
