import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const langs = [
    { code: 'hy', label: 'ՀԱՅ' },
    { code: 'ru', label: 'РУС' },
    { code: 'en', label: 'ENG' },
  ];

  return (
    <div className="flex rounded-full glass p-1 gap-0.5">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold font-body uppercase tracking-wider transition-all duration-300 ${
            i18n.language === lang.code
              ? 'gradient-gold text-accent-foreground shadow-sm'
              : 'text-primary-foreground/70 hover:text-primary-foreground'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
