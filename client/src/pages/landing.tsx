import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBasket, Truck, Clock, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShoppingBasket className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">FreshMart</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-primary-500 hover:bg-primary-600"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Fresh Groceries Delivered in{" "}
              <span className="text-primary-600">15 Minutes</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Order from thousands of fresh products and get doorstep delivery at lightning speed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-primary-500 hover:bg-primary-600 text-lg px-8 py-6"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-primary-200 text-primary-600 hover:bg-primary-50"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose FreshMart?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to bringing you the freshest groceries with unmatched convenience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-primary-100 hover:border-primary-200 transition-colors">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-primary-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">15-Minute Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Ultra-fast delivery to your doorstep with our hyperlocal network
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-primary-100 hover:border-primary-200 transition-colors">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBasket className="h-8 w-8 text-secondary-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Fresh Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Hand-picked fresh products with quality guarantee and farm-to-door freshness
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-primary-100 hover:border-primary-200 transition-colors">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Round-the-clock customer support for all your grocery needs
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Fresh Grocery Delivery?
          </h3>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FreshMart for their daily grocery needs
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-6"
            data-testid="button-join-now"
          >
            Join FreshMart Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <ShoppingBasket className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">FreshMart</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 FreshMart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
