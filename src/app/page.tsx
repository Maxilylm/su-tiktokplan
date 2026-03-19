"use client";

import { useState, useRef } from "react";

interface DayPlan {
  day: string;
  hook: string;
  script: string;
  format: string;
  hashtags: string[];
  bestTime: string;
  estimatedLength: string;
  trendTip: string;
}

const VOICE_OPTIONS = [
  "Fun & Casual",
  "Educational",
  "Inspirational",
  "Edgy/Bold",
  "Minimalist",
];

const PLATFORM_OPTIONS = ["TikTok", "Instagram Reels", "YouTube Shorts"];

const NICHE_SUGGESTIONS = [
  "fitness",
  "tech",
  "cooking",
  "fashion",
  "finance",
  "travel",
  "comedy",
  "beauty",
  "gaming",
  "parenting",
];

const FORMAT_COLORS: Record<string, string> = {
  "Talking Head": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "B-Roll Montage": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Text Overlay": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Duet/Stitch": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  "Green Screen": "bg-green-500/20 text-green-300 border-green-500/30",
  "Trending Audio": "bg-red-500/20 text-red-300 border-red-500/30",
  POV: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Tutorial: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const DAY_GRADIENTS = [
  "from-pink-500 to-rose-600",
  "from-purple-500 to-violet-600",
  "from-cyan-500 to-teal-600",
  "from-yellow-500 to-amber-600",
  "from-green-500 to-emerald-600",
  "from-blue-500 to-indigo-600",
  "from-red-500 to-pink-600",
];

export default function Home() {
  const [niche, setNiche] = useState("");
  const [voice, setVoice] = useState("Fun & Casual");
  const [platform, setPlatform] = useState("TikTok");
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [teleprompter, setTeleprompter] = useState(false);
  const [copied, setCopied] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (!niche.trim()) {
      setError("Drop your niche first!");
      return;
    }
    setError("");
    setLoading(true);
    setPlan(null);
    setExpandedDay(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), voice, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyWeekPlan() {
    if (!plan) return;
    const md = plan
      .map(
        (d) =>
          `## ${d.day}\n**Hook:** ${d.hook}\n**Format:** ${d.format} | **Length:** ${d.estimatedLength} | **Post at:** ${d.bestTime}\n\n**Script:**\n${d.script}\n\n**Hashtags:** ${d.hashtags.map((h) => `#${h}`).join(" ")}\n\n**Trend Tip:** ${d.trendTip}`
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(`# 7-Day ${platform} Content Plan: ${niche}\nVoice: ${voice}\n\n${md}`);
    setCopied("week");
    setTimeout(() => setCopied(""), 2000);
  }

  function copyDayScript(idx: number) {
    if (!plan) return;
    const d = plan[idx];
    const text = `${d.day} — ${d.hook}\n\n${d.script}\n\nHashtags: ${d.hashtags.map((h) => `#${h}`).join(" ")}\nPost at: ${d.bestTime}`;
    navigator.clipboard.writeText(text);
    setCopied(`day-${idx}`);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 animate-gradient opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,45,85,0.3),transparent_50%),radial-gradient(circle_at_70%_50%,rgba(0,242,234,0.3),transparent_50%)]" />
        <div className="relative z-10 px-4 py-8 sm:py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">🎬</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              Content<span className="text-cyan-300">Drop</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white/80 font-medium max-w-xl mx-auto">
            AI-powered 7-day content calendar for short-form video creators
          </p>
        </div>
      </header>

      {/* INPUT SECTION */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] p-6 space-y-6">
          {/* Niche Input */}
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wider">
              Your Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder='e.g. "fitness for busy moms", "tech reviews", "cooking shortcuts"'
              className="w-full px-4 py-3 rounded-xl bg-[#0f0f23] border border-[#2a2a4a] text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-lg"
            />
            {/* Niche suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {NICHE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setNiche(s)}
                  className="px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/25 hover:border-purple-400/40 transition-all cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-sm font-semibold text-pink-300 mb-2 uppercase tracking-wider">
              Brand Voice
            </label>
            <div className="flex flex-wrap gap-2">
              {VOICE_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    voice === v
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg shadow-pink-500/20"
                      : "bg-[#0f0f23] text-gray-300 border-[#2a2a4a] hover:border-pink-500/40"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Toggle */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2 uppercase tracking-wider">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    platform === p
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-lg shadow-cyan-500/20"
                      : "bg-[#0f0f23] text-gray-300 border-[#2a2a4a] hover:border-cyan-500/40"
                  }`}
                >
                  {p === "TikTok" ? "🎵 " : p === "Instagram Reels" ? "📸 " : "▶️ "}
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white font-bold text-lg tracking-wide shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer animate-gradient bg-[length:200%_100%]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating your fire content...
              </span>
            ) : (
              "Generate 7-Day Plan 🔥"
            )}
          </button>

          {error && (
            <div className="text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* CALENDAR GRID */}
        {plan && (
          <div className="space-y-6 float-in">
            {/* Header row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Your 7-Day Content Plan
              </h2>
              <button
                onClick={copyWeekPlan}
                className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all text-sm font-medium cursor-pointer"
              >
                {copied === "week" ? "Copied! ✅" : "📋 Copy Full Week Plan"}
              </button>
            </div>

            {/* Day cards row */}
            <div
              ref={calendarRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
            >
              {plan.map((day, i) => (
                <div
                  key={i}
                  onClick={() =>
                    setExpandedDay(expandedDay === i ? null : i)
                  }
                  className={`flex-shrink-0 w-44 sm:w-48 rounded-2xl border cursor-pointer transition-all duration-300 snap-start ${
                    expandedDay === i
                      ? "border-pink-500 shadow-lg shadow-pink-500/20 scale-[1.02]"
                      : "border-[#2a2a4a] hover:border-purple-500/50 hover:shadow-md hover:shadow-purple-500/10"
                  } bg-[#1a1a2e] overflow-hidden`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Day header */}
                  <div
                    className={`bg-gradient-to-r ${DAY_GRADIENTS[i]} px-4 py-2.5`}
                  >
                    <div className="text-white font-bold text-sm tracking-wide">
                      {day.day}
                    </div>
                    <div className="text-white/70 text-xs">
                      {day.estimatedLength}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <p className="text-white font-semibold text-sm leading-snug line-clamp-3">
                      &ldquo;{day.hook}&rdquo;
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${
                        FORMAT_COLORS[day.format] ||
                        "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }`}
                    >
                      {day.format}
                    </span>
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      🕐 {day.bestTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded day detail */}
            {expandedDay !== null && plan[expandedDay] && (
              <ExpandedCard
                day={plan[expandedDay]}
                index={expandedDay}
                teleprompter={teleprompter}
                setTeleprompter={setTeleprompter}
                onCopy={() => copyDayScript(expandedDay)}
                copied={copied === `day-${expandedDay}`}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm">
        Built with AI — ContentDrop by{" "}
        <a
          href="https://github.com/maxilylm"
          className="text-purple-400 hover:text-pink-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          @maxilylm
        </a>
      </footer>
    </div>
  );
}

function ExpandedCard({
  day,
  index,
  teleprompter,
  setTeleprompter,
  onCopy,
  copied,
}: {
  day: DayPlan;
  index: number;
  teleprompter: boolean;
  setTeleprompter: (v: boolean) => void;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div
      className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] overflow-hidden float-in"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Detail header */}
      <div
        className={`bg-gradient-to-r ${DAY_GRADIENTS[index]} px-6 py-4 flex items-center justify-between flex-wrap gap-2`}
      >
        <div>
          <h3 className="text-xl font-bold text-white">{day.day}</h3>
          <p className="text-white/80 text-sm">
            {day.format} &bull; {day.estimatedLength} &bull; Post at{" "}
            {day.bestTime}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTeleprompter(!teleprompter);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              teleprompter
                ? "bg-white text-black"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {teleprompter ? "📺 Teleprompter ON" : "📺 Teleprompter"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
          >
            {copied ? "Copied! ✅" : "📋 Copy Script"}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Hook */}
        <div>
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">
            Hook (First 3 Seconds)
          </div>
          <p className="text-white text-xl font-bold leading-relaxed">
            &ldquo;{day.hook}&rdquo;
          </p>
        </div>

        {/* Script */}
        <div>
          <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
            Full Script
          </div>
          {teleprompter ? (
            <div className="bg-black rounded-xl p-8 max-h-96 overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent z-10" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent z-10" />
              <div
                className="teleprompter-scroll text-center"
                style={{
                  "--scroll-duration": "30s",
                } as React.CSSProperties}
              >
                <p className="text-white text-3xl sm:text-4xl font-bold leading-relaxed whitespace-pre-wrap">
                  {day.script}
                </p>
                <div className="h-96" />
              </div>
            </div>
          ) : (
            <div className="bg-[#0f0f23] rounded-xl p-4 border border-[#2a2a4a]">
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {day.script}
              </p>
            </div>
          )}
        </div>

        {/* Hashtags */}
        <div>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            Hashtags
          </div>
          <div className="flex flex-wrap gap-2">
            {day.hashtags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full text-sm bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Trend Tip */}
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-4">
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-1">
            Trend Tip
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {day.trendTip}
          </p>
        </div>
      </div>
    </div>
  );
}
