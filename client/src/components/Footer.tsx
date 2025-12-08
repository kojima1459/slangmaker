import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* App Info */}
          <div>
            <h3 className="font-bold text-lg mb-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              {t('appTitle')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t('footer.home')}
                </a>
              </li>
              <li>
                <a href="/guide" className="text-gray-600 hover:text-purple-600 transition-colors">
                  {t('footer.guide')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.manus.im/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a
                  href="https://www.manus.im/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {t('footer.terms')}
                </a>
              </li>
            </ul>
          </div>

          {/* Creator & Donation */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.creatorInfo')}</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">
                {t('footer.creator')}: <a href="https://twitter.com/kojima920" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">@kojima920</a>
              </li>
              <li className="text-gray-600">
                {t('footer.contact')}: <a href="mailto:mk19830920@gmail.com" className="text-purple-600 hover:underline">mk19830920@gmail.com</a>
              </li>
              <li className="text-gray-600 mt-3">
                <div className="font-medium mb-1">{t('footer.donation')}</div>
                <div>PayPayID: <span className="font-mono text-purple-600">kojima1459</span></div>
                <div className="text-xs text-gray-500 mt-1">{t('footer.donationNote')}</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          © 2025 AI Slang Maker. {t('footer.madeWith')} <a href="https://www.manus.im" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Manus</a>
        </div>
      </div>
    </footer>
  );
}
