import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { EngViewQuality } from "@/components/EngViewQuality";
import { FmdViewQuality } from "@/components/FMDViewQuality";
import { PmdViewQuality } from "@/components/PMDViewQuality";
import { SmdViewQuality } from "@/components/SMDViewQuality";
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
              <BreadcrumbPage>Quality Screens</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Tabs defaultValue="smd" className="w-full bg-green">
          <TabsList className="grid w-full grid-cols-4 shadow-inner bg-black">
            <TabsTrigger className="shadow-inner" value="smd">
              SMD
            </TabsTrigger>
            <TabsTrigger className="text-white" value="pmd">
              PMD
            </TabsTrigger>
            <TabsTrigger className="text-white" value="eng">
              ENG
            </TabsTrigger>
            <TabsTrigger className="text-white" value="fmd">
              FMD
            </TabsTrigger>
          </TabsList>
          <TabsContent className="text-white" value="smd">
            <Card>
              <CardContent className="space-y-2">
                <SmdViewQuality />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pmd">
            <Card>
              <CardContent className="space-y-2">
                <PmdViewQuality />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="eng">
            <Card>
              <CardContent className="space-y-2">
                <EngViewQuality />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="fmd">
            <Card>
              <CardContent className="space-y-2">
                <FmdViewQuality />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MaxWidthWrapper>
    </>
  );
};
export default Page;
