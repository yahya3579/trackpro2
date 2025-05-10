"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  as: Component = "div",
}) {
  return (
    <Component
      className={cn(
        "relative p-[2px] bg-slate-800 overflow-hidden rounded-lg",
        containerClassName
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-primary to-purple-500 opacity-20 blur-xl transition duration-1000 group-hover:opacity-30 group-hover:duration-200"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-100 transition duration-1000 group-hover:opacity-0"
        style={{
          backgroundImage:
            "linear-gradient(72.04deg, rgb(138, 35, 135) 6.05%, rgb(96, 93, 173) 35.89%, rgb(45, 118, 212) 64.84%, rgb(35, 138, 113) 93.84%)",
          WebkitMaskImage:
            "radial-gradient(farthest-side at bottom left, transparent 16px, black 17px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(72.04deg, rgb(138, 35, 135) 6.05%, rgb(96, 93, 173) 35.89%, rgb(45, 118, 212) 64.84%, rgb(35, 138, 113) 93.84%)",
          WebkitMaskImage:
            "radial-gradient(farthest-side at bottom left, transparent 16px, black 17px)",
        }}
      />
      <div className={cn("relative z-20 group", className)}>{children}</div>
    </Component>
  );
} 