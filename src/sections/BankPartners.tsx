import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ardshinLogo from '@/assets/banks/ardshinbank.png';
import acbaLogo from '@/assets/banks/acba.png';
import ameriaLogo from '@/assets/banks/ameria.png';
import idbankLogo from '@/assets/banks/idbank.png';
import evocaLogo from '@/assets/banks/evoca.png';

const banks = [
  { name: 'Ardshinbank', logo: ardshinLogo },
  { name: 'ACBA Bank', logo: acbaLogo },
  { name: 'Ameriabank', logo: ameriaLogo },
  { name: 'IDBank', logo: idbankLogo },
  { name: 'Evocabank', logo: evocaLogo },
];

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

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {banks.map((bank, i) => (
            <motion.div
              key={bank.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-background rounded-2xl p-5 h-20 flex items-center gap-4 hover:shadow-card-hover transition-all duration-500 border border-transparent hover:border-accent/20"
            >
              <img
                src={bank.logo}
                alt={`${bank.name} logo`}
                loading="lazy"
                className="w-12 h-12 object-contain shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {bank.name}
              </span>
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
