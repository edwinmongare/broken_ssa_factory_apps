import { AuthCredentialsValidator } from "@/lib/validators/account-credentials-validator";
import { publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getPayload } from "payload";
import config from "@payload-config";

export const authRouter = router({
  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      try {
        const payload = await getPayload({ config });
        const result = await payload.login({
          collection: "users",
          data: { email: input.email, password: input.password },
        });

        if (result.token) {
          const expires = result.exp
            ? new Date(result.exp * 1000).toUTCString()
            : undefined;
          ctx.resHeaders.append(
            "Set-Cookie",
            [
              `payload-token=${result.token}`,
              "Path=/",
              "HttpOnly",
              "SameSite=Lax",
              expires ? `Expires=${expires}` : "",
            ]
              .filter(Boolean)
              .join("; "),
          );
        }

        return { success: true };
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
