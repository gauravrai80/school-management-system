import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import api from "@/config/api";
import { useQuery } from "@tanstack/react-query";

const EventsNews = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  const { data: news = [], isLoading: loadingNews } = useQuery({
    queryKey: ['public-news'],
    queryFn: async () => {
      const res = await api.get('/news');
      return res.data.data;
    }
  });

  return (
    <section id="news" className="section-padding" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-foreground mb-4">
            Events & <span className="text-gradient-cyan">News</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Events */}
          <div className="glass rounded-xl p-8">
            <h3 className="text-xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="text-gold" size={22} /> Upcoming Events
            </h3>
            <div className="space-y-4">
              {loadingEvents ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gold" /></div>
              ) : events.length === 0 ? (
                <div className="text-center text-text-muted font-body py-8">No upcoming events.</div>
              ) : (
                events.map((event, i) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gold/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-body text-gold font-bold">
                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg font-display font-bold text-gold">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-body font-semibold text-foreground">{event.title}</h4>
                      <p className="text-xs text-text-muted font-body flex items-center gap-1">
                        <Clock size={12} /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* News */}
          <div className="glass rounded-xl p-8">
            <h3 className="text-xl font-display font-bold text-foreground mb-6">Recent News</h3>
            <div className="space-y-4">
              {loadingNews ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan" /></div>
              ) : news.length === 0 ? (
                <div className="text-center text-text-muted font-body py-8">No recent news.</div>
              ) : (
                news.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="p-4 rounded-lg border border-border/30 hover:border-cyan/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-body font-semibold text-foreground group-hover:text-cyan transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-xs text-text-muted font-body mt-1">{new Date(item.publishDate).toLocaleDateString()}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsNews;
