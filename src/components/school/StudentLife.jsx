import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Trophy, Palette, FlaskConical, MessageSquare, Music, Sparkles } from "lucide-react";

const clubs = [
  { name: "Sports Club", icon: Trophy, color: "text-gold" },
  { name: "Arts Society", icon: Palette, color: "text-cyan" },
  { name: "Science Lab", icon: FlaskConical, color: "text-gold" },
  { name: "Debate Team", icon: MessageSquare, color: "text-cyan" },
  { name: "Music Band", icon: Music, color: "text-gold" },
  { name: "Dance Crew", icon: Sparkles, color: "text-cyan" },
];

const achievements = [];

const StudentLife = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Student <span className="text-gradient-gold">Life</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto font-body">
            Beyond academics — where passions come alive.
          </p>
        </motion.div>

        {/* Clubs carousel */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6 mb-16">
          <div className="flex gap-6 min-w-max">
            {clubs.map((club, i) => (
              <motion.div
                key={club.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-xl p-8 w-48 flex-shrink-0 flex flex-col items-center gap-4 hover:border-gold/30 transition-all duration-300 group cursor-pointer"
              >
                <club.icon className={`${club.color} group-hover:scale-110 transition-transform`} size={36} />
                <span className="font-body font-semibold text-foreground text-sm">{club.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-lg p-4 font-body text-text-muted text-sm hover:border-gold/30 transition-all"
            >
              {ach}
            </motion.div>
          ))}
          {achievements.length === 0 && (
            <div className="text-center text-text-muted font-body py-8 col-span-full">
              No achievements listed yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudentLife;
