import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useCart } from "@/hooks/useCart";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";
import CheckoutModal from "@/components/CheckoutModal";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Clock, ShoppingBasket, Shield, Star } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const { isCartOpen, closeCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  // Fetch featured products
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Fetch cart items for checkout
  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
    retry: false,
  });

  // Calculate total for checkout
  const cartData = (cartItems as any[]) || [];
  const totalAmount = cartData.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  // Handle unauthorized errors
  useEffect(() => {
    if (categoriesError && isUnauthorizedError(categoriesError)) {
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

    if (productsError && isUnauthorizedError(productsError)) {
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
  }, [categoriesError, productsError, toast]);

  const handleCheckoutFromCart = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Fresh Groceries Delivered in 15 Minutes</h2>
              <p className="text-xl mb-6 text-primary-50">
                Order from thousands of products and get doorstep delivery
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-white text-primary-600 hover:bg-gray-100"
                  data-testid="button-shop-now"
                >
                  Shop Now
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                  data-testid="button-download-app"
                >
                  Download App
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-full h-80 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ShoppingBasket className="h-32 w-32 text-white/30" />
                </div>
                <div className="absolute -top-4 -right-4 bg-secondary-500 text-white px-4 py-2 rounded-lg font-semibold">
                  Free Delivery!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h3>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="w-full h-20 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))}
            </div>
          ) : (categories as any[])?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {(categories as any[]).slice(0, 5).map((category: any) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card 
                    className="p-6 hover:shadow-md transition-shadow cursor-pointer border hover:border-primary-200"
                    data-testid={`card-category-${category.slug}`}
                  >
                    <CardContent className="p-0">
                      <div className="w-full h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBasket className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.description || 'Fresh & Organic'}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Trending Products</h3>
            <Link href="/category/all">
              <Button 
                variant="ghost" 
                className="text-primary-600 hover:text-primary-700"
                data-testid="button-view-all"
              >
                View All
              </Button>
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="w-full h-32 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : (products as any[])?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(products as any[]).slice(0, 10).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose FreshMart */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Choose FreshMart?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-full h-48 bg-white rounded-xl mb-4 flex items-center justify-center">
                <Clock className="h-16 w-16 text-primary-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">15-Minute Delivery</h4>
              <p className="text-gray-600">Ultra-fast delivery to your doorstep with our hyperlocal network</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-48 bg-white rounded-xl mb-4 flex items-center justify-center">
                <Star className="h-16 w-16 text-secondary-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fresh Quality</h4>
              <p className="text-gray-600">Hand-picked fresh products with quality guarantee</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-48 bg-white rounded-xl mb-4 flex items-center justify-center">
                <Shield className="h-16 w-16 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-gray-600">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </div>
      </section>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={closeCart}
        onCheckout={handleCheckoutFromCart}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartData}
        totalAmount={totalAmount}
      />
      
      <Footer />
    </div>
  );
}
