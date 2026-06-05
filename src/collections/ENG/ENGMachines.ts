import type { Access, CollectionBeforeChangeHook, CollectionConfig } from "payload";
import type { User } from "@/payload-types";

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) return false;
    if (user.role === "superadmin") return true;

    return {
      user: {
        equals: user.id,
      },
    };
  };

const addUser: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};
const addFactory: CollectionBeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.factory_name };
};
export const ENGlINES: CollectionConfig = {
  slug: "eng_lines",
  admin: {
    useAsTitle: "eng_lines",
    description: "lines in Engineering",
    hidden: ({ user }) => user?.role !== "superadmin" && user?.role !== "clerk",
  },

  hooks: {
    beforeChange: [addUser, addFactory],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.get("referer");

      if (!req.user || !referer?.includes("sell")) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    update: ({ req: { user } }) =>
      user?.role === "superadmin" || user?.role === "clerk", // Restrict create access to superadmin
    delete: ({ req: { user } }) =>
      user?.role === "superadmin" || user?.role === "clerk", // Restrict create access to superadmin
    // Restrict create access to superadmin
    create: ({ req: { user } }) =>
      user?.role === "superadmin" || user?.role === "clerk", // Restrict create access to superadmin
  },
  fields: [
    {
      label: "Engineering Lines",
      name: "eng_lines",
      type: "text",
      required: true,
    },
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
  ],
};
