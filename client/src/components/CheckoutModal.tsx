import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Home, Store, CreditCard, Smartphone, Banknote, X } from "lucide-react";
import { useLocation } from "wouter";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  totalAmount: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
}: CheckoutModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      onClose();
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be delivered soon.",
      });
      navigate("/orders");
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
      // For this implementation, we'll handle Cash on Delivery
      // In a real app, you'd integrate with payment gateway for card/UPI
      const orderData = {
        totalAmount: finalAmount,
        discountAmount,
        deliveryType,
        paymentMethod,
        deliveryAddress: deliveryType === "home" ? 
          `${address.street}, ${address.city}, ${address.pinCode}` : 
          null,
        couponCode: appliedCoupon?.code || null,
        paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
        items: cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      createOrderMutation.mutate(orderData);
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Checkout</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-checkout">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Options */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Delivery Option
              </h4>
              <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors">
                    <RadioGroupItem value="home" className="sr-only" />
                    <div className="text-center">
                      <Home className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                      <div className="font-medium">Home Delivery</div>
                      <div className="text-sm text-gray-500">15-30 mins • FREE</div>
                    </div>
                  </label>
                  <label className="border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors">
                    <RadioGroupItem value="pickup" className="sr-only" />
                    <div className="text-center">
                      <Store className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="font-medium">Store Pickup</div>
                      <div className="text-sm text-gray-500">Ready in 10 mins</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {deliveryType === "home" && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-4">Delivery Address</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="street">Street Address *</Label>
                    <Textarea
                      id="street"
                      placeholder="Enter your complete address"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                      data-testid="input-street-checkout"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                        data-testid="input-city-checkout"
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
                        data-testid="input-pincode-checkout"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-primary-500">
                    <RadioGroupItem value="card" />
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-primary-500">
                    <RadioGroupItem value="upi" />
                    <Smartphone className="h-5 w-5 text-gray-600" />
                    <span>UPI Payment</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-primary-500">
                    <RadioGroupItem value="cod" />
                    <Banknote className="h-5 w-5 text-gray-600" />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4">Apply Coupon</h4>
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
                    data-testid="button-remove-coupon-checkout"
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
                    data-testid="input-coupon-checkout"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={validateCouponMutation.isPending || !couponCode.trim()}
                    data-testid="button-apply-coupon-checkout"
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

          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span data-testid="text-subtotal-checkout">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600" data-testid="text-delivery-checkout">FREE</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="text-green-600" data-testid="text-discount-checkout">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total Amount</span>
                  <span data-testid="text-total-checkout">₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg"
            disabled={processing || createOrderMutation.isPending}
            data-testid="button-place-order-checkout"
          >
            {processing || createOrderMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            Place Order - ₹{finalAmount.toFixed(2)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
