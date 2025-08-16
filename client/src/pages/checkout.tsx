import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, Home, Store, CreditCard, Smartphone, Banknote } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ cartItems, totalAmount, onOrderSuccess }: {
  cartItems: any[];
  totalAmount: number;
  onOrderSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [deliveryType, setDeliveryType] = useState("home");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    pinCode: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/coupons/validate", {
        code,
        orderAmount: totalAmount,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setDiscountAmount(data.discountAmount);
      setAppliedCoupon(data.coupon);
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${data.discountAmount}`,
      });
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
        title: "Invalid Coupon",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOrderSuccess();
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
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCouponMutation.mutate(couponCode.trim());
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setAppliedCoupon(null);
  };

  const finalAmount = totalAmount - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (paymentMethod === "cod") {
        // Handle Cash on Delivery
        const orderData = {
          totalAmount: finalAmount,
          discountAmount,
          deliveryType,
          paymentMethod,
          deliveryAddress: deliveryType === "home" ? 
            `${address.street}, ${address.city}, ${address.pinCode}` : 
            null,
          couponCode: appliedCoupon?.code || null,
          paymentStatus: "pending",
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        };

        createOrderMutation.mutate(orderData);
      } else {
        // Handle Card/UPI payments with Stripe
        if (!stripe || !elements) {
          setProcessing(false);
          return;
        }

        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/orders`,
          },
          redirect: "if_required",
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Payment succeeded, create order
          const orderData = {
            totalAmount: finalAmount,
            discountAmount,
            deliveryType,
            paymentMethod,
            deliveryAddress: deliveryType === "home" ? 
              `${address.street}, ${address.city}, ${address.pinCode}` : 
              null,
            couponCode: appliedCoupon?.code || null,
            paymentStatus: "completed",
            items: cartItems.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          };

          createOrderMutation.mutate(orderData);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Delivery Option
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary-200">
              <RadioGroupItem value="home" id="home" />
              <label htmlFor="home" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Home className="h-5 w-5 text-primary-500" />
                  <div>
                    <div className="font-medium">Home Delivery</div>
                    <div className="text-sm text-gray-500">15-30 mins • FREE</div>
                  </div>
                </div>
              </label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-primary-200">
              <RadioGroupItem value="pickup" id="pickup" />
              <label htmlFor="pickup" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Store className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Store Pickup</div>
                    <div className="text-sm text-gray-500">Ready in 10 mins</div>
                  </div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      {deliveryType === "home" && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Textarea
                id="street"
                placeholder="Enter your complete address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                required
                data-testid="input-street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  required
                  data-testid="input-city"
                />
              </div>
              <div>
                <Label htmlFor="pinCode">PIN Code *</Label>
                <Input
                  id="pinCode"
                  placeholder="PIN Code"
                  value={address.pinCode}
                  onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                  required
                  data-testid="input-pincode"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle>Apply Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium text-green-800">
                  {appliedCoupon.code} Applied!
                </div>
                <div className="text-sm text-green-600">
                  You saved ₹{discountAmount}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeCoupon}
                data-testid="button-remove-coupon"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                data-testid="input-coupon"
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={validateCouponMutation.isPending || !couponCode.trim()}
                data-testid="button-apply-coupon"
              >
                {validateCouponMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <label htmlFor="card" className="flex items-center space-x-3 cursor-pointer">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span>Credit/Debit Card</span>
              </label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="upi" id="upi" />
              <label htmlFor="upi" className="flex items-center space-x-3 cursor-pointer">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <span>UPI Payment</span>
              </label>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <RadioGroupItem value="cod" id="cod" />
              <label htmlFor="cod" className="flex items-center space-x-3 cursor-pointer">
                <Banknote className="h-5 w-5 text-gray-600" />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </RadioGroup>

          {(paymentMethod === "card" || paymentMethod === "upi") && (
            <div className="mt-4">
              <PaymentElement />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.length} items)</span>
              <span data-testid="text-subtotal">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="text-green-600" data-testid="text-delivery">FREE</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600" data-testid="text-discount">-₹{discountAmount}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total Amount</span>
              <span data-testid="text-total">₹{finalAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        type="submit"
        className="w-full bg-primary-500 hover:bg-primary-600 text-lg py-6"
        disabled={processing || createOrderMutation.isPending}
        data-testid="button-place-order"
      >
        {processing || createOrderMutation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : null}
        Place Order - ₹{finalAmount}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");

  // Fetch cart items
  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ["/api/cart"],
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

  // Calculate total
  const totalAmount = cartItems ? cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0) : 0;

  // Create payment intent for card payments
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: totalAmount 
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating payment intent:", error);
        });
    }
  }, [cartItems, totalAmount]);

  const handleOrderSuccess = () => {
    toast({
      title: "Order Placed Successfully!",
      description: "Your order has been placed and will be delivered soon.",
    });
    navigate("/orders");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some products to your cart before checkout</p>
            <Button onClick={() => navigate("/")} data-testid="button-shop-now">
              Shop Now
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Setting up checkout...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm 
            cartItems={cartItems}
            totalAmount={totalAmount}
            onOrderSuccess={handleOrderSuccess}
          />
        </Elements>
      </div>

      <Footer />
    </div>
  );
}
