import { useLanguage } from '@/lang/LanguageProvider';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';


const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShowBanner(false);
  };

  const handleIgnore = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-gray-300 shadow-lg rounded-lg p-5 text-gray-800 text-sm space-y-3">
      <div>
        <p className="mb-2">
          {t('cookie_title')}
        </p>
        <p className="text-xs text-gray-500">
          {t('read_our')}{' '}
          <Link
            to="/privacy"
            className="underline hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('policy')}
          </Link>{' '}
          {t('and')}{' '}
          <Link
            to="/legal-notice"
            className="underline hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('rules')}
          </Link>
          .
        </p>
      </div>

      <div className="flex justify-between space-x-2 pt-2">
        <div className='flex items-center gap-4'>
            <button
              onClick={handleDecline}
              className="text-sm rounded underline text-gray-600 hover:bg-gray-100"
            >
              {t('cookie_decline')}
            </button>
            <button
              onClick={handleIgnore}
              className="text-sm rounded underline text-gray-600 hover:bg-gray-100"
            >
              {t('cookie_ignore')}
            </button>
        </div>
        <button
          onClick={handleAccept}
          className="text-sm px-5 py-1.5 rounded-2xl bg-primary text-white hover:bg-red-800"
        >
          {t('cookie_accept')}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;