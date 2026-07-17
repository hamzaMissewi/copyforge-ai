"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out CopyForge",
    features: [
      "5 generations per month",
      "All 10 content types",
      "AI copy scoring",
      "Basic templates",
      "Copy to clipboard",
    ],
    tier: "FREE",
    cta: "Current Plan",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For marketers who need unlimited copy",
    features: [
      "Unlimited generations",
      "All content types",
      "All templates",
      "Brand voice customization",
      "AI copy refinement",
      "Priority generation speed",
      "Bookmark & organize",
      "Email support",
    ],
    tier: "PRO",
    cta: "Upgrade to Pro",
    popular: true,
    stripePriceId: "price_pro_monthly",
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 5)",
      "API access",
      "Custom templates",
      "Analytics dashboard",
      "White-label export",
      "Dedicated support",
      "Custom integrations",
    ],
    tier: "BUSINESS",
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">Upgrade Your Plan</h1>
          <p className="text-gray-400">Generate unlimited marketing copy with Pro</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 ${
                plan.popular
                  ? "bg-violet-600/10 border-2 border-violet-500 relative"
                  : "bg-gray-900 border border-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="mb-3">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-400 text-sm"> {plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              {user?.subscriptionTier === plan.tier ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-medium bg-gray-800 text-gray-500 cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              ) : plan.tier === "BUSINESS" ? (
                <a
                  href="mailto:sales@copyforge.ai"
                  className="block text-center py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  {plan.cta}
                </a>
              ) : (
                <button className="w-full py-3 rounded-lg font-medium bg-violet-600 hover:bg-violet-700 transition-colors text-white">
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400 text-sm">
            All paid plans come with a 7-day free trial. Cancel anytime.
            <br />
            Stripe integration ready — connect your Stripe keys to start accepting payments.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
