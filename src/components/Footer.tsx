import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t } = useTranslation();
  const navKeys = ['about', 'gallery', 'amenities', 'location', 'banks', 'contact'];

  return (
    <footer className="gradient-navy text-primary-foreground relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo + tagline */}
          <div className="md:col-span-5">
            <img src={logo} alt="METTA GROUP" className="h-10 w-auto brightness-0 invert mb-5" />
            <p className="text-gradient-gold font-heading text-2xl italic mb-6 max-w-xs">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-primary-foreground/50 hover:text-accent hover:border-accent/30 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3">
            <p className="text-accent font-body text-xs uppercase tracking-widest font-bold mb-5">Navigation</p>
            <div className="flex flex-col gap-2.5">
              {navKeys.map((key) => (
                <a
                  key={key}
                  href={`#${key}`}
                  className="group flex items-center gap-1 text-primary-foreground/50 hover:text-accent font-body text-sm transition-colors duration-300"
                >
                  {t(`nav.${key}`)}
                  <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="md:col-span-4">
            <p className="text-accent font-body text-xs uppercase tracking-widest font-bold mb-5">Contact</p>
            <div className="flex flex-col gap-4">
              {[
                { icon: Phone, text: '+374 10 123 456' },
                { icon: Mail, text: 'info@mettagroup.am' },
                { icon: MapPin, text: t('footer.address') },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg glass flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent" />
                  </div>
                  <span className="text-primary-foreground/70">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/5 py-5">
        <p className="text-center text-primary-foreground/30 text-xs font-body tracking-wide">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
