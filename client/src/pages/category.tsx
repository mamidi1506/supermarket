import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ShoppingBasket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Category() {
  const [, params] = useRoute("/category/:slug");
  const { toast } = useToast();

  // Fetch category
  const { data: category, isLoading: categoryLoading, error: categoryError } = useQuery({
    queryKey: ["/api/categories", params!.slug],
    retry: false,
  });

  // Fetch products by category
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch(`/api/products?category=${params!.slug}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
      }
      return response.json();
    },
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (categoryError && isUnauthorizedError(categoryError)) {
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
  }, [categoryError, productsError, toast]);

  if (categoryError && !isUnauthorizedError(categoryError)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
            <p className="text-gray-500 mb-8">The category you're looking for doesn't exist.</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Category Header */}
        {categoryLoading ? (
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : category ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid={`text-category-name`}>
              {(category as any)?.name}
            </h1>
            {(category as any)?.description && (
              <p className="text-gray-600" data-testid="text-category-description">
                {(category as any)?.description}
              </p>
            )}
          </div>
        ) : null}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-full h-32 rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : (products as any[])?.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600" data-testid="text-products-count">
                {(products as any[])?.length || 0} products found
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {(products as any[])?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-8">
              We couldn't find any products in this category. Check back soon!
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        )}
      </div>

      <CartSidebar />
      <Footer />
    </div>
  );
}
