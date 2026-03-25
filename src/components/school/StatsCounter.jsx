import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [];

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-display font-bold text-gold">
      {count}{suffix}
    </span>
  );
};

const StatsCounter = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding dot-grid-bg relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <Counter target={stat.value} suffix={stat.suffix} />
              <div className="text-sm text-text-muted font-body mt-2">{stat.label}</div>
            </motion.div>
          ))}
          {stats.length === 0 && (
            <div className="text-center text-text-muted font-body py-8 col-span-full">
              No statistics available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
