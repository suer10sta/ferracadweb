import { FaAngleDown } from "react-icons/fa";
import { FiSidebar } from "react-icons/fi";
import { IoNotifications } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { enrichedUser } from "@/data/dataUser";
import { NotificationsData } from "@/data/mockData";
import { useEffect, useState } from "react";
import apiClient from "@/services/api";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLanguage } from "@/lang/LanguageProvider";
import { BsGlobeEuropeAfrica } from "react-icons/bs";
import { getUser } from "@/utils/auth";
import LogoFerracad from "@/assets/ferracad-logo.png";

const formatRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
};

const Header = ({ setActiveSidebar, activeSidebar }: any) => {
  const { t, setLang } : any = useLanguage();
  const user: any = enrichedUser();
  const [Notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getData = async () => {
      try {
        const getNotifications = await NotificationsData();
        setNotifications(getNotifications);
      } catch (error) {
        // console.error("Failed to fetch rentals:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [loading]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    // petit délai pour simuler un chargement
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setIsLoadingMore(false);
    }, 800);
  };

  const visibleNotifications = Notifications.slice(0, visibleCount);

  const navigate = useNavigate();
  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      const today = new Date()
      localStorage.setItem("lastdeco", today.toISOString().split("T")[0])
      navigate("/connexion");
    } catch (error) {
      // console.error("Logout failed:", error);
    }
  };

  const handleRead = async (id: string) => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/notifications/${id}`);
      if (res.status !== 200) {
        toast.warning(
          t("headerNotificationError")
        );
      }
    } catch (error) {
      toast.warning(
        t("headerNotificationError")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAllRead = async () => {
    try {
      setLoading(true);
      const res = await apiClient.put(`/notifications`);
      if (res.status !== 200) {
        toast.warning(
          t("headerNotificationError")
        );
      }
    } catch (error) {
      toast.warning(
        t("headerNotificationError")
      );
    } finally {
      setLoading(false);
    }
  };
  const [languePopup, setLanguePopup] = useState(false)

  const langues = [
    {
      label: "Français",
      value: "fr"
    },
    {
      label: "English",
      value: "en"
    },
    {
      label: "Nederlands",
      value: "fl"
    }
  ]

  const userIdn = getUser();
  const isAdmin = userIdn?.role === "admin";

  return (
    <div className="flex justify-between items-center sticky top-0 z-50 bg-[#F9F9F9] py-5">
      {isAdmin ? (
        <button
          onClick={() => setActiveSidebar(!activeSidebar)}
          className="text-black/60 transition-all duration-200 hover:text-black/80 cursor-pointer"
        >
          <FiSidebar />
        </button>
      ) : (
        <Link to="/tableau-de-board">
          <img
            src={LogoFerracad}
            alt="Ferracad"
            className="w-24 max-lg:w-18 my-auto"
          />
        </Link>
      )}
      <div className="flex justify-between items-center gap-5">
        <div className="relative">
          <button onClick={()=> setLanguePopup(!languePopup)} className="cursor-pointer text-black/60 flex items-center gap-2">
            <BsGlobeEuropeAfrica />
            <p className="font-bold text-sm max-lg:text-xs">{t("Langue")}</p>
          </button>
          {
            languePopup && (
              <div className="absolute flex flex-col top-9 z-50 bg-white border border-stone-200 p-2 rounded-xl">
                {
                  langues.map((langue, index)=> (
                    <button
                      key={index}
                      className="p-2 pl-3 pr-10 text-left cursor-pointer text-sm max-lg:text-xs font-bold transition-all duration-200 hover:bg-stone-100 rounded-2xl"
                      onClick={()=> {
                        setLanguePopup(!languePopup)
                        setLang(langue.value)
                      }}
                    >
                      {langue.label}
                    </button>
                  ))
                }
              </div>
            )
          }
        </div>
        {/*<button className="text-black/60 transition-all duration-200 hover:text-black/80 cursor-pointer">
          <IoSearch />
        </button>*/}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative m-0 p-0">
              <IoNotifications className="h-5 w-5 text-black/60 hover:text-black/80 transition-all" />
              {Notifications.some((n: any) => !n.readAt) && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-0">
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center">
              <p className="font-semibold text-sm">Notifications</p>
              {Notifications.some((n: any) => !n.readAt) && (
                <button
                  className="text-xs underline font-bold cursor-pointer text-stone-800 hover:text-stone-900"
                  onClick={handleAllRead}
                >
                  {t("headerMarkAllAsRead")}
                </button>
              )}
            </div>

            {/* LISTE */}
            <div className="max-h-60 overflow-y-auto">
              {Notifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {t("headerNoNotification")}
                </div>
              ) : (
                <>
                  {visibleNotifications.map((notification: any) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b text-sm hover:bg-muted/50 transition-all cursor-pointer ${
                        !notification.readAt ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        if (!notification.readAt) {
                          handleRead(notification._id);
                        }
                      }}
                    >
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  ))}

                  {/* LOADING */}
                  {isLoadingMore && (
                    <div className="p-4 space-y-2 animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}

                  {/* BOUTON CHARGER PLUS */}
                  {visibleCount < Notifications.length && !isLoadingMore && (
                    <div className="p-2 text-center">
                      <button
                        onClick={handleLoadMore}
                        className="text-xs text-primary font-semibold hover:underline"
                      >
                        {t("headerLoadMore")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <span className="select-none text-black/60">|</span>
        <div className="flex justify-between items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <img
                  crossOrigin="anonymous"
                  src={user.photoProfile? `${import.meta.env.VITE_API_BASED_URL}/uploads/profile/${user.photoProfile}` : "/profile.png"}
                  alt="user"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <button className="absolute bottom-[-9px] right-[-8px] cursor-pointer border-2 border-[#F9F9F9] bg-white rounded-full p-1">
                  <FaAngleDown size={10} />
                </button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>
                <p>{t("headerMyAccount")}</p>
                <p className="text-xs text-black/60">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link to="/tableau-de-board/parametres">{t("sidebarSettings")}</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="bg-red-100 px-3 text-red-800"
              >
                {t('sidebarLogout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <h4 className="font-bold text-xs max-md:hidden">{user?.name}</h4>
        </div>
      </div>
    </div>
  );
};

export default Header;
