import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState, useRef } from 'react';
import videoSrc from '../assets/video.mp4';

const Video = () => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  return (
    <section className="py-24 gradient-navy relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
              <h2 className="font-heading text-primary-foreground text-4xl md:text-5xl lg:text-6xl font-bold">
                {t('video.sectionTitle')}
              </h2>
            </div>
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-accent/10">
              {!playing && (
                <div
                  className="absolute inset-0 bg-primary/40 flex items-center justify-center cursor-pointer group z-10"
                  onClick={handlePlay}
                >
                  <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center shadow-glow-gold group-hover:scale-110 transition-transform duration-300">
                    <Play size={32} className="text-accent-foreground ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                controls={playing}
                onEnded={() => setPlaying(false)}
              />
            </div>
          </div>
          <p className="text-accent/80 font-heading text-xl italic mt-8 tracking-wide">{t('video.caption')}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Video;
