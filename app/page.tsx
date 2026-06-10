import Hero from '../components/home/Hero';
import CTASection from '@/components/home/CTASection';
import Testimonials from '../components/home/Testimonials';
import WhyMultiCusine from '../components/home/WhyMultiCuisine';
import HowItWorks from '@/components/home/HowItWorks';
import { getWebsiteContent } from '@/lib/websiteContent';
// import MenuComparison from '@/components/home/MenuComparision';
import NewArrivals from '@/components/home/NewArrivals';
import CTA from '@/components/home/CTA';
import TopRatedCuisines from "@/components/home/TopRatedCuisines";
import CuratedCollections from "@/components/home/CuratedCollections";
import MoodCollections from "@/components/home/MoodCollections";


import FeaturedRestaurants from '@/components/home/FeaturedRestaurants';
export default async function HomePage() {
    const content = await getWebsiteContent();

  return (
    <>
    <div>
      <Hero  />
       <FeaturedRestaurants />
       <MoodCollections /> 
       <TopRatedCuisines />
         <CTA />
       <CuratedCollections />
         
   
           {/* <MenuComparison /> */}<NewArrivals/>
  
         <WhyMultiCusine />
            <HowItWorks />  
                        <Testimonials data={content?.testimonials_section ?? null} />
      <CTASection />
      </div>
    </>
  );
}