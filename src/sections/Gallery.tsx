import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import nk1 from "../assets/images/NK1 (2).png";
import nk2 from "../assets/images/NK2 (9).png";
import nk3 from "../assets/images/NK3.png";
import nk4 from "../assets/images/NK4 (2).png";
import nk5 from "../assets/images/NK5 (1).png";
import nk6 from "../assets/images/NK6 (1).png";
import nk7 from "../assets/images/NK7.png";
import nk8 from "../assets/images/NK8 (2).png";
import nk9 from "../assets/images/NK9.png";
import nk10 from "../assets/images/NK10.png";
import nkWhatsapp from "../assets/images/WhatsApp Image 2026-02-16 at 18.45.10.jpeg";
import nkZ from "../assets/images/z_NK.png";

const categories = ["exterior", "interior", "floorPlans"] as const;

const images = {
  exterior: [nk1, nk2, nk3],
  interior: [nk5, nk7, nk8],
  floorPlans: [nk9, nk10, nkWhatsapp],
};

const Gallery = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState<(typeof categories)[number]>("exterior");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const currentImages = images[active];

  return (
    <section id="gallery" className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <div className="w-12 h-[2px] gradient-gold mx-auto mb-6" />
            <h2 className="font-heading text-foreground text-4xl md:text-5xl lg:text-6xl font-bold">
              {t("gallery.sectionTitle")}
            </h2>
          </div>

          {/* Modern pill tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex gap-1 bg-warm-bg rounded-full p-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`relative font-body text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 ${
                    active === cat
                      ? "gradient-gold text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(`gallery.${cat}`)}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {currentImages.map((src, i) => (
                <motion.div
                  key={`${active}-${i}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="group cursor-pointer overflow-hidden rounded-2xl relative"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={src}
                    alt={`${active} ${i + 1}`}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-accent-foreground"
                      >
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={currentImages.map((src) => ({ src }))}
      />
    </section>
  );
};

export default Gallery;
