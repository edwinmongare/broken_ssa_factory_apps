import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    // verify: {
    //   generateEmailHTML: ({ token }) => {
    //     return `<a href='${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}'></a>`;
    //   },
    // },
  },
  access: {
    read: () => true, // Restrict create access to superadmin
    update: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
    delete: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
    create: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
  },
  admin: {
    hidden: ({ user }) => user.role !== "admin" && user.role !== "superadmin",
    useAsTitle: "Create new users",
    description:
      "Create user as and admin,data clerk, operator and link the user to a factory",
  },

  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },

    {
      name: "role",
      defaultValue: "user",
      required: true,
      admin: {
        condition: () => true,
      },
      type: "select",
      options: [
        { label: "Super Admin", value: "superadmin" },
        { label: "Operator", value: "operator" },
        { label: "Clerk", value: "clerk" },
      ],
    },
    // {
    //   name: "factory_name",
    //   type: "relationship",
    //   relationTo: "factories",
    //   required: true,
    //   hasMany: false,
    // },
  ],
};
