import Hero from '../components/home/Hero';
import CTASection from '@/components/home/CTASection';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';
import HowItWorks from '@/components/home/HowItWorks';
import { getWebsiteContent } from '@/lib/websiteContent';

import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
export default async function HomePage() {
    const content = await getWebsiteContent();

  return (
    <>
    <div>
      <Hero  />
       <FeaturedRestaurants />
   <WhyMultiCusine />
   <HowItWorks />    

   
            <Testimonials data={content?.testimonials_section ?? null} />

      <CTASection />
      </div>
    </>
  );
}