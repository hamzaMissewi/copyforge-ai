"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Zap, CreditCard } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (typeof window !== "undefined" && !localStorage.getItem("token")) {
    router.push("/auth/login");
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/generate", label: "Generate", icon: "✨" },
    { href: "/dashboard/templates", label: "Templates", icon: "📋" },
    { href: "/dashboard/history", label: "History", icon: "🕐" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
    { href: "/dashboard/pricing", label: "Pricing", icon: "💳" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-violet-500" />
            <span className="text-xl font-bold">CopyForge</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Credits</span>
              <span className="text-violet-400 font-semibold">
                {user ? `${user.generationsUsed}/${user.generationsLimit}` : "0/5"}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all"
                style={{
                  width: user
                    ? `${Math.min((user.generationsUsed / user.generationsLimit) * 100, 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm text-gray-300 truncate max-w-[120px]">{user?.name}</span>
            </div>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
