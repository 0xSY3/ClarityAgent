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
    <Card className="h-full bg-black/40 border border-orange-800/90 backdrop-blur-sm 
      hover:-translate-y-1 transition-all duration-300 group">
      <CardHeader className="space-y-4 p-6 sm:p-8">
        <CardTitle className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-400/20 to-orange-600/20
            transition-all duration-300 group-hover:from-orange-400/30 group-hover:to-orange-600/30">
            <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-orange-400" />
          </div>
          <span className="font-semibold text-xl sm:text-2xl text-white/90">
            {title}
          </span>
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-white/60">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 pt-0 sm:pt-0">
        <Button className="w-full h-12 text-base bg-orange-600/90 text-white hover:bg-orange-500 border border-orange-500/30 
          shadow-lg shadow-orange-500/20 transition-all duration-300 group-hover:scale-[1.02]">
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
  <div className="px-6 py-7 sm:p-8 rounded-2xl bg-black/40 border border-orange-600/90 backdrop-blur-sm 
    hover:scale-105 transition-all duration-300">
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
        <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />
        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 
          bg-clip-text text-transparent">
          {value}
        </span>
      </div>
      <p className="text-base sm:text-lg text-gray-300 font-medium">{label}</p>
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
    <div className="relative min-h-screen bg-black text-white overflow-hidden bg-[length:30px_30px] bg-[linear-gradient(to_right,rgba(230,126,34,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(230,126,34,0.2)_1px,transparent_1px)]">
      <div className="fixed inset-0 -z-50">
        {/* Background element */}
      </div>
      <Navbar isScrolled={isScrolled} />

      <main className="relative z-10">
        <section className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center">
              <div className="inline-block px-6 py-2 mb-6 rounded-full text-base font-medium 
                bg-orange-500/25 border border-orange-500/20 animate-in fade-in slide-in-from-bottom-3">
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-3 font-bold">
                  AI-Powered Development on Stacks <StacksLogo />
                </span>
              </div>

              <div className="mb-12 sm:mb-16 space-y-6 sm:space-y-8">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
                  Build Smarter
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent animate-text">
                    With AI on Stacks
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl max-w-3xl mx-auto text-gray-400">
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

        <section id="features" className="py-16 sm:py-24 border-y border-orange-500/10">
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