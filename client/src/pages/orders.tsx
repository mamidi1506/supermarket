import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Package, Truck, CheckCircle, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const OrderStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "processing":
      return <Package className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <Package className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const OrderStatusBadge = ({ status }: { status: string }) => {
  const variants = {
    pending: "secondary",
    processing: "default", 
    delivered: "default",
    cancelled: "destructive",
  } as const;

  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800", 
    cancelled: "bg-red-100 text-red-800",
  } as const;

  return (
    <Badge className={colors[status as keyof typeof colors] || colors.pending}>
      <OrderStatusIcon status={status} />
      <span className="ml-1 capitalize">{status}</span>
    </Badge>
  );
};

const FeedbackModal = ({ order, onClose }: { order: any; onClose: () => void }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      const response = await apiRequest("POST", "/api/feedback", feedbackData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate({
      orderId: order.id,
      rating,
      comment,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rate Your Order</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Rating</Label>
          <RadioGroup value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="flex items-center space-x-2">
                  <RadioGroupItem value={star.toString()} id={`star-${star}`} />
                  <label htmlFor={`star-${star}`} className="flex items-center cursor-pointer">
                    {star} <Star className="h-4 w-4 ml-1" />
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="comment">Comment (Optional)</Label>
          <Textarea
            id="comment"
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            data-testid="textarea-feedback"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={feedbackMutation.isPending}
            data-testid="button-submit-feedback"
          >
            Submit Feedback
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default function Orders() {
  const { toast } = useToast();
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);

  // Fetch orders
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !isUnauthorizedError(error)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-500 mb-8">Something went wrong. Please try again later.</p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {!(orders as any[])?.length ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/">
              <Button data-testid="button-start-shopping">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {(orders as any[])?.map((order: any) => (
              <Card key={order.id} data-testid={`card-order-${order.orderNumber}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')} • 
                        {order.deliveryType === 'home' ? ' Home Delivery' : ' Store Pickup'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <OrderStatusBadge status={order.status} />
                      <p className="text-lg font-semibold" data-testid={`text-total-${order.orderNumber}`}>
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items ({order.orderItems?.length || 0})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.orderItems?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.product?.name || 'Product'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} • ₹{item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {order.paymentStatus === 'completed' ? (
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            Payment Completed
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                            Payment {order.paymentStatus}
                          </span>
                        )}
                        
                        {order.deliveryAddress && (
                          <span className="flex items-center">
                            <Truck className="h-4 w-4 mr-1" />
                            {order.deliveryType === 'home' ? 'Home Delivery' : 'Store Pickup'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === 'delivered' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setFeedbackOrderId(order.id)}
                                data-testid={`button-feedback-${order.orderNumber}`}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Rate Order
                              </Button>
                            </DialogTrigger>
                            {feedbackOrderId === order.id && (
                              <FeedbackModal 
                                order={order} 
                                onClose={() => setFeedbackOrderId(null)} 
                              />
                            )}
                          </Dialog>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-reorder-${order.orderNumber}`}
                        >
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
