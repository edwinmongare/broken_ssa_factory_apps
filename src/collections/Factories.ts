import { CollectionConfig } from "payload/types";

export const Factories: CollectionConfig = {
  slug: "factories",
  admin: {
    useAsTitle: "factory_name",
    description: "Factories in BAT",
  },
  access: {
    read: ({ req: { user } }) => user.role === "superadmin",
    update: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
    delete: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
    create: ({ req: { user } }) => user.role === "superadmin", // Restrict create access to superadmin
  },
  fields: [
    {
      label: "Factory",
      name: "factory_name",
      type: "text",
      required: true,
    },
    {
      label: "Country",
      name: "country",
      type: "text",
      required: true,
    },
  ],
};
