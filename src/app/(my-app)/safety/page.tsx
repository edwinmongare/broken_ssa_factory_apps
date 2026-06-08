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
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

interface Inspection {
  Trigger?: string;
  createdAt?: string;
  updatedAt?: string;
}

const formatCreatedAt = (createdAt?: string): string => {
  if (!createdAt) return "No update";
  const date = new Date(createdAt);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const Skeleton = ({ gradient, trigger }: { gradient: string; trigger: string }) => (
  <div
    className={`flex mt-2 justify-center items-center w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${gradient}`}
  >
    <div className="grid place-items-center text-white">{trigger}</div>
  </div>
);

const renderSkeleton = (trigger: string) => {
  let gradient: string;
  let label = trigger;

  switch (trigger) {
    case "high":
      gradient = "from-red-700 to-red-900";
      break;
    case "medium":
      gradient = "bg-gradient-to-b from-yellow-500 to-yellow-500";
      break;
    case "low":
      gradient = "from-green-700 to-green-900";
      break;
    default:
      gradient = "from-gray-700 to-gray-900";
      label = "No data recorded";
      break;
  }

  return <Skeleton gradient={gradient} trigger={label} />;
};

const Page = async () => {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: "ProcessingLineInspections",
    limit: 1,
    sort: "-updatedAt",
  });

  const inspection: Inspection | undefined = docs[0] as unknown as Inspection;
  const trigger = inspection?.Trigger ?? "unknown";

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
              <BreadcrumbPage>Safety Screens</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <BentoGrid className="max-w-full mx-auto mt-5">
          <Link href="/safety/processing-line" className="h-full block">
            <div className="h-full">
              <BentoGridItem
                title="Processing Line"
                description={`Last Updated ${formatCreatedAt(inspection?.createdAt)}`}
                header={renderSkeleton(trigger)}
                className="shadow-xl max-g-full"
              />
            </div>
          </Link>
        </BentoGrid>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
