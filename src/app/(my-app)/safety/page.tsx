import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  GlowingStarsBackgroundCard,
  GlowingStarsDescription,
  GlowingStarsTitle,
} from "@/components/ui/glowing-stars";
import Link from "next/link";

const Page = () => {
  return (
    <>
      <Navbar />

      <MaxWidthWrapper className="mt-5">
        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <Link href="/Home">
              <BreadcrumbItem>
                <BreadcrumbLink>Home</BreadcrumbLink>
              </BreadcrumbItem>
            </Link>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Safety</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap gap-5 py-10 antialiased justify-center">
          <div className="w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/3">
            <Link href="/safety/processing-line">
              <GlowingStarsBackgroundCard>
                <GlowingStarsTitle>Processing Line</GlowingStarsTitle>
                <div className="flex justify-between items-end">
                  <GlowingStarsDescription>
                    View latest safety status
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
};

const Icon = () => (
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

export default Page;
