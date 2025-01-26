import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WalletConnector } from "@/components/WalletConnector";
import { Menu, X } from "lucide-react";
import { navItems } from "../config/nav";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const activeLink = pathname;
  
  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                ClarityAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={`transition-all duration-200 hover:scale-[1.02] 
                    ${activeLink === href
                      ? "text-orange-400 bg-orange-500/20 border border-orange-500/30"
                      : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                    }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
            <WalletConnector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-orange-400"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out
          ${isOpen
            ? "translate-y-0 opacity-100 visible"
            : "translate-y-[-100%] opacity-0 invisible"
          }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border-t border-orange-500/30 shadow-lg">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                className={`w-full justify-start transition-all duration-200 text-sm hover:scale-[1.02] 
                  ${activeLink === href
                    ? "text-orange-400 bg-orange-500/20 border border-orange-500/30"
                    : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
                  }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{label}</span>
              </Button>
            </Link>
          ))}
          <div className="pt-2 pb-1">
            <WalletConnector />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;