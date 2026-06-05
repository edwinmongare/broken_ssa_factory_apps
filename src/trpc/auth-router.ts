import { AuthCredentialsValidator } from "@/lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { login } from "@payloadcms/next/auth";
import config from "@payload-config";

export const authRouter = router({
  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      try {
        await login({
          collection: "users",
          config,
          email: input.email,
          password: input.password,
        });
        return { success: true };
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
