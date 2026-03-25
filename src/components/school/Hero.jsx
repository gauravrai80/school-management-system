import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ParticleHero from "./ParticleHero";

const stats = [];

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleHero />

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6"
        >
          Shaping Tomorrow&apos;s{" "}
          <span className="text-gradient-gold">Leaders</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 font-body"
        >
          Where tradition meets innovation. Aethelgard Academy prepares exceptional minds
          for a world that doesn&apos;t yet exist.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <button className="btn-gold text-base">Apply Now</button>
          <button className="btn-cyan-outline text-base">Virtual Tour</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 animate-float"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              <div className="text-2xl sm:text-3xl font-display font-bold text-gold">{stat.value}</div>
              <div className="text-sm text-text-muted font-body">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      <a href="#about" className="absolute bottom-8 z-10">
        <ChevronDown className="text-gold animate-scroll-arrow" size={32} />
      </a>
    </section>
  );
};

export default Hero;
