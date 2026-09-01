const fs = require("fs");

const usersPath = "client/src/pages/dashboard/users/index.tsx";
let users = fs.readFileSync(usersPath, "utf8");
users = users.replace("QuickAnalytic.slice(4, 8)", "QuickAnalytic.slice(4)");
users = users.replace(
  '<div className="grid grid-cols-2 md:grid-cols-4 gap-2">\n            {QuickAnalytic.slice(4)',
  '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">\n            {QuickAnalytic.slice(4)'
);
fs.writeFileSync(usersPath, users);

const rentPath = "client/src/components/admin/Rent.tsx";
let rent = fs.readFileSync(rentPath, "utf8");

if (!rent.includes("provisionalLicenses")) {
  rent = rent.replace(
    `  const activeLicenses = enrichedLicenses.filter(
    (l) => l.status === "active"
  ).length;
  // const expiringLicenses = enrichedLicenses.filter(
  //   (l) => l.status === "expiring"
  // ).length;
  const expiredLicenses = enrichedLicenses.filter(
    (l) => l.status === "expired"
  ).length;`,
    `  const activeLicenses = enrichedLicenses.filter(
    (l) => l.status === "active"
  ).length;
  const provisionalLicenses = enrichedLicenses.filter(
    (l) => l.status === "provisional"
  ).length;
  const expiredLicenses = enrichedLicenses.filter(
    (l) => l.status === "expired"
  ).length;`
  );

  rent = rent.replace(
    `        path: "/tableau-de-board/locations?filter=active",
      },
      // {
      //   title: t("dashboard_rent_expiringSoon"),
      //   icon: MdLoop,
      //   value: expiringLicenses,
      //   isGrowth: true,
      //   isCurrency: false,
      //   valueGrowth: 2,
      //   isDark: false,
      //   isPercent: false,
      //   parag: t("dashboard_rent_expiringSoonDescription"),
      //   path: "/tableau-de-board/locations?filter=expiring",
      // },
      {
        title: t("dashboard_rent_expired"),`,
    `        path: "/tableau-de-board/locations?filter=active",
      },
      {
        title: t("dashboard_rent_provisional"),
        icon: FaRegClock,
        value: provisionalLicenses,
        isGrowth: true,
        isCurrency: false,
        valueGrowth: 2,
        isDark: false,
        isPercent: false,
        parag: t("dashboard_rent_provisionalDescription"),
        path: "/tableau-de-board/locations?filter=provisional",
      },
      {
        title: t("dashboard_rent_expired"),`
  );

  rent = rent.replace(
    '<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">',
    '<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">'
  );

  fs.writeFileSync(rentPath, rent);
}

console.log("done");
