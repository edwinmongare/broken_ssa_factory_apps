import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
// import { Icon } from "../src/components/Logo"; // Update import here
// import { Logo } from "../src/components/Logo"; // Update import here
import dotenv from "dotenv";
import path from "path";
import { buildConfig } from "payload/config";
import { Users } from "./collections/Users";
import { Factories } from "./collections/Factories";
import { SmdMachines } from "./collections/Smd/SmdMachines";
import { SmdQuestions } from "./collections/Smd/SmdQuestions";
import { PMDlINES } from "./collections/PMD/PmdMachines";
import { PMDQuestions } from "./collections/PMD/PMDQuestions";
import { ENGQuestions } from "./collections/ENG/ENGQuestions";
import { ENGlINES } from "./collections/ENG/ENGMachines";
import { FMDlINES } from "./collections/FMD/FMDMachines";
import { FMDQuestions } from "./collections/FMD/FMDQuestions";
import { ENGQualityQuestions } from "./collections/ENG/Eng_Quality";
import { FMDQualityQuestions } from "./collections/FMD/FMD_Quality";
import { PMDQualityQuestions } from "./collections/PMD/PMD_Quality";
import { SMDQualityQuestions } from "./collections/Smd/SMD_Quality";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "",

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
    bundler: webpackBundler(),
    meta: {
      titleSuffix: "- SSA Digital Factory Screens",
      favicon: "/favicons.ico",
      ogImage: "/thumbnail.jpg",
    },
    // css: path.resolve(__dirname, "src/app/globals.css"),
    // components: {
    //   graphics: {
    //     Icon,
    //     Logo,
    //   },
    // },
  },

  rateLimit: {
    max: 20000,
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URL!,
  }),
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
});
