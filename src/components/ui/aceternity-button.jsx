"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const PulseButton = React.forwardRef(({ 
  className, 
  asChild = false,
  variant = "default",
  size = "default",
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  if (asChild) {
    const child = React.Children.only(children);
    return (
      <Comp className={className} ref={ref} {...props}>
        {React.cloneElement(child, {
          className: cn(
            "group relative inline-flex items-center justify-center rounded-full h-12 px-6 font-medium overflow-hidden bg-gradient-to-r from-purple-600 via-primary to-purple-600 text-white shadow-lg hover:-translate-y-1 transition-all duration-300",
            child.props.className
          ),
          children: (
            <>
              <span className="absolute -inset-px rounded-full blur opacity-30 bg-gradient-to-r from-purple-600 via-primary to-purple-600 group-hover:opacity-100 transition duration-200"></span>
              <span className="relative z-20 flex items-center">
                {child.props.children}
              </span>
            </>
          )
        })}
      </Comp>
    );
  }
  
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full h-12 px-6 font-medium overflow-hidden bg-gradient-to-r from-purple-600 via-primary to-purple-600 text-white shadow-lg hover:-translate-y-1 transition-all duration-300",
        className
      )}
      ref={ref}
      {...props}
    >
      <span className="absolute -inset-px rounded-full blur opacity-30 bg-gradient-to-r from-purple-600 via-primary to-purple-600 group-hover:opacity-100 transition duration-200"></span>
      <span className="relative z-20 flex items-center">
        {children}
      </span>
    </button>
  );
});

PulseButton.displayName = "PulseButton";

const GradientButton = React.forwardRef(({ 
  className, 
  asChild = false,
  variant = "default",
  size = "default",
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  if (asChild) {
    const child = React.Children.only(children);
    return (
      <Comp className={className} ref={ref} {...props}>
        {React.cloneElement(child, {
          className: cn(
            "inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-purple-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
            child.props.className
          )
        })}
      </Comp>
    );
  }
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-purple-600 px-6 py-2.5 font-medium text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

GradientButton.displayName = "GradientButton";

const ShimmerButton = React.forwardRef(({ 
  className, 
  asChild = false,
  children,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button";
  
  if (asChild) {
    const child = React.Children.only(children);
    return (
      <Comp className={className} ref={ref} {...props}>
        {React.cloneElement(child, {
          className: cn(
            "relative inline-flex h-12 items-center justify-center rounded-md bg-slate-800 px-6 font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
            child.props.className
          ),
          children: (
            <>
              <div className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#6d6d6d] to-[#3b3b3b] opacity-75 blur" />
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/50 to-purple-600/50 opacity-0 hover:opacity-100 transition-opacity rounded-md"></span>
              <span className="relative z-20">{child.props.children}</span>
            </>
          ),
        })}
      </Comp>
    );
  }
  
  return (
    <button
      className={cn(
        "relative inline-flex h-12 items-center justify-center rounded-md bg-slate-800 px-6 font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#6d6d6d] to-[#3b3b3b] opacity-75 blur" />
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/50 to-purple-600/50 opacity-0 hover:opacity-100 transition-opacity rounded-md"></span>
      <span className="relative z-20">{children}</span>
    </button>
  );
});

ShimmerButton.displayName = "ShimmerButton";

export { PulseButton, GradientButton, ShimmerButton }; 