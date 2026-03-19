"use client";
import React, { useEffect, useState } from "react";
import { Boxes } from "./ui/background-boxes";
import { cn } from "@/lib/utils";
import { MultiStepLoader as Loader } from "./ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
const loadingStates = [
  {
    text: "Fetching latest updates.",
  },
  {
    text: "Retrieving important details.",
  },
  {
    text: "Fetching essential data",
  },
];

export function CoolLoader() {
  const loadingStates = [
    {
      text: "Fetching latest updates.",
    },
    {
      text: "Retrieving important details.",
    },
    {
      text: "Fetching essential data",
    },
  ];

  // Render the loader only if isLoading is true
  return (
    <>
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader loadingStates={loadingStates} loading={true} />
      </div>
    </>
  );
}
