'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Review {
  id: number;
  user: any;
  rating: number;
  review: string;
  is_published: boolean;
  photos: any[];
  created_on: string;
}

export default function RestaurantReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reviewsPerPage = 9; 

  const restaurantId = typeof window !== 'undefined' ? localStorage.getItem('restaurant_id') : null;

  useEffect(() => {
    if (restaurantId) fetchReviews();
  }, [restaurantId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const restRes = await apiFetch(`/api/v1/restaurant/${restaurantId}/`);
      if (restRes.ok) {
        const data = await restRes.json();
        setRestaurantName(data.restaurant_name);
      }

      const res = await apiFetch(
        `/api/v1/restaurant-reviews/?restaurant=${restaurantId}&page=${currentPage}&page_size=${reviewsPerPage}`
      );

      if (res.ok) {
        const data = await res.json();
        setReviews(data.results || []);
        setTotalPages(Math.ceil(data.count / reviewsPerPage) || 1);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: number, current: boolean) => {
    try {
      await apiFetch(`/api/v1/restaurant-reviews/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_published: !current }),
      });
      fetchReviews();
    } catch {
      alert('Failed to update status');
    }
  };



  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
const getReviewName = (reviewText: string): string => {
  const match = reviewText.match(/^\[(.+?)\]/);
  return match ? match[1] : 'Anonymous';
};

const getReviewText = (reviewText: string): string => {
  // Remove [Name] prefix if exists
  return reviewText.replace(/^\[.+?\]\s*/, '');
};
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">Customer Reviews</h1>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {reviews.length} Reviews
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <Card className="py-20 text-center">
          <p className="text-primary text-xl">No reviews yet.</p>
        </Card>
      ) : (
        <>
          {/* Reviews Grid - 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="flex text-2xl text-accent0">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="fill-current" />
                        ))}
                      </div>
                      <span className="text-xl font-bold text-accent">{review.rating}</span>
                    </div>

                    <Badge variant={review.is_published ? "default" : "secondary"}>
                      {review.is_published ? "Published" : "Hidden"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                 <div>
  <p className="font-semibold text-gray-800 mb-1">
    {review.user 
      ? `${review.user.first_name} ${review.user.last_name || ''}`.trim() 
      : getReviewName(review.review)}
  </p>
  <p className="text-gray-700 line-clamp-4 text-[15px] leading-relaxed">
   Review: {getReviewText(review.review)}
  </p>
</div>
                  <div className="text-xs text-primary">
                    {formatDate(review.created_on)}
                  </div>

                  {review.photos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.photos.slice(0, 3).map((photo: any) => (
                        <img
                          key={photo.id}
                          src={photo.photo_url}
                          alt="review"
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                      ))}
                      {review.photos.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-primary">
                          +{review.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReview(review)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Full
                    </Button>

                   

                   
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Full Review Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-primary/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex text-3xl text-accent0">
                      {Array.from({ length: selectedReview.rating }).map((_, i) => (
                        <Star key={i} className="fill-current" />
                      ))}
                    </div>
                    <span className="text-3xl font-bold">{selectedReview.rating}/5</span>
                  </div>
                  <p className="text-primary mt-1">
                    {formatDate(selectedReview.created_on)}
                  </p>
                </div>

                <Button variant="ghost" onClick={() => setSelectedReview(null)}>
                  ✕
                </Button>
              </div>

             <div className="mb-6">
  <p className="font-semibold text-xl text-gray-800">
    {selectedReview.user 
      ? `${selectedReview.user.first_name} ${selectedReview.user.last_name || ''}`.trim() 
      : getReviewName(selectedReview.review)}
  </p>
</div>

<p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
 Review: {getReviewText(selectedReview.review)}
</p>

              {selectedReview.photos?.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-4">Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReview.photos.map((photo: any) => (
                      <img
                        key={photo.id}
                        src={photo.photo_url}
                        alt="review"
                        className="rounded-xl border object-cover aspect-square"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}