import Hero from '../components/home/Hero';
// import MenuPreview from '../components/home/MenuPreview';
// import Reservations from '../components/home/Reservations';
// import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';

import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { restaurantInfo } from '../data/mockData';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero restaurant={restaurantInfo} />
       {/* <MenuPreview />
       <Reservations />
       <Gallery /> */}
       <WhyMultiCusine />
      <Testimonials /> 
      <Footer />
    </>
  );
}