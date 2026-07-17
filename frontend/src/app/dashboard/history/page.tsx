"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateAPI } from "@/lib/api";
import { Clock, Bookmark, Copy, Check, Trash2, Filter } from "lucide-react";

const typeLabels: Record<string, string> = {
  SOCIAL_MEDIA_POST: "Social Media",
  EMAIL_CAMPAIGN: "Email",
  AD_COPY: "Ad Copy",
  PRODUCT_DESCRIPTION: "Product Desc",
  BLOG_INTRO: "Blog Intro",
  LANDING_PAGE: "Landing Page",
  LINKEDIN_POST: "LinkedIn",
  TWEET_THREAD: "Tweet/Thread",
  SMS_MARKETING: "SMS",
  PUSH_NOTIFICATION: "Push",
};

export default function HistoryPage() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tab, setTab] = useState<"all" | "bookmarks">("all");

  const fetchGenerations = async () => {
    try {
      const res = tab === "bookmarks"
        ? await generateAPI.bookmarks(page)
        : await generateAPI.history(page, 10, filter || undefined);
      setGenerations(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {}
  };

  useEffect(() => { fetchGenerations(); }, [page, filter, tab]);

  const copyContent = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleBookmark = async (id: number) => {
    await generateAPI.toggleBookmark(id);
    fetchGenerations();
  };

  const deleteGeneration = async (id: number) => {
    if (confirm("Delete this generation?")) {
      await generateAPI.delete(id);
      fetchGenerations();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Generation History</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
            {(["all", "bookmarks"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(0); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t === "all" ? "All" : "Bookmarks"}
              </button>
            ))}
          </div>

          {tab === "all" && (
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
            >
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </div>

        {generations.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No generations found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generations.map((gen: any) => (
              <div key={gen.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-violet-500/10 text-violet-400 text-xs font-medium px-2.5 py-1 rounded-md">
                        {typeLabels[gen.contentType] || gen.contentType}
                      </span>
                      <span className="text-gray-600 text-xs">{gen.platform}</span>
                      {gen.score && (
                        <span className="text-xs font-mono text-violet-400">{Math.round(gen.score)}/100</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">{gen.prompt}</p>
                    <p className="text-xs text-gray-500">{new Date(gen.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyContent(gen.generatedContent, gen.id)}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      {copiedId === gen.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleBookmark(gen.id)}
                      className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${
                        gen.bookmarked ? "text-amber-400" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={gen.bookmarked ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => deleteGeneration(gen.id)}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Show content</summary>
                  <div className="mt-2 bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {gen.generatedContent}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-gray-800 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
