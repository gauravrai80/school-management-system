import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, FlaskConical, Palette, Trophy, Music, Calculator, Globe } from "lucide-react";

const subjects = [];

const Academics = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="academics" className="section-padding bg-surface/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Our <span className="text-gradient-cyan">Academics</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto font-body">
            A comprehensive curriculum designed for the leaders of tomorrow.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, i) => (
            <motion.div
              key={subject.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="perspective-1000 h-56 group cursor-pointer"
            >
              <div className="relative w-full h-full preserve-3d transition-transform duration-700 group-hover:rotate-y-180">
                {/* Front */}
                <div className="absolute inset-0 backface-hidden glass rounded-xl flex flex-col items-center justify-center gap-4 p-6">
                  <subject.icon className="text-cyan" size={40} />
                  <h3 className="text-lg font-display font-bold text-foreground">{subject.name}</h3>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 glass rounded-xl flex flex-col items-center justify-center gap-4 p-6 border-cyan/30 border">
                  <p className="text-sm text-text-muted font-body text-center">{subject.desc}</p>
                  <button className="text-sm text-cyan font-body font-semibold hover:underline">Learn More →</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Academics;
