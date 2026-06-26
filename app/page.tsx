import Hero from '../components/home/Hero';
import CTASection from '@/components/home/CTASection';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';
import HowItWorks from '@/components/home/HowItWorks';
import { getWebsiteContent } from '@/lib/websiteContent';
import NewArrivals from '@/components/home/NewArrivals';
import CTA from '@/components/home/CTA';
import TopRatedCuisines from "@/components/home/TopRatedCuisines";
import MoodCollections from "@/components/home/MoodCollections";


import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
export default async function HomePage() {
    const content = await getWebsiteContent();

  return (
    <>
    <div className="bg-primary/10">
      <Hero  />
       <FeaturedRestaurants />
       <MoodCollections /> 
       <TopRatedCuisines />
         <CTA />
       {/* <CuratedCollections />  */}
  <NewArrivals/>
  
         <WhyMultiCusine />
            <HowItWorks />  
                        <Testimonials data={content?.testimonials_section ?? null} />
      <CTASection />
      </div>
    </>
  );
}