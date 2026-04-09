import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Train, GraduationCap, TreePine, ShoppingBag, Heart } from 'lucide-react';

const poiData = [
  { key: 'metro', icon: Train },
  { key: 'school', icon: GraduationCap },
  { key: 'park', icon: TreePine },
  { key: 'market', icon: ShoppingBag },
  { key: 'hospital', icon: Heart },
] as const;

const Location = () => {
  const { t } = useTranslation();

  return (
    <section id="location" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
          <h2 className="font-heading text-foreground text-4xl md:text-5xl lg:text-6xl font-bold">
            {t('location.sectionTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 rounded-3xl overflow-hidden shadow-elevated h-[420px] ring-1 ring-border"
          >
            <iframe
              src="https://maps.google.com/maps?q=Komitas+Avenue,+Yerevan,+Armenia&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="New Komitas Location"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 flex flex-col gap-3"
          >
            {poiData.map(({ key, icon: Icon }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex items-center gap-4 bg-warm-bg rounded-2xl p-4 hover:shadow-soft transition-all duration-300 border border-transparent hover:border-accent/15"
              >
                <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-gold transition-shadow duration-300">
                  <Icon size={18} className="text-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-foreground font-semibold text-sm">
                    {t(`location.pois.${key}.name`)}
                  </p>
                  <p className="font-body text-muted-foreground text-xs">
                    {t(`location.pois.${key}.distance`)}
                  </p>
                </div>
                <MapPin size={14} className="text-accent/50" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Location;
