import { Link } from 'react-router-dom'

const HeroSection = ({ title, description, button = {} }: any) => {
  return (
    <section className='w-10/12 min-2xl:w-8/12 container mx-auto bg-secondary py-12 rounded-xl flex flex-col justify-center items-center gap-2'>
        <h1 className='font-bold text-2xl text-white text-center'>{title}</h1>
        <p className='font-semibold text-sm w-1/2 max-sm:w-10/12 mx-auto text-white text-center'>{description}</p>
        {
            button?.context && (
              <Link to={button.url} className='mt-4 cursor-pointer'>
                <button className='bg-white cursor-pointer p-2 px-8 rounded-lg font-semibold text-xs text-stone-900'>{button.context}</button>
              </Link>
            )
        }
    </section>
  )
}

export default HeroSection