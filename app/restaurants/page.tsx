import { Suspense } from 'react';
import RestaurantsPage from './RestaurantsPage'; // your client component

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantsPage />
    </Suspense>
  );
}