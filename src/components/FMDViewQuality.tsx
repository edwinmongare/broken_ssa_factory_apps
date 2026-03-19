"use client";
import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "./ui/bento-grid";
import Link from "next/link";

const requiredLines = ["KDF 1", "KDF 2", "KDF 3", "KDF 4", "KDF 5", "KDF 6"];

interface Line {
  id: string;
  FMD_Lines: string;
}

interface Data {
  Line: Line[];
  Trigger: string;
  createdAt: string;
  updatedAt:string;
}
const Skeleton: React.FC<{ color: string; trigger: string }> = ({
  color,
  trigger,
}) => (
  <div
    className={`flex mt-2 justify-center items-center w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${color}`}
  >
    <div className="grid place-items-center text-white">{trigger}</div>
  </div>
);

const formatCreatedAt = (createdAt?: string): string => {
  if (createdAt) {
    const date = new Date(createdAt);

    // Options for date and time formatting
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric", // Use "numeric" for full year or "2-digit" for two-digit year
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format with "am" or "pm"
    };

    return date.toLocaleString("en-GB", options);
  } else {
    return "No update"; // Return "No update" if createdAt is not available
  }
};

export function FmdViewQuality() {
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/FMD_Quality_Inspection/?limit=10000`)
        .then((response) => response.json())
        .then((apiData) => {
          const uniqueLines = extractUniqueLines(apiData.docs);
          setData(uniqueLines);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    fetchData(); // Initial data fetch

    const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []); // Run once on component mount

  const extractUniqueLines = (docs: Data[]): Data[] => {
    const lineMap = new Map<string, Data>();

    docs.forEach((entry) => {
      entry.Line.forEach((line) => {
        const existingEntry = lineMap.get(line.id);
        if (!existingEntry || isNewer(entry, existingEntry)) {
          lineMap.set(line.id, entry);
        }
      });
    });

    return Array.from(lineMap.values());
  };

  const isNewer = (entry: Data, existingEntry: Data): boolean => {
    return new Date(entry.updatedAt) > new Date(existingEntry.updatedAt);
  };
  
  const renderSkeleton = (trigger: string) => {
    let color = "";
    let gradient = "";

    switch (trigger) {
      case "high":
        color = "red";
        gradient = "from-red-700 to-red-900";
        break;
      case "medium":
        color = "yellow";
        gradient = "bg-gradient-to-b from-yellow-300 to-yellow-500";
        break;
      case "low":
        color = "green";
        gradient = "from-green-700 to-green-900";
        break;
      default:
        color = "gray"; // Default to gray if trigger is not recognized
        gradient = "from-gray-700 to-gray-900";
        break;
    }

    return <Skeleton color={`${gradient}`} trigger={trigger} />;
  };

  return (
    <BentoGrid className="max-w-full mx-auto mt-5">
      {requiredLines.map((requiredLine) => {
        const lineData = data.find((item) =>
          item.Line.some((line) => line.FMD_Lines === requiredLine)
        );

        if (lineData) {
          const line = lineData.Line.find(
            (line) => line.FMD_Lines === requiredLine
          );
          return (
            <Link
              key={line?.id ?? requiredLine} // Safely access line.id using optional chaining
              href={`/Line/Quality/fmd/${requiredLine}`}
              className="h-full block" // Add block display and full width and height
            >
              <BentoGridItem
                key={line?.id ?? requiredLine} // Safely access line.id using optional chaining
                title={`${requiredLine}`}
                description={`Last Updated ${formatCreatedAt(
                  lineData.createdAt
                )}`}
                header={renderSkeleton(lineData.Trigger)}
                className="shadow-xl"
              />
            </Link>
          );
        } else {
          // If lineData is not found, render a skeleton with "No data recorded"
          return (
            <BentoGridItem
              key={requiredLine}
              title={`${requiredLine}`}
              description={`Last Updated: ${formatCreatedAt()}`} // No createdAt available
              header={
                <Skeleton
                  color="from-gray-700 to-gray-900"
                  trigger="No data recorded"
                />
              }
              className="shadow-xl"
            />
          );
        }
      })}
    </BentoGrid>
  );
}
