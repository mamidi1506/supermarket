import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: string;
    originalPrice?: string;
    weight?: string;
    unit?: string;
    imageUrl?: string;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/cart", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setAddedToCart(true);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
      
      // Reset the added state after 2 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
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
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const increaseQuantity = () => {
    if (product.stock && quantity >= product.stock) return;
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 border hover:border-primary-200 overflow-hidden animate-fade-in"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <ShoppingCart className="h-16 w-16 text-gray-300" />
          )}
        </div>

        {/* Discount Badge */}
        {discountPercentage && discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-green-500 text-white">
            {discountPercentage}% OFF
          </Badge>
        )}

        {/* Stock Badge */}
        {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
            Only {product.stock} left
          </Badge>
        )}

        {product.stock === 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name */}
          <h4 className="font-semibold text-gray-900 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h4>

          {/* Weight/Unit */}
          {product.weight && (
            <p className="text-sm text-gray-500" data-testid={`text-product-weight-${product.id}`}>
              {product.weight}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900" data-testid={`text-product-price-${product.id}`}>
                ₹{price}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-500 line-through" data-testid={`text-product-original-price-${product.id}`}>
                  ₹{originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
                data-testid={`button-decrease-${product.id}`}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${product.id}`}>
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseQuantity}
                disabled={product.stock ? quantity >= product.stock : false}
                className="h-8 w-8 p-0"
                data-testid={`button-increase-${product.id}`}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || product.stock === 0 || addedToCart}
              className={`text-sm px-4 py-2 transition-colors ${
                addedToCart 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
