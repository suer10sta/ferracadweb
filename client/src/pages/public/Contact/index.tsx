import { ContactForm, FaqDetailed } from '@/components';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Contact = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);
  
  return (
    <>
        <div className='grid grid-cols-2 max-md:grid-cols-1 items-center mb-12'>
            <img 
              src="https://images.unsplash.com/photo-1563192504-36ac622196dd?q=80&w=687&auto=format&fit=crop"
              alt='Contact'
              className='h-[835px] w-full object-cover rounded-r-2xl max-md:hidden'
            />
            <ContactForm />
        </div>
        <div id="faq">
          <FaqDetailed />
        </div>
    </>
  )
}

export default Contact