import LogoFerracad from "@/assets/ferracad-logo.png"

const Maintenance = () => {
  return (
    <div className='flex flex-col h-screen justify-center items-center gap-3'>
        <img 
            src={LogoFerracad}
            alt='ferracad'
            className='w-36'
        />
        <h4 className='text-3xl text-center font-medium'>Nous reviendrons.</h4>
        <div>
            <p className='text-center text-black/70'>Nous sommes en train de mettre à jour le site web de Ferracad pour vous.</p>
            <p className='text-center text-black/70'>N'hésitez pas à revenir bientôt.</p>
        </div>
        <div className='flex items-center gap-2'>
            <a href="tel:+31658694532" className='font-medium text-sm'>+31 658694532</a>
            <span className='select-none'>|</span>
            <a href="mailto:support@ferracad.com" className='font-medium text-sm'>support@ferracad.com</a>
        </div>
    </div>
  )
}

export default Maintenance