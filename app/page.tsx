import Hero from '../components/home/Hero';
import CTASection from '@/components/home/CTASection';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';
import HowItWorks from '@/components/home/HowItWorks';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero  />
       <FeaturedRestaurants />
   <WhyMultiCusine />
   <HowItWorks />    

      <Testimonials /> 
      <CTASection />
      <Footer />
    </>
  );
}