import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";

export const createContext = ({ req, resHeaders }: FetchCreateContextFnOptions) => ({
  req,
  resHeaders,
});

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
