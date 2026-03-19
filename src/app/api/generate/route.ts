import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const { niche, voice, platform } = await req.json();

    if (!niche || !voice || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfigured — missing API key" },
        { status: 500 }
      );
    }

    const platformLimits: Record<string, string> = {
      TikTok: "15-60 seconds, vertical 9:16, captions important",
      "Instagram Reels": "15-90 seconds, vertical 9:16, cover image matters",
      "YouTube Shorts": "up to 60 seconds, vertical 9:16, title/description SEO important",
    };

    const prompt = `You are an expert short-form video content strategist. Generate a 7-day content calendar for the following:

Niche: ${niche}
Brand Voice: ${voice}
Platform: ${platform} (${platformLimits[platform] || "short-form vertical video"})

For each day (Monday through Sunday), provide:
- day: the day name
- hook: a compelling first-3-seconds hook (text the creator says/shows immediately)
- script: a full script with timestamps like [0:00], [0:05], etc. Include visual directions in brackets like [show product], [cut to b-roll]. Keep it concise for short-form.
- format: one of "Talking Head", "B-Roll Montage", "Text Overlay", "Duet/Stitch", "Green Screen", "Trending Audio", "POV", "Tutorial"
- hashtags: array of 5-8 relevant hashtags (no # symbol)
- bestTime: recommended posting time with timezone (e.g. "7:00 AM EST")
- estimatedLength: video duration (e.g. "30 seconds")
- trendTip: a brief tip about current trends relevant to this content

Respond ONLY with a valid JSON array of 7 objects. No markdown, no explanation, just the JSON array.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a JSON-only response bot. Always respond with valid JSON arrays. No markdown fences, no explanations.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    // Extract JSON from possible markdown fences
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let plan: DayPlan[];
    try {
      plan = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", jsonStr.slice(0, 500));
      return NextResponse.json(
        { error: "AI returned invalid format — try again" },
        { status: 502 }
      );
    }

    if (!Array.isArray(plan) || plan.length < 7) {
      return NextResponse.json(
        { error: "AI returned incomplete plan — try again" },
        { status: 502 }
      );
    }

    return NextResponse.json({ plan: plan.slice(0, 7) });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
