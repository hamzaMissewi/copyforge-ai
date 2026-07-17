"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { generateAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Copy, RefreshCw, TrendingUp, Wand2, Check } from "lucide-react";

const contentTypes = [
  { value: "SOCIAL_MEDIA_POST", label: "Social Media Post", platforms: ["Instagram", "Facebook", "Twitter/X", "TikTok"] },
  { value: "EMAIL_CAMPAIGN", label: "Email Campaign", platforms: ["Email"] },
  { value: "AD_COPY", label: "Ad Copy", platforms: ["Google Ads", "Facebook", "Instagram", "LinkedIn"] },
  { value: "PRODUCT_DESCRIPTION", label: "Product Description", platforms: ["E-commerce", "Amazon", "Shopify"] },
  { value: "BLOG_INTRO", label: "Blog Introduction", platforms: ["Blog", "Medium", "WordPress"] },
  { value: "LANDING_PAGE", label: "Landing Page Copy", platforms: ["Website"] },
  { value: "LINKEDIN_POST", label: "LinkedIn Post", platforms: ["LinkedIn"] },
  { value: "TWEET_THREAD", label: "Tweet / Thread", platforms: ["Twitter/X"] },
  { value: "SMS_MARKETING", label: "SMS Marketing", platforms: ["SMS"] },
  { value: "PUSH_NOTIFICATION", label: "Push Notification", platforms: ["Mobile", "Web"] },
];

const tones = ["Professional", "Casual", "Humorous", "Urgent", "Inspirational", "Friendly", "Bold", "Luxurious", "Playful", "Authoritative"];

function GenerateContent() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [contentType, setContentType] = useState(searchParams.get("type") || "SOCIAL_MEDIA_POST");
  const [platform, setPlatform] = useState(searchParams.get("platform") || "Instagram");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("");
  const [wordLimit, setWordLimit] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [refineLoading, setRefineLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState("");

  const selectedType = contentTypes.find((c) => c.value === contentType);

  useEffect(() => {
    const type = searchParams.get("type");
    const plat = searchParams.get("platform");
    if (type) setContentType(type);
    if (plat) setPlatform(plat);
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await generateAPI.generate({
        contentType,
        platform,
        prompt: prompt.trim(),
        tone: tone || undefined,
        wordLimit: wordLimit ? Number(wordLimit) : undefined,
      });
      setResult(res.data);
      refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.error || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!result?.content || !refineInstruction.trim()) return;
    setRefineLoading(true);
    try {
      const res = await generateAPI.refine(result.content, refineInstruction);
      setResult({ ...result, content: res.data.content });
      setRefineInstruction("");
    } catch {
      alert("Refinement failed");
    } finally {
      setRefineLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Generate Copy</h1>
        <p className="text-gray-400 mt-1">Create high-converting marketing content with AI</p>
      </div>

      {user && user.subscriptionTier === "FREE" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 text-amber-400 text-sm flex items-center gap-2">
          <span>Free plan: {user.generationsLimit - user.generationsUsed} generations remaining this month.</span>
          <a href="/dashboard/pricing" className="underline font-medium ml-auto">Upgrade →</a>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => {
                  setContentType(e.target.value);
                  const t = contentTypes.find((c) => c.value === e.target.value);
                  if (t && !t.platforms.includes(platform)) setPlatform(t.platforms[0]);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                {contentTypes.map((ct) => (
                  <option key={ct.value} value={ct.value}>{ct.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                {selectedType?.platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tone (optional)</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(tone === t ? "" : t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      tone === t
                        ? "bg-violet-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Describe what you want to write about</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                placeholder="e.g., New summer collection sale with 40% off all items, targeting young professionals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Word Limit (optional)</label>
              <input
                type="number"
                value={wordLimit}
                onChange={(e) => setWordLimit(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500"
                placeholder="e.g., 200"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-3">
          {result ? (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                    <span className="font-semibold">Copy Score</span>
                  </div>
                  <span className="text-2xl font-bold text-violet-400">{Math.round(result.score)}/100</span>
                </div>
                <p className="text-gray-400 text-sm">{result.feedback}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Generated Copy
                  </h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg p-5 whitespace-pre-wrap text-gray-200 text-sm leading-relaxed max-h-[500px] overflow-y-auto">
                  {result.content}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{result.wordCount} words</span>
                  <span>{result.characterCount} characters</span>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-3">Refine This Copy</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    placeholder="e.g., Make it more urgent, add emojis, shorter..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500"
                    onKeyDown={(e) => e.key === "Enter" && handleRefine()}
                  />
                  <button
                    onClick={handleRefine}
                    disabled={refineLoading || !refineInstruction.trim()}
                    className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {refineLoading ? "Refining..." : "Refine"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center h-full flex flex-col items-center justify-center">
              <Sparkles className="w-16 h-16 text-gray-800 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Your copy will appear here</h3>
              <p className="text-gray-600 text-sm max-w-sm">
                Fill in the details on the left and click Generate to create high-converting marketing copy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
        <GenerateContent />
      </Suspense>
    </DashboardLayout>
  );
}
