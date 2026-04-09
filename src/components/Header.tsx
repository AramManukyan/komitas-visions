import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';
import LanguageSwitcher from './LanguageSwitcher';

const navKeys = ['about', 'gallery', 'amenities', 'location', 'banks', 'contact'] as const;

const Header = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-dark shadow-elevated py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <a href="#" className="flex-shrink-0 group flex items-center gap-3">
          <img
            src={logo}
            alt="New Komitas"
            className="h-14 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-accent text-sm font-bold tracking-widest uppercase">
              New Komitas
            </span>
            <span className="font-body text-primary-foreground/50 text-[10px] tracking-[0.2em] uppercase">
              Yerevan
            </span>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {navKeys.map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="relative px-4 py-2 text-primary-foreground/75 hover:text-accent font-body text-[13px] font-semibold uppercase tracking-wider transition-colors duration-300"
            >
              {t(`nav.${key}`)}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center">
          <LanguageSwitcher />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-primary-foreground p-2 rounded-lg hover:bg-accent/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden glass-dark"
          >
            <nav className="flex flex-col items-center gap-1 py-6">
              {navKeys.map((key, i) => (
                <motion.a
                  key={key}
                  href={`#${key}`}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-primary-foreground/80 hover:text-accent font-body text-sm font-semibold uppercase tracking-wider py-2 transition-colors"
                >
                  {t(`nav.${key}`)}
                </motion.a>
              ))}
              <div className="mt-3">
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
