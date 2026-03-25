import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import VanillaTilt from "vanilla-tilt";

const faculty = [];

const departments = ["All", "Science", "Maths", "Humanities", "Sports"];

const Faculty = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState("All");
  const tiltRefs = useRef([]);

  const filtered = filter === "All" ? faculty : faculty.filter((f) => f.dept === filter);

  useEffect(() => {
    const elements = tiltRefs.current.filter(Boolean);
    elements.forEach((el) => {
      VanillaTilt.init(el, {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
      });
    });
    return () => {
      elements.forEach((el) => {
        if (el.vanillaTilt) el.vanillaTilt.destroy();
      });
    };
  }, [filter]);

  return (
    <section id="faculty" className="section-padding bg-surface/30" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Our <span className="text-gradient-cyan">Faculty</span>
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto font-body">
            World-class educators shaping the next generation.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setFilter(dept)}
              className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-300 ${
                filter === dept
                  ? "bg-gold text-gold-foreground glow-gold"
                  : "glass text-text-muted hover:text-foreground"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center text-text-muted font-body">
            No faculty members found for this department.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div
                  ref={(el) => { tiltRefs.current[i] = el; }}
                  className="glass rounded-xl p-6 text-center cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-cyan/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-display font-bold text-foreground">{member.photo}</span>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg">{member.name}</h3>
                  <p className="text-cyan font-body text-sm">{member.subject}</p>
                  <p className="text-text-muted font-body text-xs mt-1">{member.exp} years experience</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Faculty;
