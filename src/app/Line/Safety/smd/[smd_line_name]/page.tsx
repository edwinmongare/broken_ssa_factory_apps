import { getPayloadClient } from "@/get-payload";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    smd_line_name: string;
  };
}

interface Product {
  Trigger: string;
  updatedAt?: string;
  user?: { email: string }[];
  reasonForScore?: string;
  inspectorNote?: string;
}

const Page = async ({ params }: PageProps) => {
  const { smd_line_name } = params;
  const decodedLineName = decodeURIComponent(smd_line_name);

  const payload = await getPayloadClient();

  const { docs: products } = await payload.find({
    collection: "SmdQuestions",
    limit: 1,
    where: {
      "Line.smd_line_name": {
        equals: decodedLineName,
      },
    },
  });

  const product: Product | undefined = products[0] as unknown as Product;
  if (!product) return notFound();

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

  const trigger = product?.Trigger ?? "unknown";
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
      panelTitle = "Risk Classification";
  }

  const reasons =
    trigger === "high" && product.reasonForScore
      ? product.reasonForScore.split("; ").filter(Boolean)
      : null;

  return (
    <div className={`${bgColor} min-h-screen flex flex-col`}>
      {/* Header — Line Name */}
      <div className="p-8 pb-4">
        <p className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-1">
          SMD Safety Inspection
        </p>
        <h1 className="text-5xl font-extrabold text-white">{decodedLineName}</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 px-8 gap-8">
        {/* Trigger Badge */}
        <div className="text-center">
          <div className="text-8xl font-extrabold text-white drop-shadow-2xl tracking-tight">
            {capitalised} Risk
          </div>
          <div className="mt-2 text-white/70 text-2xl font-medium">
            Safety Trigger Level
          </div>
        </div>

        {/* Reason Panel */}
        {product.reasonForScore && (
          <div
            className={`w-full max-w-4xl rounded-2xl border backdrop-blur-sm ${accentColor} overflow-hidden shadow-2xl`}
          >
            {/* Panel Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
              <span className="text-3xl">{icon}</span>
              <h2 className="text-xl font-bold text-white">{panelTitle}</h2>
            </div>

            {/* Panel Body */}
            <div className="px-6 py-5">
              {reasons ? (
                /* HIGH: bullet list of each triggered issue */
                <ul className="space-y-3">
                  {reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 text-red-300 text-lg leading-none">▶</span>
                      <span className="text-white text-lg leading-snug">{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                /* MEDIUM / LOW: single summary line */
                <p className="text-white text-lg leading-relaxed">
                  {product.reasonForScore}
                </p>
              )}
            </div>

            {/* Inspector Note (if provided) */}
            {product.inspectorNote && (
              <div className="px-6 py-4 border-t border-white/10 bg-black/20">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-semibold">
                  Inspector&apos;s Note
                </p>
                <p className="text-white text-lg italic leading-relaxed">
                  &ldquo;{product.inspectorNote}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — Date & Inspector */}
      <div className="p-8 pt-4">
        <div className="flex flex-col items-start gap-1">
          <p className="text-white/60 text-lg font-medium">
            {formatCreatedAt(product.updatedAt)}
          </p>
          <p className="text-white text-3xl font-semibold">
            By: {product.user?.[0]?.email ?? "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
