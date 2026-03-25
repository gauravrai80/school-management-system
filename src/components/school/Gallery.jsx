import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "@/config/api";
import { useQuery } from "@tanstack/react-query";

const categories = ["All", "events", "sports", "academics", "cultural", "campus"];

const Gallery = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['public-gallery', filter],
    queryFn: async () => {
      const url = filter === "All" ? '/gallery' : `/gallery?category=${filter}`;
      const res = await api.get(url);
      return res.data.data;
    }
  });

  return (
    <section id="gallery" className="section-padding bg-surface/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            <span className="text-gradient-gold">Gallery</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-300 capitalize ${
                filter === cat
                  ? "bg-cyan text-cyan-foreground glow-cyan"
                  : "glass text-text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={40} /></div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {images.map((img, i) => (
              <motion.div
                key={img._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl break-inside-avoid cursor-pointer group relative overflow-hidden bg-muted/20"
                onClick={() => setLightbox(img)}
              >
                <img src={img.imageUrl} alt={img.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-body font-semibold text-foreground text-sm">{img.title}</span>
                </div>
              </motion.div>
            ))}
            {images.length === 0 && (
              <div className="glass rounded-xl p-12 text-center text-text-muted font-body col-span-full">
                No images available in this category.
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-foreground" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            <img src={lightbox.imageUrl} alt={lightbox.title} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
