import { User } from "payload/dist/auth";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

/* -------------------------------------------------------------------------- */
/*                               Helper types                                 */
/* -------------------------------------------------------------------------- */

type QuestionScores = {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  Q5: number;
  Q6: number;
  Q7: number;
  Q8: number;
  Q9: number;
  Q10: number;
  Q11: number;
  Q12: number;
  Q13: number;
  Q14: number;
  Q15: number;
  Q16: number;
  Q17: number;
  Q18: number;
};

interface ModifiedData {
  Trigger: string;
  reasonForScore?: string;
}

/* -------------------------------------------------------------------------- */
/*                         Optional total-score helper                        */
/* -------------------------------------------------------------------------- */

const calculateTotalScore = (data: Record<string, any>): number => {
  let totalScore = 0;

  const questionScores: QuestionScores = {
    Q1: 2,
    Q2: 2,
    Q3: 7,
    Q4: 2,
    Q5: 4,
    Q6: 4,
    Q7: 7,
    Q8: 2,
    Q9: 7,
    Q10: 7,
    Q11: 4,
    Q12: 7,
    Q13: 7,
    Q14: 7,
    Q15: 7,
    Q16: 7,
    Q17: 4,
    Q18: 4,
  };

  Object.keys(data).forEach((questionKey) => {
    const q = questionKey as keyof QuestionScores;
    if (data[q] === "yes" && questionScores[q]) {
      totalScore += questionScores[q];
    }
  });

  return totalScore;
};

/* -------------------------------------------------------------------------- */
/*                            Access & hook helpers                           */
/* -------------------------------------------------------------------------- */

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;
    if (!user) return false;
    if (user.role === "admin") return true;

    return {
      country: {
        equals: req.user.country,
      },
    };
  };

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

const addFactory: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, factory_name: user?.factory_name };
};

/* -------------------------------------------------------------------------- */
/*                     Trigger logic – Q8 “yes” → high only                  */
/* -------------------------------------------------------------------------- */

const addTriggerAndUser: BeforeChangeHook = ({ data }) => {
  // still compute the total score for reference/logging
  const totalScore = calculateTotalScore(data);
  const q8Answer = data.Q8 as string | undefined;

  const trigger = q8Answer === "yes" ? "high" : "low";
  const reasonForScore =
    q8Answer === "yes"
      ? "Question 8 was answered with 'yes', automatically triggering HIGH."
      : `Question 8 was answered with 'no', so trigger is LOW (total score = ${totalScore}).`;

  const newData: ModifiedData = {
    ...data,
    Trigger: trigger,
    reasonForScore,
  };

  return newData;
};

const addUserToData: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return user ? { ...data, user: user.id } : data;
};

/* -------------------------------------------------------------------------- */
/*                               Collection                                   */
/* -------------------------------------------------------------------------- */

export const SmdQuestions: CollectionConfig = {
  slug: "SmdQuestions",
  admin: {
    hidden: ({ user }) => user.role !== "operator",
    useAsTitle: "SmdQuestions",
    description: "SMD Inspection",
  },
  hooks: {
    beforeChange: [addUser, addFactory, addTriggerAndUser, addUserToData],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;
      if (!req.user || !referer?.includes("smd")) return true;
      return await isAdminOrHasAccessToImages()({ req });
    },
    update: ({ req: { user } }) => user.role === "operator",
    delete: ({ req: { user } }) => user.role === "operator",
    create: ({ req: { user } }) => user.role === "operator",
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
      relationTo: "smd_line_name",
      required: true,
      hasMany: true,
    },
    /* ----------------------------- Questions Q1-Q18 ----------------------------- */
    {
      name: "Q1",
      label: "Team Staffing < Standard (Get staff to fill the crew)",
      required: true,
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q2",
      required: true,
      label:
        "Personnel less than 6 weeks of machine operation after formal induction training.",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q3",
      required: true,
      label: "Preventive Maintenance (CO, NPI, CPT and High level leadership tour)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q4",
      required: true,
      label:
        "Preventive Maintenance (Cordon the area, Apply LOTO only experienced personnel on the line)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q5",
      required: true,
      label:
        "Start up from down day. (Complete a Written Risk Prediction on start-up activities)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q6",
      required: true,
      label:
        "Corrective Maintenance (Apply plant standards and procedures …)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q7",
      required: true,
      label:
        "Obstruction on shop-floor gang-way (excess pallets or machinery on gangway)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q8",
      required: true,
      label:
        "Machine running with broken/missing guard or malfunctioning interlock",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q9",
      required: true,
      label: "Open electric cabinets",
      type: "radio",
      options: [
        { label: "No", value: "no" },
        { label: "Yes", value: "yes" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q10",
      required: true,
      label: "Serious Injury on the site",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q11",
      required: true,
      label: "1 First aid or more in the last 7 days",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q12",
      required: true,
      label: "Confined space, Work at height",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q13",
      required: true,
      label:
        "Steam leakages, Water leakage and Hot surface work",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q14",
      required: true,
      label: "High Temperature / Humidity",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q15",
      required: true,
      label: "Construction Activity",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q16",
      required: true,
      label: "High level cleaning",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q17",
      required: true,
      label: "FLT (Proper use of horn …)",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    {
      name: "Q18",
      required: true,
      label:
        "CO, NPI, CPT and High level leadership tour",
      type: "radio",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      defaultValue: "yes",
      admin: { layout: "horizontal" },
    },
    /* ------------------------------- Results -------------------------------- */
    {
      name: "Trigger",
      type: "text",
      label: "Trigger",
      admin: {
        condition: (data) => !!data.Trigger,
      },
    },
    {
      name: "reasonForScore",
      type: "text",
      label: "Enter reason for this score",
      admin: {
        condition: (data) => data.Trigger === "high",
      },
    },
  ],
};
