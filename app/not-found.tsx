import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen  flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <ChefHat className="h-24 w-24 text-[#513012]" />
        </div>

        <h1 className="text-8xl font-bold text-gray-300 mb-2">404</h1>
        
        <h2 className="text-4xl font-semibold text-gray-800 mb-4">
          Oops! Table Not Found
        </h2>

        <p className="text-[#3B1C32] text-lg mb-8">
          Looks like this page got lost in the kitchen. 
          Don&apos;t worry, our chef is working on it!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Restaurant
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild>
            <Link href="/menu">
              View Our Menu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}