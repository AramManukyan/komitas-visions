import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, FileSpreadsheet, FileCheck2, FileBadge, BookOpen } from 'lucide-react';

const documents = [
  { key: 'brochure', icon: BookOpen, size: '4.2 MB', type: 'PDF' },
  { key: 'floorPlans', icon: FileSpreadsheet, size: '8.7 MB', type: 'PDF' },
  { key: 'priceList', icon: FileText, size: '320 KB', type: 'PDF' },
  { key: 'specs', icon: FileBadge, size: '1.1 MB', type: 'PDF' },
  { key: 'license', icon: FileCheck2, size: '540 KB', type: 'PDF' },
  { key: 'contract', icon: FileText, size: '780 KB', type: 'PDF' },
];

const Documents = () => {
  const { t } = useTranslation();

  return (
    <section id="documents" className="py-24 bg-warm-bg relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14">
          <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
          <h2 className="font-heading text-primary text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {t('documents.sectionTitle')}
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            {t('documents.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {documents.map((doc, i) => {
            const Icon = doc.icon;
            return (
              <motion.a
                key={doc.key}
                href="#"
                onClick={(e) => e.preventDefault()}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/5 grid place-items-center text-primary group-hover:bg-accent/10 group-hover:text-accent-foreground transition-colors">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-heading text-base font-bold text-foreground truncate">
                    {t(`documents.items.${doc.key}.title`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {doc.type} · {doc.size}
                  </p>
                </div>
                <div className="shrink-0 h-9 w-9 rounded-full border border-border grid place-items-center text-muted-foreground group-hover:text-accent-foreground group-hover:border-accent/40 transition-colors">
                  <Download className="h-4 w-4" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Documents;
