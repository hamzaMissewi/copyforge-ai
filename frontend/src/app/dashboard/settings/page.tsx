"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { userAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [brandVoice, setBrandVoice] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");
  const [brandTargetAudience, setBrandTargetAudience] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userAPI.profile().then((r) => {
      setBrandVoice(r.data.brandVoice || "");
      setBrandIndustry(r.data.brandIndustry || "");
      setBrandTargetAudience(r.data.brandTargetAudience || "");
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await userAPI.updateBrand({ brandVoice, brandIndustry, brandTargetAudience });
      setSaved(true);
      refreshUser();
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Configure your brand voice for better AI-generated copy</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Brand Voice Settings</h2>
          <p className="text-sm text-gray-400">
            These settings help the AI generate copy that matches your brand&apos;s unique voice and style.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand Voice</label>
            <textarea
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="e.g., Professional yet friendly, uses humor, conversational tone, speaks directly to the reader..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Industry</label>
            <input
              type="text"
              value={brandIndustry}
              onChange={(e) => setBrandIndustry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              placeholder="e.g., SaaS, E-commerce, Fitness, Real Estate, Restaurant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Audience</label>
            <textarea
              value={brandTargetAudience}
              onChange={(e) => setBrandTargetAudience(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="e.g., Tech-savvy millennials, 25-40 years old, interested in productivity tools..."
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-violet-400 font-medium">{user?.subscriptionTier}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
