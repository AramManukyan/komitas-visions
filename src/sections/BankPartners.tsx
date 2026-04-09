import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const banks = ['Ameriabank', 'Ardshinbank', 'ACBA Bank', 'Evocabank', 'IDBank'];

const BankPartners = () => {
  const { t } = useTranslation();

  return (
    <section id="banks" className="py-24 gradient-navy relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center relative">
        <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
        <h2 className="font-heading text-gradient-gold text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {t('banks.sectionTitle')}
        </h2>
        <p className="font-body text-primary-foreground/60 mb-14 max-w-xl mx-auto text-sm leading-relaxed">
          {t('banks.subtitle')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {banks.map((bank, i) => (
            <motion.div
              key={bank}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-background rounded-2xl p-6 flex flex-col items-center gap-3 hover:shadow-card-hover transition-all duration-500 border border-transparent hover:border-accent/20"
            >
              <div className="w-12 h-12 rounded-xl bg-warm-bg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building2 size={24} className="text-primary" strokeWidth={1.5} />
              </div>
              <p className="font-body text-foreground text-sm font-bold tracking-wide">{bank}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass inline-block rounded-full px-6 py-2.5">
          <p className="font-body text-accent/90 text-sm">{t('banks.note')}</p>
        </div>
      </div>
    </section>
  );
};

export default BankPartners;
