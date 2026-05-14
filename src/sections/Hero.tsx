import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { scrollToSection } from '@/lib/utils';
import { usePromotions, resolveValue } from '@/hooks/usePromotions';
import type { Promotion } from '@/types/promotion';

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

/* ---------- Main hero slide (preserves original design) ---------- */
const HeroMain = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="New Komitas"
        className="absolute inset-0 w-full h-full object-cover scale-105"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-primary/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
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
          <button
            onClick={() => scrollToSection('gallery')}
            className="inline-flex items-center justify-center gradient-gold text-accent-foreground font-body font-bold px-8 py-3.5 rounded-full hover:shadow-glow-gold transition-all duration-300 text-sm tracking-wide"
          >
            {t('hero.viewApartments')}
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="inline-flex items-center justify-center glass text-primary-foreground font-body font-semibold px-8 py-3.5 rounded-full hover:bg-accent/15 transition-all duration-300 text-sm tracking-wide"
          >
            {t('hero.contactUs')}
          </button>
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

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-bg to-transparent" />
    </div>
  );
};

/* ---------- Promotion slide (matches hero styling) ---------- */
const PromoSlide = ({ promo }: { promo: Promotion }) => {
  const { t } = useTranslation();
  const title = resolveValue(`${promo.i18nKey}.title`, t, '');
  const subtitle = resolveValue(`${promo.i18nKey}.subtitle`, t, '');
  const desc = resolveValue(`${promo.i18nKey}.description`, t, '');
  const badge = resolveValue(`${promo.i18nKey}.badge`, t, '');
  const cta = resolveValue(`${promo.i18nKey}.cta`, t, '');

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {promo.image && (
        <img
          src={promo.image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover scale-105"
          width={1920}
          height={1080}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/55 to-primary/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center pt-20 pb-24 max-w-4xl">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="w-16 h-[2px] gradient-gold mx-auto mb-8"
        />

        {badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full glass text-accent text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            {badge}
          </motion.span>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="font-heading text-gradient-gold text-5xl md:text-7xl lg:text-8xl font-bold mb-5 leading-[0.95]"
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-accent/90 font-body text-lg md:text-xl mb-4 font-medium tracking-wide"
          >
            {subtitle}
          </motion.p>
        )}

        {desc && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-primary-foreground/80 font-body text-base md:text-lg max-w-2xl mx-auto mb-10 font-light tracking-wide"
          >
            {desc}
          </motion.p>
        )}

        {promo.ctaHref && cta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a
              href={promo.ctaHref}
              className="inline-flex items-center gap-2 gradient-gold text-accent-foreground font-body font-bold px-8 py-3.5 rounded-full hover:shadow-glow-gold transition-all duration-300 text-sm tracking-wide"
            >
              {cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-bg to-transparent" />
    </div>
  );
};

/* ---------- Hero with carousel ---------- */
const Hero = () => {
  const promos = usePromotions({ location: 'home', sort: 'priority' });
  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [autoplay.current]);
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const slides = [{ kind: 'main' as const }, ...promos.map((p) => ({ kind: 'promo' as const, promo: p }))];
  const hasMultiple = slides.length > 1;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    setSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', () => setSnaps(emblaApi.scrollSnapList()));
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  // No promos → render original hero alone, no carousel chrome.
  if (!hasMultiple) {
    return (
      <section className="relative">
        <HeroMain />
      </section>
    );
  }

  return (
    <section className="relative group" aria-roledescription="carousel" aria-label="Hero">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, i) => (
            <div
              key={i}
              className="min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${slides.length}`}
            >
              {s.kind === 'main' ? <HeroMain /> : <PromoSlide promo={s.promo} />}
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full glass text-primary-foreground hover:bg-accent/20 hover:text-accent transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 md:h-12 md:w-12 rounded-full glass text-primary-foreground hover:bg-accent/20 hover:text-accent transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {snaps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={selected === i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              selected === i ? 'w-8 bg-accent' : 'w-2 bg-primary-foreground/40 hover:bg-primary-foreground/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
