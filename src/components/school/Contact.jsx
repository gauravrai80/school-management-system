import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

const contactInfo = [
  { icon: MapPin, label: "Address", value: "42 Academy Lane, Cambridge, UK" },
  { icon: Phone, label: "Phone", value: "+44 1234 567 890" },
  { icon: Mail, label: "Email", value: "info@aethelgard.edu" },
];

const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  return (
    <section id="contact" className="section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Get in <span className="text-gradient-cyan">Touch</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            {/* Map placeholder */}
            <div className="glass rounded-xl overflow-hidden mb-8 h-64">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.297703999843!2d0.1181!3d52.2053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEyJzE5LjEiTiAwwrAwNycwNS4yIkU!5e0!3m2!1sen!2suk!4v1"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
              />
            </div>

            <div className="grid gap-4">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:border-cyan/30 transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center group-hover:glow-cyan transition-shadow">
                    <info.icon className="text-cyan" size={22} />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted font-body">{info.label}</div>
                    <div className="text-foreground font-body font-semibold">{info.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass rounded-xl p-8 space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            {["name", "email"].map((field) => (
              <div key={field} className="relative">
                <input
                  type={field === "email" ? "email" : "text"}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full bg-transparent border border-border/50 rounded-lg px-4 pt-6 pb-2 text-foreground font-body focus:outline-none focus:border-cyan transition-colors peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-4 text-text-muted font-body text-sm transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}
            <div className="relative">
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full bg-transparent border border-border/50 rounded-lg px-4 pt-6 pb-2 text-foreground font-body focus:outline-none focus:border-cyan transition-colors peer resize-none"
                placeholder=" "
              />
              <label className="absolute left-4 top-4 text-text-muted font-body text-sm transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-cyan peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Message
              </label>
            </div>
            <button className="btn-gold w-full text-base">Send Message</button>
          </motion.form>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/441234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <MessageCircle className="text-foreground" size={26} />
      </a>
    </section>
  );
};

export default Contact;
