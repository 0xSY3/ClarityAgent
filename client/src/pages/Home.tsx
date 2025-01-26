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
  <img src="https://cdn.prod.website-files.com/618b0aafa4afde9048fe3926/65db8991bb7418d436a096d4_Group%206014%20(7)-p-500.png" alt="Stacks Logo" className="w-7 h-7" />
);

const FeatureCard = ({ href, icon: Icon, title, description, buttonText }: FeatureCardProps) => (
  <Link href={href}>
    <Card className="h-full bg-black/40 border border-orange-800/90 backdrop-blur-sm 
      hover:-translate-y-1 transition-all duration-300 group">
      <CardHeader className="space-y-3 p-4 sm:p-6">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-orange-400/20 to-orange-600/20
            transition-all duration-300 group-hover:from-orange-400/30 group-hover:to-orange-600/30">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
          </div>
          <span className="font-semibold text-base sm:text-lg text-white/90">
            {title}
          </span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-white/60">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <Button className="w-full bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/30 
          shadow-lg shadow-orange-500/20 transition-all duration-300 group-hover:scale-[1.02]">
          <span className="mr-2">{buttonText}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
  <div className="px-4 py-5 sm:p-6 rounded-2xl bg-black/40 border border-orange-600/90 backdrop-blur-sm 
    hover:scale-105 transition-all duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 
          bg-clip-text text-transparent">
          {value}
        </span>
      </div>
      <p className="text-sm sm:text-base text-gray-300 font-medium">{label}</p>
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
    <div className="relative min-h-screen bg-black text-white overflow-hidden bg-[length:20px_20px] bg-[linear-gradient(to_right,rgba(230,126,34,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,126,34,0.2)_1px,transparent_1px)]">
      <div className="fixed inset-0 -z-50">
      </div>
      <Navbar isScrolled={isScrolled} />

      <main className="relative z-10">
        <section className="pt-24 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center">
              <div className="inline-block px-4 py-1 mb-4 rounded-full text-sm font-medium 
                bg-orange-500/25 border border-orange-500/20 animate-in fade-in slide-in-from-bottom-3">
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-2 font-bold">
                  AI-Powered Development on Stacks <StacksLogo />
                </span>
              </div>

              <div className="mb-8 sm:mb-10 space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight px-4">
                  Build Smarter
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent animate-text">
                    With AI on Stacks
                  </span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto text-gray-400 px-4">
                  Intelligent tools for building and analyzing secure smart contracts on the Stacks blockchain
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6 px-4">
                <StatCard value="Automated" label="Testing Tools" icon={Shield} />
                <StatCard value="AI" label="Contract Analysis" icon={Brain} />
                <StatCard value="Instant" label="Deployment" icon={Zap} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-20 border-y border-orange-500/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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