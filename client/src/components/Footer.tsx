import { ShoppingBasket, Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <ShoppingBasket className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-bold">FreshMart</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Fresh groceries delivered to your doorstep in 15 minutes
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/category/vegetables">
                  <a className="hover:text-white transition-colors">Vegetables</a>
                </Link>
              </li>
              <li>
                <Link href="/category/fruits">
                  <a className="hover:text-white transition-colors">Fruits</a>
                </Link>
              </li>
              <li>
                <Link href="/category/dairy">
                  <a className="hover:text-white transition-colors">Dairy</a>
                </Link>
              </li>
              <li>
                <Link href="/category/snacks">
                  <a className="hover:text-white transition-colors">Snacks</a>
                </Link>
              </li>
              <li>
                <Link href="/category/beverages">
                  <a className="hover:text-white transition-colors">Beverages</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="font-semibold mb-4">Download App</h4>
            <div className="space-y-3">
              <a
                href="#"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-3"
                data-testid="link-play-store"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">GP</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="block bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg p-3"
                data-testid="link-app-store"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">AS</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FreshMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
