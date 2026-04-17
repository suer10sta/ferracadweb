import { getUser } from '@/utils/auth'
import axios from 'axios'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BsCurrencyDollar } from 'react-icons/bs'
import { FaUsers, FaSlackHash } from 'react-icons/fa'
import { FiTarget } from 'react-icons/fi'
import { IoIosMail, IoMdLogOut } from 'react-icons/io'
import { IoAppsOutline, IoSettings } from 'react-icons/io5'
import { LuBraces } from 'react-icons/lu'
import { TbLicense } from 'react-icons/tb'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoFerracad from "@/assets/ferracad-logo.png"
import { FiSidebar } from "react-icons/fi";
import { useLanguage } from '@/lang/LanguageProvider'

const SideBar = ({ setActiveSidebar, activeSidebar }: any) => {
  const { t } = useLanguage()
  const userIdn = getUser();

  const menuDashboard = [
    {
      icon: IoAppsOutline,
      title: t("sidebarDashboard"),
      path: "/tableau-de-board",
      role: "client"
    },
    {
      icon: FaUsers,
      title: t("sidebarUsers"),
      path: "/tableau-de-board/utilisateurs",
      role: "admin"
    },
    {
      icon: TbLicense,
      title: t("sidebarOrders"),
      path: "/tableau-de-board/commande",
      role: "client"
    },
    {
      icon: FiTarget,
      title: t("sidebarLocations"),
      path: "/tableau-de-board/locations",
      role: "client"
    },
    {
      icon: BsCurrencyDollar,
      title: t("sidebarPayments"),
      path: "/tableau-de-board/paiements",
      role: "client"
    },
    {
      icon: LuBraces,
      title: t("sidebarProducts"),
      path: "/tableau-de-board/produits",
      role: "client"
    },
    {
      icon: AiOutlineQuestionCircle,
      title: t("sidebarFaq"),
      path: "/tableau-de-board/faq",
      role: "admin"
    },
    {
      icon: IoIosMail,
      title: t("sidebarMarketing"),
      path: "/tableau-de-board/marketing",
      role: "admin"
    },
    {
      icon: FaSlackHash,
      title: t("sidebarLogs"),
      path: "/tableau-de-board/logs",
      role: "admin"
    },
    {
      icon: IoSettings,
      title: t("sidebarSettings"),
      path: "/tableau-de-board/parametres",
      role: "client"
    },
  ];

  const location = useLocation();
  const subpath = location.pathname;

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, {
        withCredentials: true
      });

      navigate('/connexion');
    } catch (error) {
      // console.error('Logout failed:', error);
    }
  };
  return (
    <div className='sticky top-0'>
      <div className='flex flex-col justify-between gap-12 h-screen p-5 overflow-y-auto'>
        <div className='flex flex-col gap-10'>
          <div className='flex items-center justify-between'>
            <Link to="/">
              <img
                src={LogoFerracad}
                alt="Ferracad"
                className="w-26 max-lg:w-18 my-auto"
              />
            </Link>
            <button
              onClick={() => setActiveSidebar(!activeSidebar)}
              className="max-lg:block hidden text-black/60 transition-all duration-200 hover:text-black/80 cursor-pointer"
            >
              <FiSidebar />
            </button>
          </div>
          <nav>
            <ul className='flex flex-col gap-2'>
              {
                menuDashboard.map((m, i) => {
                  const isAdmin = userIdn.role === "admin" && m.role !== "justclient";
                  const isAllowed = userIdn.role === m.role || m.role === "justclient";

                  if (isAdmin || isAllowed) {
                    return (
                      <li key={m.path || i} className='flex justify-between items-center'>
                        <Link
                          to={m.path}
                          className={`flex items-center gap-2 py-2 text-sm font-semibold relative ${m.path === subpath ? "text-black/80" : "text-black/30"
                            } transition-all duration-200 hover:text-black/50`}
                        >
                          <m.icon />
                          {m.title}
                        </Link>
                      </li>
                    );
                  }

                  return null;
                })
              }
            </ul>
          </nav>
        </div>
        <button
          onClick={logout}
          className={`flex cursor-pointer items-center gap-2 py-2 text-sm font-semibold text-red-800 transition-all duration-200 hover:text-red-800/50`}
        >
          <IoMdLogOut />
          {t('sidebarLogout')}
        </button>
      </div>
    </div>
  )
}

export default SideBar