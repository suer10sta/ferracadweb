
import { Link, useLocation } from 'react-router-dom';
import { IoAppsOutline, IoSettings } from 'react-icons/io5';
import { BsCurrencyDollar } from 'react-icons/bs';
import { useLanguage } from '@/lang/LanguageProvider';
import { cn } from '@/lib/utils';

const HorizontalNav = ({ className }: { className?: string }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const subpath = location.pathname;

  const menuItems = [
    {
      icon: IoAppsOutline,
      title: "Gestion des licences",
      path: "/tableau-de-board",
    },
    {
      icon: BsCurrencyDollar,
      title: t("sidebarPayments"),
      path: "/tableau-de-board/paiements",
    },
    {
      icon: IoSettings,
      title: t("sidebarSettings"),
      path: "/tableau-de-board/parametres",
    },
  ];

  return (
    <div className={cn("flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-100 shadow-sm w-fit", className)}>
      {menuItems.map((item) => {
        const isActive = item.path === subpath;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              isActive 
                ? "bg-stone-800 text-white shadow-md" 
                : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
            )}
          >
            <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-stone-400")} />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
};

export default HorizontalNav;
