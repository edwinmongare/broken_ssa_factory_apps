"use client";
import React from "react";
import { Label } from "../../../components/ui/labelTwo";
import { Input } from "../../../components/ui/inputTwo";
import { cn } from "../../../lib/utils";

import { IconArchive } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  AuthCredentialsValidator,
  TAuthCredentialsValidator,
} from "@/lib/validators/account-credentials-validator";
import { trpc } from "@/trpc/client";
import { ZodError } from "zod";
import { toast } from "sonner";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AwesomeBg } from "../../../components/bglogin";

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const origin = searchParams.get("origin");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  });

  const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
    onSuccess: async () => {
      toast.success("Signed in successfully");

      router.refresh();

      if (origin) {
        router.push(`/${origin}`);
        return;
      }

      router.push("/Home");
    },
    onError: (err) => {
      if (err.data?.code === "UNAUTHORIZED") {
        toast.error("Invalid email or password.");
      }
    },
  });

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    signIn({ email, password });
  };
  return (
    <div
      className="min-h-screen z-40 flex items-center justify-center bg-cover bg-center relative"
      // style={{ backgroundImage: "url('/bg.png')" }}
    >
      <AwesomeBg />
      {/* <div className="absolute top-8">
        <Image
          src="/logo.png"
          alt="Logo Placeholder"
          width={120}
          height={120}
          className="mb-4"
        />

\      </div> */}
      <div className="max-w-screen-sm w-full mx-auto rounded-none md:rounded-sm p-4 md:p-8 z-40  shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Welcome to SSA Digital Factory Screens
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Login to use the application
        </p>
        <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>

            <Input
              {...register("email")}
              className={cn({
                "focus-visible:ring-red-500": errors.email,
              })}
              id="email"
              placeholder="enter your email address"
              type="email"
            />
            {errors?.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register("password")}
              className={cn({
                "focus-visible:ring-red-500": errors.password,
              })}
              placeholder="••••••••"
              type="password"
            />
            {errors?.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </LabelInputContainer>

          <button
            disabled={isLoading}
            className="
            relative group/btn bg-gradient-to-br
            from-sky-400 dark:from-sky-500-900 dark:to-sky-950 to-sky-950
             dark:bg-sky-800 w-full text-white rounded-md h-10 font-medium
            shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]
            dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]
            flex items-center justify-center // Center content horizontally and vertically
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''            "
            type="submit"
          >
            {isLoading && (
              <Loader2 className="h-5 w-5 mr-3 animate-spin text-white " />
            )}
            Sign In &rarr;
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
        </form>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <>
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
        {children}
      </div>
    </>
  );
};
export default Page;
