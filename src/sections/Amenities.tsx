import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car, TreePine, Shield, Dumbbell, Trees, Archive, Cpu, Waves } from 'lucide-react';

const amenityIcons = {
  parking: Car,
  playground: TreePine,
  security: Shield,
  gym: Dumbbell,
  green: Trees,
  storage: Archive,
  smart: Cpu,
  pool: Waves,
};

const amenityKeys = Object.keys(amenityIcons) as (keyof typeof amenityIcons)[];

const Amenities = () => {
  const { t } = useTranslation();

  return (
    <section id="amenities" className="py-24 bg-warm-bg relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
          <h2 className="font-heading text-foreground text-4xl md:text-5xl lg:text-6xl font-bold">
            {t('amenities.sectionTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {amenityKeys.map((key, i) => {
            const Icon = amenityIcons[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                className="group bg-background rounded-2xl p-7 text-center hover:shadow-card-hover transition-all duration-500 cursor-default border border-transparent hover:border-accent/20"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 group-hover:shadow-glow-gold transition-all duration-500 group-hover:scale-105">
                  <Icon size={22} className="text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-foreground text-xl font-semibold mb-2">
                  {t(`amenities.items.${key}.title`)}
                </h3>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">
                  {t(`amenities.items.${key}.desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Amenities;
