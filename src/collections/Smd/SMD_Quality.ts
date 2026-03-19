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
};
const calculateTotalScore = (data: Record<string, any>): number => {
  let totalScore = 0;

  const questionScores: QuestionScores = {
    Q1: 3,
    Q2: 3,
    Q3: 3,
    Q4: 3,
    Q5: 2,
    Q6: 2,
    Q7: 1,
    Q8: 1,
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

  console.log("Total Score:", totalScore);

  let trigger = "";
  let reasonForScore = "";

  if (totalScore > 3) {
    trigger = "high";
    reasonForScore =
      "The total score is high because many questions were answered with 'yes'.";
  } else {
    trigger = "low";
    reasonForScore =
      "The total score is low because few or no questions were answered with 'yes'.";
  }

  console.log("Trigger:", trigger);
  console.log("Reason for Score:", reasonForScore);

  const newData: ModifiedData = {
    ...data,
    Trigger: trigger,
    reasonForScore: reasonForScore,
  };

  console.log("New Data:", newData);

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

export const SMDQualityQuestions: CollectionConfig = {
  slug: "SMD_Quality_Inspection",
  labels: {
    singular: "SMD Quality Inspection",
    plural: "SMD Quality Inspections",
  },
  admin: {
    hidden: ({ user }) => user.role !== "operator",
    useAsTitle: "SMD Inspection",
    description: "SMD Quality Inspection",
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
    create: ({ req: { user } }) => user.role === "operator", // ict create access to superadmin
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
      relationTo: "smd_line_name",
      required: true,
      hasMany: true,
    },

    {
      name: "Q1",
      label: "Will we have NPI, trials or new materials?",
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
      label: "Do we have a machine ramp up?",
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
      label: "Did we have Change Over?", // required
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

      label: "Did we have quality incidents on the previous shift?", // required
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
        "Did any raw material have a confirmed quality issue or is critical to quality?", // required
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

      label: "Did we have preventive maintenance on the previous shift?", // required
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

      label: "Do we have new employee?", // required
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

      label: "Do we have any test-station problem?", // required
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
