import { getPayloadClient } from "@/get-payload";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    pmd_line_name: string;
  };
}

interface Product {
  Trigger: string;
  updatedAt?: string;
  user?: { email: string }[];
  Line?: { pmd_lines: string }[];
  // Define other properties as per your actual data structure
}

const Page = async ({ params }: PageProps) => {
  const { pmd_line_name } = params;
  const decodedLineName = decodeURIComponent(pmd_line_name);
  console.log(decodedLineName);
  const payload = await getPayloadClient();

  const { docs: products } = await payload.find({
    collection: "PMDQuestions",
    limit: 1,
    where: {
      "Line.pmd_lines": {
        equals: decodedLineName,
      },
    },
  });

  const product: Product | undefined = products[0] as unknown as Product;
  if (!product) return notFound();

  const formatCreatedAt = (createdAt?: string): string => {
    if (!createdAt) return ""; // Handle undefined case gracefully

    const date = new Date(createdAt);

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-GB", options);
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  let content;
  let bgColor;

  switch (product?.Trigger) {
    case "low":
      bgColor = "bg-gradient-to-b from-green-500 to-green-900";
      break;
    case "medium":
      bgColor = "bg-gradient-to-b from-yellow-500 to-yellow-700";
      break;
    case "high":
      bgColor = "bg-gradient-to-b from-red-500 to-red-700";
      break;
    default:
      bgColor = "bg-gradient-to-b from-red-500 to-red-700";
      break;
  }
  content = (
    <div className={`${bgColor} min-h-screen flex flex-col`}>
      <div className="p-8">
        <h1 className="text-6xl font-extrabold text-white text-pretty">
          Line {product.Line?.[0].pmd_lines}
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-6xl font-extrabold text-white text-pretty">
          {capitalizeFirstLetter(product?.Trigger)} Risk!
        </h1>
      </div>
      <div className="p-8">
        <div className="flex flex-col items-start justify-end flex-1">
          <h1 className="text-xl font-medium text-white text-pretty">
            {formatCreatedAt(product.updatedAt)}
          </h1>
          <h1 className="text-3xl font-medium text-white text-wrap mt-2">
            By: {product.user?.[0]?.email || "Unknown"}
          </h1>
        </div>
      </div>
    </div>
  );

  return <>{content}</>;
};

export default Page;
