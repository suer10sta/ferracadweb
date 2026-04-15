import { useLanguage } from '@/lang/LanguageProvider'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { IoIosMail } from 'react-icons/io'
import { IoPersonAdd } from 'react-icons/io5'
import { LuBraces } from 'react-icons/lu'
import { Link } from 'react-router-dom'

const Shortcuts = () => {
    const { t } = useLanguage();
    const shortcutsValues = [
        {
            icon: IoPersonAdd,
            title: t("dashboardClient_createNewSubscription"),
            path: "/tableau-de-board/utilisateurs"
        },
        {
            icon: LuBraces,
            title: t("dashboardClient_addNewVersion"),
            path: "/tableau-de-board/produits"
        },
        {
            icon: IoIosMail,
            title: t("dashboardClient_createNewCampaign"),
            path: "/tableau-de-board/marketing"
        },
        {
            icon: AiOutlineQuestionCircle,
            title: t("dashboardClient_createNewFAQ"),
            path: "/tableau-de-board/faq"
        },
    ];

  return (
    <div 
        className='bg-white max-md:hidden rounded-2xl p-5 py-8 grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 justify-start items-start'
    >
        {
            shortcutsValues.map((short, index)=> (
                <Link 
                    to={short.path} 
                    key={index} 
                >
                    <div className='text-center gap-2 flex flex-col items-center justify-start text-black/50  transition-all duration-200 hover:text-black/70 w-7/12 mx-auto'>
                        <short.icon size={24} />
                        <p className='font-bold text-xs'>{short.title}</p>
                    </div>
                </Link>
            ))
        }
    </div>
  )
}

export default Shortcuts