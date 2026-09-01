import { formatNumber } from '@/utils/formatNumber'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

const Card = ({ analytic }: any) => {
  const isPositive = analytic.trend && !analytic.trend.includes('-');
  const isActive = analytic.isActive;
  
  return (
    <Link 
        to={analytic.path || "#"}
        onClick={(e) => {
          if (analytic.onClick) {
            e.preventDefault();
            analytic.onClick();
          }
        }}
        className={cn(
          "flex flex-col justify-between rounded-xl p-4 transition-all duration-300 hover:shadow-xl border group cursor-pointer text-white",
          isActive
            ? cn(
                analytic.activeBg || analytic.cardBg || "bg-[#111827]",
                analytic.activeBorder || "border-slate-500",
                "ring-2 shadow-lg",
                analytic.activeRing || "ring-white/20"
              )
            : cn(
                analytic.cardBg || "bg-[#111827]",
                analytic.cardBorder || "border-slate-800",
                "hover:border-slate-600 hover:shadow-md"
              )
        )}
    >
        <div className='flex items-center justify-between gap-2'>
            <div className="flex flex-col">
              <h5 className='font-bold text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors'>
                {analytic.title}
              </h5>
            </div>
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-lg',
              analytic.iconBg ? analytic.iconBg : "bg-slate-800"
            )}>
               <analytic.icon size={18} className={analytic.iconColor ? analytic.iconColor : "text-slate-300"} />
            </div>
        </div>

        <div className='mt-3'>
            <div className="flex items-baseline justify-between gap-1">
              <p className='font-bold text-2xl tracking-tight text-white'>
                {analytic.isCurrency && "€ "}
                {formatNumber(analytic.value)}
              </p>
              
              {analytic.trend && (
                <div className={cn(
                  "flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full border",
                  isPositive 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {isPositive ? <FaArrowUp size={7} /> : <FaArrowDown size={7} />}
                  <span>{analytic.trend}</span>
                </div>
              )}
            </div>

            <p className='text-[10px] mt-1 text-slate-300/60 line-clamp-1'>
              {analytic.parag}
            </p>
        </div>
    </Link>
  )
}

export default Card