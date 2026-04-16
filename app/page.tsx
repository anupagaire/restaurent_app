import Hero from '../components/home/Hero';
// import MenuPreview from '../components/home/MenuPreview';
// import Reservations from '../components/home/Reservations';
import CTASection from '@/components/home/CTASection';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';
import HowItWorks from '@/components/home/HowItWorks';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { restaurantInfo } from '../data/mockData';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero restaurant={restaurantInfo} />
       
   <WhyMultiCusine />
   <HowItWorks />    

      <Testimonials /> 
      <CTASection />
      <Footer />
    </>
  );
}