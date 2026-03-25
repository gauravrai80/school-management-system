import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [];

const Testimonials = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  if (testimonials.length === 0) {
    return (
      <section className="section-padding bg-surface/30" ref={ref}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
              What They <span className="text-gradient-gold">Say</span>
            </h2>
          </motion.div>
          <div className="glass rounded-2xl p-12 text-center text-text-muted font-body">
            No testimonials available.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-surface/30" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            What They <span className="text-gradient-gold">Say</span>
          </h2>
        </motion.div>

        <div className="relative">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-8 sm:p-12 text-center"
          >
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="text-gold fill-gold" size={20} />
              ))}
            </div>
            <p className="text-lg sm:text-xl text-foreground font-body italic mb-8 leading-relaxed">
              "{testimonials[current].quote}"
            </p>
            <div className="font-display font-bold text-foreground text-lg">{testimonials[current].name}</div>
            <div className="text-cyan font-body text-sm">{testimonials[current].role}</div>
          </motion.div>

          <div className="flex justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-gold/40 transition-colors">
              <ChevronLeft className="text-gold" size={20} />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-gold w-6" : "bg-muted"}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-gold/40 transition-colors">
              <ChevronRight className="text-gold" size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
