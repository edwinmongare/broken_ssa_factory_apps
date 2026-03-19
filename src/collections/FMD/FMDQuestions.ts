import { User } from "payload/dist/auth";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";

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
    const question = questionKey as keyof QuestionScores; // Asserting as keyof QuestionScores

    if (data[questionKey] === "yes" && questionScores[question]) {
      totalScore += questionScores[question];
    }
  });

  return totalScore;
};

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
  return { ...data, user: user?.factory_name };
};

interface ModifiedData {
  Trigger: string;
  reasonForScore?: string; // Make reasonForScore optional
}

const addTriggerAndUser: BeforeChangeHook = ({ data }) => {
  const totalScore = calculateTotalScore(data);

  let trigger = "";
  let reasonForScore = "";

  if (totalScore > 7) {
    trigger = "high";
    reasonForScore =
      "The total score is high because many questions were answered with 'yes'.";
  } else if (totalScore >= 4 && totalScore <= 6) {
    trigger = "medium";
    reasonForScore =
      "The total score is medium because some questions were answered with 'yes'.";
  } else {
    trigger = "low";
    reasonForScore =
      "The total score is low because few or no questions were answered with 'yes'.";
  }

  const newData: ModifiedData = {
    ...data,
    Trigger: trigger,
    reasonForScore: reasonForScore,
  };

  return newData;
};
const addUserToData: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  if (user) {
    // Add user ID to the data being changed
    return { ...data, user: user.id };
  }
  // If no user is authenticated, return the data unchanged
  return data;
};

export const FMDQuestions: CollectionConfig = {
  slug: "FMDQuestions",
  admin: {
    hidden: ({ user }) => user.role !== "operator",
    useAsTitle: "FMDQuestions",
    description: "FMD Inspection",
  },
  hooks: {
    beforeChange: [addUser, addFactory, addTriggerAndUser, addUserToData],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;

      if (!req.user || !referer?.includes("sell")) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    //read: ({ req: { user } }) => user.role === "clerk", // Restrict create access to superadmin
    update: ({ req: { user } }) => user.role === "operator", // Restrict create access to superadmin
    delete: ({ req: { user } }) => user.role === "operator", // Restrict create access to superadmin
    create: ({ req: { user } }) => user.role === "operator", //  Restrict create access to superadmin
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: true,
      admin: {
        condition: () => false,
      },
    },
    {
      name: "Line",
      type: "relationship",
      relationTo: "FMD_Lines",
      required: true,
      hasMany: true,
    },

    {
      name: "Q1",
      label: "Team Staffing < Standard (Get staff to fill the crew)",
      required: true,
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q2",
      required: true,
      label:
        "Personnel less than 6 weeks of machine operation after formal induction training. (Remove personnel from the machine until ensure that it is accompanied by a tutor)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q3",
      required: true,
      label:
        "Preventive Maintenance (CO, NPI, CPT and High level leadership tour)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q4",
      required: true,

      label:
        "Preventive Maintenance (Cordon the area, Apply LOTO only experienced personnel on the line)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q5",
      required: true,

      label:
        "Start up from down day. (Complete a Written Risk Prediction on start- up activities)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q6",
      required: true,

      label:
        "Corrective Maintenance (Apply plant standards and procedures Don’t attempt to run the machine, escalate to Team leader or Line lead and complete QRP on tasks)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q7",
      required: true,

      label:
        "Obstruction on shop-floor gang-way (excess pallets or machinery on gangway) (Supervisor should complete a Quick Risk Prediction on the potential risk inherent in the blockage and communicate to his or her team.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q8",
      required: true,

      label:
        "Machine running with broken/missing guard or mal functioning interlock (Apply plant standards and procedures Stop machine, escalate to Line lead and complete the risk elimination guide)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q9",
      required: true,

      label:
        "Open electric cabinets (Apply plant standards and procedures Close electrical cabinets and escalate to Line lead or team leader.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "No",
          value: "no",
        },
        {
          label: "Yes",
          value: "yes",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q10",
      required: true,

      label:
        "Serious Injury on the site (Immediately escalate to LM or EHS, Evacuate personnel to clinic, carry out RCA before resuming work)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q11",
      required: true,

      label:
        "1 First aid or more in the last 7 days (Ensure effective communication to all modules, implement containment and correction actions)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q12",
      required: true,

      label:
        "Confined space, Work at height (Apply plant standards and procedures, also apply permit to work.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q13",
      required: true,

      label:
        "Steam leakages, Water leakage and Hot surface work (Are there steam leakages? Are there water leakages? Is there hot work going on in the area? Apply plant standards and procedures, cordon off the area, apply permit to work.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q14",
      required: true,

      label:
        "High Temperature / Humidity (Ensure temperature and  and conduct QRP.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q15",
      required: true,

      label:
        "Construction Activity (Cordon off the area, apply for permit to work.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q16",
      required: true,

      label:
        "High level cleaning (Cordon off the area, apply for permit to work.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Q17",
      required: true,

      label: "FLT (Proper use of horn, apply plant standards and procedures.)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },

    {
      name: "Q18",
      required: true,

      label:
        "CO, NPI, CPT and High level leadership tour (CO, NPI, CPT and High level leadership tour Cordon the area and complete QRP on tasks)", // required
      type: "radio", // required
      options: [
        // required
        {
          label: "Yes",
          value: "yes",
        },
        {
          label: "No",
          value: "no",
        },
      ],
      defaultValue: "yes", // The first value in options.
      admin: {
        layout: "horizontal",
      },
    },
    {
      name: "Trigger",
      type: "text",
      label: "Trigger",
      admin: {
        condition: (data) => {
          const trigger = data.Trigger;
          return trigger;
        },
      },
    },
    {
      name: "reasonForScore",
      type: "text",
      label: "Enter reason for this score",
      admin: {
        condition: (data) => {
          const trigger = data.Trigger || "low";
          return trigger === "medium" || trigger === "high";
        },
      },
    },
  ],
};
