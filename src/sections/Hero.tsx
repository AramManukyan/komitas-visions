import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import heroBg from '@/assets/hero-bg.jpg';

const stats = [
  { key: 'apartments', value: 240 },
  { key: 'floors', value: 18 },
  { key: 'year', value: 2027 },
  { key: 'price', value: 28 },
];

const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={ref} className="text-gradient-gold font-heading text-5xl md:text-6xl font-bold tracking-tight">
      {end > 1000 ? count.toLocaleString() : count}
      {suffix}
    </div>
  );
};

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="New Komitas"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      {/* Layered overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-16 h-[2px] gradient-gold mx-auto mb-8"
        />

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className="font-heading text-gradient-gold text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-[0.9]"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-primary-foreground/80 font-body text-base md:text-lg max-w-lg mx-auto mb-10 font-light tracking-wide"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-20"
        >
          <a
            href="#gallery"
            className="inline-flex items-center justify-center gradient-gold text-accent-foreground font-body font-bold px-8 py-3.5 rounded-full hover:shadow-glow-gold transition-all duration-300 text-sm tracking-wide"
          >
            {t('hero.viewApartments')}
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center glass text-primary-foreground font-body font-semibold px-8 py-3.5 rounded-full hover:bg-accent/15 transition-all duration-300 text-sm tracking-wide"
          >
            {t('hero.contactUs')}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="glass rounded-2xl p-6 md:p-8 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={stat.key} className={`text-center ${i < 3 ? 'md:border-r md:border-primary-foreground/10' : ''}`}>
                <Counter end={stat.value} suffix={stat.key === 'price' ? 'M' : ''} />
                <p className="text-primary-foreground/60 font-body text-xs mt-2 uppercase tracking-widest font-semibold">
                  {t(`hero.stats.${stat.key}`)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-bg to-transparent" />
    </section>
  );
};

export default Hero;
