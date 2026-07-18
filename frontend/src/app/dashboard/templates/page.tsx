"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { templateAPI } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import type { Template } from "@/lib/types";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("All");
  const { addToast } = useToast();

  useEffect(() => {
    templateAPI.getAll()
      .then((r) => setTemplates(r.data))
      .catch(() => addToast("Failed to load templates", "error"));
  }, [addToast]);

  const categories = ["All", ...new Set(templates.map((t) => t.category).filter(Boolean))];
  const filtered = category === "All" ? templates : templates.filter((t) => t.category === category);

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Templates</h1>
        <p className="text-gray-400 mb-6">Pre-built prompts for specific content types and platforms</p>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-violet-600 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <div key={template.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-400" />
                </div>
                {template.isPremium && (
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md">PRO</span>
                )}
              </div>
              <h3 className="font-semibold mb-1">{template.name}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{template.contentType?.replace(/_/g, " ")}</span>
                <span>·</span>
                <span>{template.platform}</span>
              </div>
              {template.exampleOutput && (
                <p className="text-xs text-gray-400 line-clamp-3 mb-4 bg-gray-800/50 rounded-lg p-3">
                  {template.exampleOutput}
                </p>
              )}
              <Link
                href={`/dashboard/generate?type=${template.contentType}&platform=${template.platform}`}
                className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Use Template <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
