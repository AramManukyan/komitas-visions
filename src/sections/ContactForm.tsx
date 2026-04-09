import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  email: string;
  size: string;
  message: string;
}

const ContactForm = () => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    toast.success(t('contact.success'));
    reset();
    console.log('Form submitted:', data);
  };

  const inputClass =
    'w-full px-5 py-4 rounded-2xl border border-border/60 bg-background text-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/30 transition-all duration-300 placeholder:text-muted-foreground/50';
  const errorClass = 'text-destructive text-xs font-body mt-1.5 ml-1';

  return (
    <section id="contact" className="py-24 bg-warm-bg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 max-w-xl relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-10">
            <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
            <h2 className="font-heading text-foreground text-4xl md:text-5xl lg:text-6xl font-bold">
              {t('contact.sectionTitle')}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('name', { required: t('contact.errors.nameRequired') })}
                  placeholder={t('contact.name')}
                  className={inputClass}
                />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div>
                <input
                  {...register('phone', { required: t('contact.errors.phoneRequired') })}
                  placeholder={t('contact.phone')}
                  className={inputClass}
                />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('email', {
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('contact.errors.emailInvalid') },
                  })}
                  placeholder={t('contact.email')}
                  className={inputClass}
                />
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
              </div>
              <div>
                <select {...register('size')} className={inputClass}>
                  <option value="">{t('contact.size')}</option>
                  <option value="1bed">{t('contact.sizeOptions.1bed')}</option>
                  <option value="2bed">{t('contact.sizeOptions.2bed')}</option>
                  <option value="3bed">{t('contact.sizeOptions.3bed')}</option>
                  <option value="4bed">{t('contact.sizeOptions.4bed')}</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                {...register('message', { required: t('contact.errors.messageRequired') })}
                placeholder={t('contact.message')}
                rows={4}
                className={inputClass + ' resize-none'}
              />
              {errors.message && <p className={errorClass}>{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-accent font-body font-bold py-4 rounded-2xl hover:shadow-elevated transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 text-sm tracking-wide group"
            >
              {sending ? (
                <span className="animate-pulse">{t('contact.sending')}</span>
              ) : (
                <>
                  {t('contact.submit')}
                  <Send size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
