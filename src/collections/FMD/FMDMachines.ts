import type { Access, CollectionBeforeChangeHook, CollectionConfig } from "payload";
import type { User } from "@/payload-types";

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) return false;
    if (user.role === "admin") return true;

    return {
      user: {
        equals: req.user.id,
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
export const FMDlINES: CollectionConfig = {
  slug: "FMD_Lines",
  admin: {
    useAsTitle: "FMD_Lines",
    description: "lines in FMD",
    hidden: ({ user }) => user.role !== "superadmin" && user.role !== "clerk",
  },

  hooks: {
    beforeChange: [addUser, addFactory],
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
    update: ({ req: { user } }) =>
      user.role === "superadmin" || user.role === "clerk", // Restrict create access to superadmin
    delete: ({ req: { user } }) =>
      user.role === "superadmin" || user.role === "clerk", // Restrict create access to superadmin
    // Restrict create access to superadmin
    create: ({ req: { user } }) =>
      user.role === "superadmin" || user.role === "clerk", // Restrict create access to superadmin
  },
  fields: [
    {
      label: "FMD Lines",
      name: "FMD_Lines",
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
