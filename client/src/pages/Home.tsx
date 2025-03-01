import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, BarChart2, FileCode, Shield, TestTubeIcon, Brain, Zap, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

import { Navbar } from "@/components/ui/navbar";

interface FeatureCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
}

const StacksLogo = () => (
  <img src="https://cdn.prod.website-files.com/618b0aafa4afde9048fe3926/65db8991bb7418d436a096d4_Group%206014%20(7)-p-500.png" alt="Stacks Logo" className="w-8 h-8" />
);

const FeatureCard = ({ href, icon: Icon, title, description, buttonText }: FeatureCardProps) => (
  <Link href={href}>
    <Card className="h-full bg-gradient-to-br from-gray-50 to-gray-100 border border-orange-200/80 shadow-lg
      hover:-translate-y-1 transition-all duration-300 group rounded-xl">
      <CardHeader className="space-y-4 p-6 sm:p-8">
        <CardTitle className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-100
            transition-all duration-300 group-hover:from-orange-100 group-hover:to-amber-200 shadow-sm">
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-orange-500" />
          </div>
          <span className="font-semibold text-xl sm:text-2xl text-gray-800">
            {title}
          </span>
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0">
        <Button className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 
          shadow-md transition-all duration-300 group-hover:scale-[1.02] rounded-lg">
          <span className="mr-3">{buttonText}</span>
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  </Link>
);

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ElementType;
}

const StatCard = ({ value, label, icon: Icon }: StatCardProps) => (
  <div className="px-6 py-7 sm:p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-orange-200/80 shadow-lg
    hover:scale-105 transition-all duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 
          bg-clip-text text-transparent">
          {value}
        </span>
      </div>
      <p className="text-base sm:text-lg text-gray-700 font-medium">{label}</p>
    </div>
  </div>
);

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      href: "/contract-builder",
      icon: Code2,
      title: "Contract Builder",
      description: "AI-driven development and analysis tools for Stacks smart contracts",
      buttonText: "Get Started"
    },
    {
      href: "/decoder",
      icon: Code2,
      title: "Contract Decoder",
      description: "Comprehensive analysis and understanding of Stacks contracts",
      buttonText: "Decode Contract"
    },
    {
      href: "/auditor",
      icon: ShieldCheck,
      title: "Auditor Agent",
      description: "AI-powered security analysis and vulnerability detection for Clarity contracts",
      buttonText: "Audit Contract"
    },
    {
      href: "/explorer",
      icon: BarChart2,
      title: "Contract Explorer",
      description: "Interactive analysis of deployed Stacks contracts",
      buttonText: "Explore Contracts"
    },
    {
      href: "/test-suite",
      icon: TestTubeIcon,
      title: "Contract Tester",
      description: "Automated test generation for Stacks contracts",
      buttonText: "Generate Tests"
    },
    {
      href: "/assistant",
      icon: Brain,
      title: "Stacks AI Assistant",
      description: "Real-time assistance for Stacks contract development",
      buttonText: "Chat Now"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 overflow-hidden">
      <div className="fixed inset-0 -z-50 opacity-30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZWRkIj48ZyBmaWxsPSIjZWU3NzM2IiBmaWxsLW9wYWNpdHk9IjAuMSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnptLTE4IDE4di02aC02djZoNnptMCAwaDZ2LTZoLTZ2NnoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-repeat"></div>
      </div>
      
      <Navbar isScrolled={isScrolled} />

      <main className="relative z-10">
        <section className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center">
              <div className="inline-block px-6 py-2 mb-6 rounded-full text-base font-medium 
                bg-gradient-to-r from-orange-100/80 to-amber-100/80 border border-orange-200/50 shadow-md animate-in fade-in slide-in-from-bottom-3">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent flex items-center gap-3 font-bold">
                  AI-Powered Development on Stacks <StacksLogo />
                </span>
              </div>

              <div className="mb-12 sm:mb-16 space-y-6 sm:space-y-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight text-gray-800">
                  Build Smarter
                  <br />
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent animate-text">
                    With AI on Stacks
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto text-gray-600">
                  Intelligent tools for building and analyzing secure smart contracts on the Stacks blockchain
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-10">
                <StatCard value="Automated" label="Testing Tools" icon={Shield} />
                <StatCard value="AI" label="Contract Analysis" icon={Brain} />
                <StatCard value="Instant" label="Deployment" icon={Zap} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-24 border-y border-orange-200/30 bg-gradient-to-b from-gray-100/50 to-gray-200/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}