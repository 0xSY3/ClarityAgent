import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnector } from "../WalletConnector";

interface NavbarProps {
  isScrolled: boolean;
}

export function Navbar({ isScrolled }: NavbarProps) {
  const [internalScrolled, setInternalScrolled] = useState(isScrolled);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isScrolled === undefined) {
      const handleScroll = () => {
        setInternalScrolled(window.scrollY > 20);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isScrolled]);

  const scrollState = isScrolled ?? internalScrolled;

  const navItems = [
    { label: "Contract Analysis", href: "/analysis" },
    { label: "Test Generator", href: "/tests" },
    { label: "AI Assistant", href: "/assistant" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-black/40 backdrop-blur-sm py-3 sm:py-4 border-b border-orange-600/90 z-50 transition-all duration-300 ${
        scrollState ? "bg-black/60" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white">
              Stacks<span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-400 hover:text-orange-400 hover:-translate-y-0.5 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
            <WalletConnector />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <WalletConnector />
            <Button
              variant="ghost"
              size="sm"
              className="p-1 text-gray-400 hover:text-orange-400 focus:ring-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out transform ${
            isMobileMenuOpen
              ? "max-h-[12rem] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          } overflow-hidden`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-orange-600/90 mt-2">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-gray-400 hover:text-orange-400 hover:bg-orange-500/5"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}