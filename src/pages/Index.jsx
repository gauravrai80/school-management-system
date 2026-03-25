import Navbar from "@/components/school/Navbar";
import Hero from "@/components/school/Hero";
import About from "@/components/school/About";
import Academics from "@/components/school/Academics";
import Admissions from "@/components/school/Admissions";
import Faculty from "@/components/school/Faculty";
import StudentLife from "@/components/school/StudentLife";
import Gallery from "@/components/school/Gallery";
import EventsNews from "@/components/school/EventsNews";
import Testimonials from "@/components/school/Testimonials";
import StatsCounter from "@/components/school/StatsCounter";
import Contact from "@/components/school/Contact";
import Footer from "@/components/school/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Academics />
      <Admissions />
      <Faculty />
      <StudentLife />
      <Gallery />
      <EventsNews />
      <Testimonials />
      <StatsCounter />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
