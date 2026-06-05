import type { Access, CollectionBeforeChangeHook, CollectionConfig } from "payload";
import type { User } from "@/payload-types";

/* -------------------------------------------------------------------------- */
/*  HIGH-risk rules: if a question is answered with its triggerValue → HIGH   */
/* -------------------------------------------------------------------------- */

const HIGH_RISK_RULES: Record<string, string> = {
  Q3:  "no",  // Not everyone wearing proper PPE
  Q4:  "yes", // Safety procedures/guards bypassed
  Q5:  "no",  // Lighting inadequate for safe work
  Q6:  "yes", // Poor ventilation, dust, or fumes present
  Q8:  "yes", // Exposed/untidy electrical cables
  Q9:  "yes", // Sockets overloaded or damaged
  Q10: "yes", // Extension cords unmanaged across walkways
  Q11: "yes", // Machine with missing/broken guard or faulty interlock
  Q12: "yes", // Clutter, oil, or debris on floor
  Q14: "no",  // Materials stored unsafely / blocking fire exits
  Q15: "no",  // Pallets/goods stacked unsafely or leaning
  Q16: "yes", // Preventive maintenance currently ongoing
  Q17: "no",  // Area not cordoned or LOTO not applied during maintenance
  Q18: "no",  // Maintenance procedures/safety protocols not followed
  Q19: "yes", // Ongoing CO/NPI activity
  Q28: "no",  // Fire extinguishers/exits not accessible or clearly marked
};

const HIGH_RISK_DESCRIPTIONS: Record<string, string> = {
  Q3:  "PPE not being worn properly by all staff (ear plugs, boots, etc.)",
  Q4:  "Safety procedures or guards have been bypassed",
  Q5:  "Lighting is inadequate for safe work",
  Q6:  "Poor ventilation, dust, or fumes present in the area",
  Q8:  "Exposed or untidy electrical cables present",
  Q9:  "Sockets are overloaded or damaged",
  Q10: "Extension cords unmanaged across walkways or work areas",
  Q11: "Machine with missing/broken guard or faulty interlock running",
  Q12: "Clutter, oil, or debris found on the floor",
  Q14: "Materials stored unsafely or blocking fire exits",
  Q15: "Pallets or goods stacked unsafely or leaning",
  Q16: "Preventive maintenance is currently ongoing without sufficient isolation",
  Q17: "Area not cordoned or LOTO not applied by trained staff during maintenance",
  Q18: "Maintenance procedures and safety protocols not being followed",
  Q19: "Ongoing CO/NPI activity in the area",
  Q28: "Fire extinguishers or exits not accessible or not clearly marked",
};

/* -------------------------------------------------------------------------- */
/*  Non-high rules: each triggered item adds 2 pts toward medium/low score    */
/* -------------------------------------------------------------------------- */

const NON_HIGH_RISK_RULES: Record<string, string> = {
  Q1:  "yes", // Team staffing below required standard
  Q2:  "yes", // Staff with <6 weeks machine operation experience
  Q7:  "yes", // Temperature/humidity too high
  Q13: "yes", // Obstructions in walkways/gangways
  Q20: "no",  // Written Risk Prediction NOT done before restart
  Q21: "yes", // Serious injury this or last shift
  Q22: "yes", // First aid case in last 7 days
  Q23: "yes", // Work at height ongoing
  Q24: "yes", // Construction/modification work near line
  Q25: "yes", // High-level cleaning in progress
  Q26: "yes", // Water leaks or exposed hot surfaces
};

/* -------------------------------------------------------------------------- */
/*                           Access & hook helpers                            */
/* -------------------------------------------------------------------------- */

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;
    if (!user) return false;
    if (user.role === "superadmin") return true;
    return { country: { equals: user.country } };
  };

const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

const addFactory: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, factory_name: user?.factory_name };
};

/* -------------------------------------------------------------------------- */
/*                          Main trigger hook                                 */
/* -------------------------------------------------------------------------- */

const addTriggerAndUser: CollectionBeforeChangeHook = ({ data }) => {
  const triggeredHighRisks: string[] = [];
  for (const [q, triggerValue] of Object.entries(HIGH_RISK_RULES)) {
    if (data[q] === triggerValue) {
      triggeredHighRisks.push(HIGH_RISK_DESCRIPTIONS[q]);
    }
  }

  let nonHighScore = 0;
  for (const [q, riskValue] of Object.entries(NON_HIGH_RISK_RULES)) {
    if (data[q] === riskValue) {
      nonHighScore += 2;
    }
  }

  let trigger: string;
  let reasonForScore: string;

  if (triggeredHighRisks.length > 0) {
    trigger = "high";
    reasonForScore = triggeredHighRisks.join("; ");
  } else if (nonHighScore >= 4) {
    trigger = "medium";
    reasonForScore = `Medium risk detected — score ${nonHighScore} points from general safety observations`;
  } else {
    trigger = "low";
    reasonForScore = "No critical safety issues detected during this inspection";
  }

  return { ...data, Trigger: trigger, reasonForScore };
};

const addUserToData: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return user ? { ...data, user: user.id } : data;
};

/* -------------------------------------------------------------------------- */
/*                              Collection                                    */
/* -------------------------------------------------------------------------- */

export const ENGQuestions: CollectionConfig = {
  slug: "ENGQuestions",
  admin: {
    hidden: ({ user }) => user?.role !== "operator",
    useAsTitle: "Trigger",
    description: "ENG Safety Inspection",
  },
  hooks: {
    beforeChange: [addUser, addFactory, addTriggerAndUser, addUserToData],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;
      if (!req.user || !referer?.includes("sell")) return true;
      return await isAdminOrHasAccessToImages()({ req });
    },
    update: ({ req: { user } }) => user?.role === "operator",
    delete: ({ req: { user } }) => user?.role === "operator",
    create: ({ req: { user } }) => user?.role === "operator",
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: true,
      admin: { condition: () => false },
    },
    {
      name: "Line",
      type: "relationship",
      relationTo: "eng_lines",
      required: true,
      hasMany: true,
    },

    /* ── Team Staffing & Competence ── */
    {
      name: "Q1",
      label: "Team Staffing & Competence: Is current team staffing below required standard?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q2",
      label: "Any staff with less than 6 weeks machine operation experience post-induction?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Behavioral & PPE Compliance ── */
    {
      name: "Q3",
      label: "⚠ Behavioral & PPE Compliance: Is everyone wearing proper PPE (ear plugs, boots, etc.)? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q4",
      label: "⚠ Has anyone bypassed safety procedures/guards? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Environmental & Ergonomic Concerns ── */
    {
      name: "Q5",
      label: "⚠ Environmental & Ergonomic: Is lighting adequate for safe work? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q6",
      label: "⚠ Any poor ventilation, dust, or fumes present? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Temperature / Humidity ── */
    {
      name: "Q7",
      label: "Temperature / Humidity: Is temperature/humidity too high?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Electrical Risks & Machine Safety ── */
    {
      name: "Q8",
      label: "⚠ Electrical Risks & Machine Safety: Any exposed/untidy electrical cables? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q9",
      label: "⚠ Are sockets overloaded or damaged? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q10",
      label: "⚠ Are extension cords unmanaged across walkways/work areas? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q11",
      label: "⚠ Any machine with missing/broken guard or faulty interlock? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Housekeeping Hazards ── */
    {
      name: "Q12",
      label: "⚠ Housekeeping Hazards: Any clutter, oil, or debris on the floor? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Movement Hazards ── */
    {
      name: "Q13",
      label: "Movement Hazards: Any obstructions (pallets, tools, equipment) in walkways/gangways?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q14",
      label: "⚠ Are materials stored safely (not blocking fire exits)? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q15",
      label: "⚠ Are pallets/goods stacked safely (not leaning)? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },

    /* ── Maintenance ── */
    {
      name: "Q16",
      label: "⚠ Maintenance: Is preventive maintenance currently ongoing? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q17",
      label: "⚠ If maintenance ongoing — is area cordoned and LOTO applied by trained staff? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q18",
      label: "⚠ During maintenance — are procedures and safety protocols being followed? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q19",
      label: "⚠ Is there an ongoing CO/NPI activity? [Yes = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Restart Procedures ── */
    {
      name: "Q20",
      label: "Restart Procedures: After shutdown, was a Written Risk Prediction completed before restart?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },

    /* ── Health & Injury Incidents ── */
    {
      name: "Q21",
      label: "Health & Injury: Any serious injury this or last shift?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q22",
      label: "Any first aid case in the last 7 days on this line/area?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── High-Risk Work Activities ── */
    {
      name: "Q23",
      label: "High-Risk Work: Any work at height currently ongoing?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q24",
      label: "Any construction or modification work ongoing near this line?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q25",
      label: "Is high-level cleaning currently in progress?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Leaks and Surface Hazards ── */
    {
      name: "Q26",
      label: "Leaks & Surface Hazards: Any water leaks or exposed hot surfaces?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Leadership Presence ── */
    {
      name: "Q27",
      label: "Leadership Presence: Is a leadership tour currently ongoing?",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "no",
      admin: { layout: "horizontal" },
    },

    /* ── Emergency Preparedness ── */
    {
      name: "Q28",
      label: "⚠ Emergency Preparedness: Are fire extinguishers and exits accessible and clearly marked? [No = HIGH RISK]",
      required: true,
      type: "radio",
      options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },

    /* ── Results ── */
    {
      name: "Trigger",
      type: "text",
      label: "Trigger",
      admin: { condition: (data) => !!data.Trigger },
    },
    {
      name: "reasonForScore",
      type: "textarea",
      label: "System Risk Reason",
      admin: { condition: () => false },
    },
    {
      name: "inspectorNote",
      type: "textarea",
      label: "Inspector's Notes (Optional) — Describe any additional context for this risk level",
      admin: { condition: (data) => !!data.Trigger },
    },
  ],
};
