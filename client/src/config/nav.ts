import { 
    Home,
    BarChart2,
    Settings,
    Wallet,
    type LucideIcon 
  } from "lucide-react";
  
  interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
  }
  
  export const navItems: NavItem[] = [
    {
      href: "/",
      label: "Home",
      icon: Home
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: BarChart2
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings
    }
  ];