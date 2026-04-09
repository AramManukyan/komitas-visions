import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();
  const points = ['1', '2', '3', '4', '5'];

  return (
    <section id="about" className="py-24 bg-warm-bg relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
        >
          <div>
            <div className="w-12 h-[2px] gradient-gold mb-6" />
            <h2 className="font-heading text-foreground text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1]">
              {t('about.sectionTitle')}
            </h2>
            <div className="space-y-5">
              <p className="font-body text-muted-foreground leading-relaxed text-[15px]">{t('about.p1')}</p>
              <p className="font-body text-muted-foreground leading-relaxed text-[15px]">{t('about.p2')}</p>
              <p className="font-body text-muted-foreground leading-relaxed text-[15px]">{t('about.p3')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {points.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="group flex items-start gap-4 bg-primary rounded-2xl p-5 hover:shadow-elevated transition-all duration-300 cursor-default"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shadow-sm group-hover:shadow-glow-gold transition-shadow duration-300">
                  <Check size={16} className="text-accent-foreground" strokeWidth={3} />
                </div>
                <p className="text-primary-foreground/90 font-body text-sm pt-1.5 leading-relaxed">
                  {t(`about.points.${p}`)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
