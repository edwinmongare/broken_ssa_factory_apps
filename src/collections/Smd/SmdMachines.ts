import { User } from "payload/dist/auth";
import { BeforeChangeHook } from "payload/dist/collections/config/types";
import { Access, CollectionConfig } from "payload/types";
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

const addUser: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};
const addFactory: BeforeChangeHook = ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.factory_name };
};
export const SmdMachines: CollectionConfig = {
  slug: "smd_line_name",
  admin: {
    useAsTitle: "smd_line_name",
    description: "Lines in SMD",
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
    //read: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
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
      label: "Line Name",
      name: "smd_line_name",
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
