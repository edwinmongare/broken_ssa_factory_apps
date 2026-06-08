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
import { PMDlINES } from "./src/collections/PMD/PmdMachines";
import { PMDQuestions } from "./src/collections/PMD/PMDQuestions";
import { ENGQuestions } from "./src/collections/ENG/ENGQuestions";
import { ENGlINES } from "./src/collections/ENG/ENGMachines";
import { FMDlINES } from "./src/collections/FMD/FMDMachines";
import { FMDQuestions } from "./src/collections/FMD/FMDQuestions";
import { ENGQualityQuestions } from "./src/collections/ENG/Eng_Quality";
import { FMDQualityQuestions } from "./src/collections/FMD/FMD_Quality";
import { PMDQualityQuestions } from "./src/collections/PMD/PMD_Quality";
import { SMDQualityQuestions } from "./src/collections/Smd/SMD_Quality";

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
    PMDlINES,
    PMDQuestions,
    ENGlINES,
    ENGQuestions,
    FMDlINES,
    FMDQuestions,
    ENGQualityQuestions,
    FMDQualityQuestions,
    PMDQualityQuestions,
    SMDQualityQuestions,
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
