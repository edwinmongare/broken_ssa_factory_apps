import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
} from "@/components/ui/glowing-stars";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <MaxWidthWrapper>
        <div className="flex flex-wrap gap-5 py-20 antialiased justify-center">
          {/* First GlowingStarsBackgroundCard */}
          <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3">
            <Link href="/safety">
              <GlowingStarsBackgroundCard>
                <GlowingStarsTitle>Safety Trigger</GlowingStarsTitle>
                <div className="flex justify-between items-end">
                  <GlowingStarsDescription>
                    View current safety status
                  </GlowingStarsDescription>
                  <div className="h-8 w-8 rounded-full bg-[hsla(0,0%,100%,.1)] flex items-center justify-center">
                    <Icon />
                  </div>
                </div>
              </GlowingStarsBackgroundCard>
            </Link>
          </div>

          {/* Second GlowingStarsBackgroundCard */}
          <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3">
            <Link href="/Quality">
              <GlowingStarsBackgroundCard className="bg-[linear-gradient(110deg,#004F9F.60%,#00B1EB)]">
                <GlowingStarsTitle>Quality Trigger</GlowingStarsTitle>
                <div className="flex justify-between items-end">
                  <GlowingStarsDescription>
                    View current quality status
                  </GlowingStarsDescription>
                  <div className="h-8 w-8 rounded-full bg-[hsla(0,0%,100%,.1)] flex items-center justify-center">
                    <Icon />
                  </div>
                </div>
              </GlowingStarsBackgroundCard>
            </Link>
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  );
}

const Icon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="h-4 w-4 text-white stroke-2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
      />
    </svg>
  );
};
