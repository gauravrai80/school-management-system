import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const values = ["Excellence", "Innovation", "Integrity", "Community"];

const timeline = [];

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            About <span className="text-gradient-gold">Aethelgard</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto font-body">
            A legacy of excellence, a vision for the future.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* 3D Cube */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="perspective-1000 w-48 h-48">
              <div className="relative w-full h-full preserve-3d animate-rotate-cube">
                {values.map((val, i) => {
                  const transforms = [
                    "translateZ(96px)",
                    "rotateY(90deg) translateZ(96px)",
                    "rotateY(180deg) translateZ(96px)",
                    "rotateY(270deg) translateZ(96px)",
                  ];
                  return (
                    <div
                      key={val}
                      className="absolute inset-0 glass rounded-xl flex items-center justify-center border border-gold/30"
                      style={{ transform: transforms[i] }}
                    >
                      <span className="text-xl font-display font-bold text-gold">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-2xl font-display font-bold text-foreground mb-4">Our Mission</h3>
            <p className="text-text-muted font-body mb-6">
              To cultivate visionary thinkers who will lead with integrity and innovation.
              We blend rigorous academics with cutting-edge technology to prepare students
              for challenges that haven't been imagined yet.
            </p>
            <h3 className="text-2xl font-display font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-text-muted font-body">
              To be the world's most forward-thinking academy — a place where tradition fuels
              progress and every student discovers their extraordinary potential.
            </p>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="flex gap-6 min-w-max">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="glass rounded-xl p-6 w-56 flex-shrink-0 group hover:border-gold/40 transition-all duration-300"
              >
                <div className="text-2xl font-display font-bold text-gold mb-2">{item.year}</div>
                <div className="text-sm text-text-muted font-body">{item.event}</div>
              </motion.div>
            ))}
            {timeline.length === 0 && (
              <div className="glass rounded-xl p-6 w-full text-center text-text-muted font-body">
                Academy timeline will be updated soon.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
