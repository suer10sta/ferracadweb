import { formatNumber } from '@/utils/formatNumber'
import { FaArrowUp } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Card = ({ analytic }: any) => {
  return (
    <Link 
        to={analytic.path}
        className={`flex flex-col justify-between ${analytic.isDark ? "bg-stone-900 text-white" : "bg-white"} rounded-2xl p-7 transition-all duration-200 hover:shadow-lg`}
    >
        <div className='flex items-center justify-between'>
            <h5 className='font-semibold text-xs'>{analytic.title}</h5>
            <analytic.icon size={20} />
        </div>
        <div className='mt-5'>
            <p className='font-medium text-4xl'>{analytic.isCurrency && "€ "}{formatNumber(analytic.value)}</p>
            <div className='flex items-center gap-1 text-[10px] mt-2'>
                {
                    analytic.parag ?
                        <p>{analytic.parag}</p>
                    : (
                        <>
                            {
                                analytic.isGrowth ? (
                                    <>
                                        <div className='text-green-700 flex items-center gap-1'>
                                            <FaArrowUp />
                                            <p>{analytic.valueGrowth} {analytic.isPercent && "%"}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='text-red-700 flex items-center gap-1'>
                                            <FaArrowUp />
                                            <p>{analytic.valueGrowth} {analytic.isPercent && "%"}</p>
                                        </div>
                                    </>
                                )
                            }
                            <p className={`${analytic.isDark ? "text-white/60" : "text-black/60"}`}>Par rapport au mois dernier</p>
                        </>
                    )
                }
            </div>
        </div>
    </Link>
  )
}

export default Card