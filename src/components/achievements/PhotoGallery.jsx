import { useState } from 'react';
import { motion } from 'framer-motion';
import { Expand, Images } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import SmartImage from '../ui/SmartImage.jsx';
import Lightbox from './Lightbox.jsx';

// Thumbnail grid of an event's photos; a thumbnail opens the full-size viewer on that photo.
export default function PhotoGallery({ photos, title }) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="mt-14">
      <h2 className="flex items-center gap-3 text-2xl font-bold">
        <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-logo-blue" />
        {t('achievementPage.gallery')}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-white/5 px-3 py-1 text-sm font-bold text-muted">
          <Images className="size-4 text-logo-blue" />
          {photos.length}
        </span>
      </h2>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {photos.map((photo, index) => (
          <motion.li
            key={photo}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`${t('achievementPage.viewPhoto')} ${index + 1}`}
              className="glass group relative block aspect-square w-full overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-logo-blue/60 hover:shadow-[0_24px_60px_-30px_rgba(79,140,255,0.9)]"
            >
              <SmartImage
                src={photo}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-space/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <span className="grid size-11 place-items-center rounded-full border border-white/20 bg-space/70 backdrop-blur-md">
                  <Expand className="size-5" />
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <Lightbox
        photos={photos}
        index={openIndex}
        title={title}
        onChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </section>
  );
}
