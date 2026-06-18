import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { Users } from "./src/collections/Users";
import { Factories } from "./src/collections/Factories";
import { ProcessingLineInspections } from "./src/collections/ProcessingLine";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  serverURL: "",
  secret: process.env.PAYLOAD_SECRET || "",
  cors: "*",
  csrf: [],
  collections: [
    Users,
    Factories,
    ProcessingLineInspections,
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
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
});
