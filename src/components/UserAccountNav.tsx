"use client";

import { User } from "@/payload-types";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useAuth } from "../hooks/use-auth";
import { Loader2, PlusIcon } from "lucide-react";

const UserAccountNav = ({ user }: { user: User }) => {
  const { signOut } = useAuth();

  return (
    <>
      {user && user.role === "superadmin" ? (
        <Link href="/admin" rel="noopener noreferrer" target="_blank">
          <Button variant="ghost" size="sm" className="relative">
            Go to Admin
          </Button>
        </Link>
      ) : (
        <Link href="/admin" rel="noopener noreferrer" target="_blank">
          <div className="flex items-center">
            <button className="relative p-[3px]">
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-lg" />
              <div className="px-2 py-2 bg-zinc-950 rounded-[6px] relative group transition duration-200 text-white text-sm hover:bg-transparent flex items-center">
                <PlusIcon className="animate-pulse h-5" /> New Inspection
              </div>
            </button>
          </div>
          {/* <Button variant="ghost" size="sm" className="relative">
            New Inspection
          </Button> */}
        </Link>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="overflow-visible">
          <Button variant="ghost" size="sm" className="relative">
            My account
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white w-60" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-0.5 leading-none">
              <p className="font-medium text-sm text-black">{user.email}</p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={signOut} className="cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserAccountNav;
