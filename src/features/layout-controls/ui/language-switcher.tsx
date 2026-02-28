import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const isUzbek = i18n.language === 'uz';

    return (
        <button
            onClick={() => i18n.changeLanguage(isUzbek ? 'en' : 'uz')}
            title={isUzbek ? t('language.en') : t('language.uz')}
            aria-label={t('language.switch')}
            className="inline-flex h-max cursor-pointer items-center justify-center rounded-md px-1.5 py-1 text-xs font-semibold text-fg-quaternary transition duration-100 hover:bg-primary_hover hover:text-fg-quaternary_hover"
        >
            {isUzbek ? 'EN' : 'UZ'}
        </button>
    );
}
