import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A simple side-effect component that updates the <html> tag's lang attribute
 * whenever the i18next language changes.
 */
export function LanguageLinker() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const lang = i18n.language || 'ja';
        document.documentElement.setAttribute('lang', lang);
    }, [i18n.language]);

    return null;
}
