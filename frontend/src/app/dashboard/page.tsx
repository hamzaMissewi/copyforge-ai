"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { userAPI, generateAPI } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { Sparkles, TrendingUp, Clock, Bookmark } from "lucide-react";
import type { DashboardStats, Generation } from "@/lib/types";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          userAPI.dashboard().catch(() => null),
          generateAPI.recent().catch(() => null),
        ]);
        if (statsRes) setStats(statsRes.data);
        if (recentRes) setRecent(recentRes.data);
      } catch {
        addToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    refreshUser();
  }, [addToast, refreshUser]);

  const quickActions = [
    { label: "Social Media Post", type: "SOCIAL_MEDIA_POST", platform: "Instagram", icon: "📱", color: "from-pink-500 to-rose-500" },
    { label: "Email Campaign", type: "EMAIL_CAMPAIGN", platform: "Email", icon: "📧", color: "from-blue-500 to-cyan-500" },
    { label: "Ad Copy", type: "AD_COPY", platform: "Facebook", icon: "📢", color: "from-orange-500 to-amber-500" },
    { label: "Product Description", type: "PRODUCT_DESCRIPTION", platform: "E-commerce", icon: "🛒", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Here&apos;s your CopyForge overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Generations Used", value: stats?.generationsThisMonth || 0, icon: <Sparkles className="w-5 h-5" />, color: "text-violet-400" },
            { label: "Credits Remaining", value: stats?.generationsRemaining === -1 ? "Unlimited" : (stats?.generationsRemaining || 0), icon: <Clock className="w-5 h-5" />, color: "text-green-400" },
            { label: "Avg. Score", value: stats?.averageScore ? Math.round(stats.averageScore) : "—", icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-400" },
            { label: "Plan", value: user?.subscriptionTier || "FREE", icon: <Bookmark className="w-5 h-5" />, color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{s.label}</span>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold">{loading ? "—" : s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Generate */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Generate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={`/dashboard/generate?type=${action.type}&platform=${action.platform}`}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold group-hover:text-violet-400 transition-colors">{action.label}</h3>
                <p className="text-gray-500 text-sm mt-1">{action.platform}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Generations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Generations</h2>
            <Link href="/dashboard/history" className="text-violet-400 hover:text-violet-300 text-sm">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No generations yet. Start creating!</p>
              <Link
                href="/dashboard/generate"
                className="inline-block mt-4 bg-violet-600 hover:bg-violet-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Generate Your First Copy
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((gen) => (
                <div key={gen.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-sm font-bold">
                      {gen.contentType?.charAt(0) || "G"}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-md">{gen.prompt || "Generated content"}</p>
                      <p className="text-xs text-gray-500">{gen.platform} · {new Date(gen.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {gen.score && (
                      <span className="text-sm font-mono text-violet-400">{Math.round(gen.score)}/100</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
