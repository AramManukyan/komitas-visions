import '../i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Video from '@/sections/Video';
import Gallery from '@/sections/Gallery';
import Amenities from '@/sections/Amenities';
import Location from '@/sections/Location';
import BankPartners from '@/sections/BankPartners';
import ContactForm from '@/sections/ContactForm';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Video />
      <Gallery />
      <Amenities />
      <Location />
      <BankPartners />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
