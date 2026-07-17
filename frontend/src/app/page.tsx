"use client";

import Link from "next/link";
import { Zap, PenTool, BarChart3, Clock, Sparkles, ArrowRight, Check } from "lucide-react";

export default function HomePage() {
  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered Copy", desc: "Generate high-converting marketing copy in seconds using Gemini AI" },
    { icon: <PenTool className="w-6 h-6" />, title: "10+ Content Types", desc: "Social media, emails, ads, product descriptions, blog posts, and more" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Copy Scoring", desc: "Get AI-powered scores and suggestions to improve your content" },
    { icon: <Clock className="w-6 h-6" />, title: "Save Hours", desc: "What took hours now takes seconds. Focus on strategy, not writing" },
  ];

  const pricing = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for trying out CopyForge",
      features: ["5 generations/month", "All content types", "Basic templates", "Copy scoring"],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      desc: "For marketers who need unlimited copy",
      features: ["Unlimited generations", "All templates", "Brand voice settings", "Priority support", "Copy refinement", "Export to clipboard"],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Business",
      price: "$49",
      period: "/month",
      desc: "For teams and agencies",
      features: ["Everything in Pro", "Team collaboration", "API access", "Custom templates", "Analytics dashboard", "Dedicated support"],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-violet-500" />
            <span className="text-2xl font-bold">CopyForge<span className="text-violet-500">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="bg-violet-600 hover:bg-violet-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-6">
          Powered by Google Gemini AI
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Write Marketing Copy
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            That Converts
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Generate high-converting social media posts, emails, ads, and product descriptions
          in seconds. Stop staring at blank pages.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-violet-600 hover:bg-violet-700 px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 transition-colors"
          >
            Start Writing Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#pricing"
            className="border border-gray-700 hover:border-gray-500 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-violet-400">50K+</div>
              <div className="text-gray-400 text-sm">Copies Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-400">2.5K+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-400">4.9/5</div>
              <div className="text-gray-400 text-sm">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Everything You Need to Write Better Copy</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors">
              <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center text-violet-400 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 text-center mb-16">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricing.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 ${
                p.popular
                  ? "bg-violet-600/10 border-2 border-violet-500 relative"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{p.price}</span>
                {p.period && <span className="text-gray-400">{p.period}</span>}
              </div>
              <p className="text-gray-400 text-sm mb-6">{p.desc}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  p.popular
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            <span className="font-bold">CopyForge AI</span>
          </div>
          <p className="text-gray-500 text-sm">&copy; 2026 CopyForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
