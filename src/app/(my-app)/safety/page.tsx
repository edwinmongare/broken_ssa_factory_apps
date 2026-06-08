import { SmdView } from "@/components/SmdView";
import { Card, CardContent } from "@/components/ui/card";
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
              <BreadcrumbPage>Processing Line</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-bold mb-4 text-white">Processing Line</h1>

        <Card>
          <CardContent className="space-y-2">
            <SmdView />
          </CardContent>
        </Card>
      </MaxWidthWrapper>
    </>
  );
};

export default Page;
