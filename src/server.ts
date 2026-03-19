import express from "express";
import { getPayloadClient } from "./get-payload";
import { nextApp, nextHandler } from "./next-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { inferAsyncReturnType } from "@trpc/server";
import nextBuild from "next/dist/build";
import path from "path";
import { parse } from "url";
import { PayloadRequest } from "payload/types";

const app = express();
const PORT = Number(process.env.PORT) || 3500;

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({
  req,
  res,
});

export type ExpressContext = inferAsyncReturnType<typeof createContext>;

const start = async () => {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL: ${cms.getAdminURL()}`);
      },
    },
  });

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info("Next.js is building for production");

      // @ts-expect-error
      await nextBuild(path.join(__dirname, "../"));

      process.exit();
    });

    return;
  }
  //order router
  const orderRouter = express.Router();

  orderRouter.use(payload.authenticate);

  orderRouter.get("/", (req, res) => {
    const request = req as PayloadRequest;

    if (!request.user) return res.redirect("/sign-in?origin=create-order");

    const parsedUrl = parse(req.url, true);
    const { query } = parsedUrl;

    return nextApp.render(req, res, "/create-order", query);
  });
  //order router

  //analytics router

  const analyticsRouter = express.Router();

  analyticsRouter.use(payload.authenticate);

  analyticsRouter.get("/", (req, res) => {
    const request = req as PayloadRequest;

    if (!request.user) return res.redirect("/sign-in?origin=analytics");

    const parsedUrl = parse(req.url, true);
    const { query } = parsedUrl;

    return nextApp.render(req, res, "/analytics", query);
  });
  //analytics router
  //verify-certificate router

  const verifyCertificate = express.Router();

  verifyCertificate.use(payload.authenticate);

  verifyCertificate.get("/", (req, res) => {
    const request = req as PayloadRequest;

    if (!request.user)
      return res.redirect("/sign-in?origin=verify-certificate");

    const parsedUrl = parse(req.url, true);
    const { query } = parsedUrl;

    return nextApp.render(req, res, "/verify-certificate", query);
  });
  //verify-certificate router

  //view-orders router

  const viewOrders = express.Router();

  viewOrders.use(payload.authenticate);

  viewOrders.get("/", (req, res) => {
    const request = req as PayloadRequest;

    if (!request.user) return res.redirect("/sign-in?origin=view-orders");

    const parsedUrl = parse(req.url, true);
    const { query } = parsedUrl;

    return nextApp.render(req, res, "/view-orders", query);
  });
  //view-orders router
  app.use("/create-order", orderRouter);
  app.use("/analytics", analyticsRouter);
  app.use("/verify-certificate", verifyCertificate);
  app.use("/view-orders", viewOrders);

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js started");

    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
};

start();
