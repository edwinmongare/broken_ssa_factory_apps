"use client";

import { useEffect, useState } from "react";

interface Inspection {
  Trigger?: string;
  updatedAt?: string;
  user?: { email: string }[];
  reasonForScore?: string;
  inspectorNote?: string;
}

const formatCreatedAt = (createdAt?: string): string => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function Page() {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchLatest = async () => {
      try {
        const res = await fetch(
          "/api/ProcessingLineInspections?limit=1&sort=-updatedAt&depth=1",
          { cache: "no-store" }
        );
        const data = await res.json();
        if (active) {
          setInspection((data?.docs?.[0] as Inspection) ?? null);
          setLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching inspection:", error);
        if (active) setLoaded(true);
      }
    };

    fetchLatest();
    const intervalId = setInterval(fetchLatest, 5000); // real-time: refresh every 5s

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const trigger = inspection?.Trigger ?? "unknown";
  const capitalised = trigger.charAt(0).toUpperCase() + trigger.slice(1);

  let bgColor: string;
  let accentColor: string;
  let icon: string;
  let panelTitle: string;

  switch (trigger) {
    case "low":
      bgColor = "bg-gradient-to-b from-green-500 to-green-900";
      accentColor = "border-green-300/40 bg-green-900/40";
      icon = "✅";
      panelTitle = "All Clear — No Critical Issues Found";
      break;
    case "medium":
      bgColor = "bg-gradient-to-b from-yellow-400 to-yellow-700";
      accentColor = "border-yellow-300/40 bg-yellow-900/40";
      icon = "⚡";
      panelTitle = "Medium Risk — Observations Noted";
      break;
    case "high":
      bgColor = "bg-gradient-to-b from-red-500 to-red-900";
      accentColor = "border-red-300/40 bg-red-900/40";
      icon = "🚨";
      panelTitle = "High Risk Factors Identified";
      break;
    default:
      bgColor = "bg-gradient-to-b from-gray-600 to-gray-900";
      accentColor = "border-gray-300/40 bg-gray-900/40";
      icon = "❓";
      panelTitle = loaded ? "No Inspection Recorded Yet" : "Loading…";
  }

  const reasons =
    trigger === "high" && inspection?.reasonForScore
      ? inspection.reasonForScore.split("; ").filter(Boolean)
      : null;

  return (
    <div className={`${bgColor} min-h-screen flex flex-col`}>
      <div className="p-8 pb-4">
        <p className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-1">
          Safety Inspection
        </p>
        <h1 className="text-5xl font-extrabold text-white">Processing Line</h1>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 px-8 gap-8">
        <div className="text-center">
          <div className="text-8xl font-extrabold text-white drop-shadow-2xl tracking-tight">
            {capitalised} Risk
          </div>
          <div className="mt-2 text-white/70 text-2xl font-medium">
            Safety Trigger Level
          </div>
        </div>

        {inspection?.reasonForScore && (
          <div
            className={`w-full max-w-4xl rounded-2xl border backdrop-blur-sm ${accentColor} overflow-hidden shadow-2xl`}
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
              <span className="text-3xl">{icon}</span>
              <h2 className="text-xl font-bold text-white">{panelTitle}</h2>
            </div>

            <div className="px-6 py-5">
              {reasons ? (
                <ul className="space-y-3">
                  {reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-red-300 text-lg leading-none">▶</span>
                      <span className="text-white text-lg leading-snug">{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white text-lg leading-relaxed">
                  {inspection.reasonForScore}
                </p>
              )}
            </div>

            {inspection.inspectorNote && (
              <div className="px-6 py-4 border-t border-white/10 bg-black/20">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-semibold">
                  Inspector&apos;s Note
                </p>
                <p className="text-white text-lg italic leading-relaxed">
                  &ldquo;{inspection.inspectorNote}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-8 pt-4">
        <div className="flex flex-col items-start gap-1">
          <p className="text-white/60 text-lg font-medium">
            {inspection
              ? formatCreatedAt(inspection.updatedAt)
              : loaded
                ? "No inspection recorded yet"
                : ""}
          </p>
          {inspection?.user?.[0]?.email && (
            <p className="text-white text-3xl font-semibold">
              By: {inspection.user[0].email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
