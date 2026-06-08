import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./src/collections/Users";
import { Factories } from "./src/collections/Factories";
import { SmdMachines } from "./src/collections/Smd/SmdMachines";
import { SmdQuestions } from "./src/collections/Smd/SmdQuestions";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: "",
  secret: process.env.PAYLOAD_SECRET || "",
  cors: "*",
  csrf: [],
  collections: [
    Users,
    Factories,
    SmdMachines,
    SmdQuestions,
  ],
  routes: {
    admin: "/admin",
  },
  admin: {
    user: "users",
    meta: {
      titleSuffix: "- SSA Digital Factory Screens",
      icons: [{ rel: "icon", type: "image/x-icon", url: "/favicons.ico" }],
      openGraph: {
        images: [{ url: "/thumbnail.jpg" }],
      },
    },
  },
  editor: lexicalEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || "",
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
