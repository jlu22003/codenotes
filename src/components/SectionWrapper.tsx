import React, { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({ children, className = "" }: SectionWrapperProps) {
  return (
    <section
      className={`${className}`}
      style={{
          padding: "0 24px",
          margin: 0,
      }}
    >
      {children}
    </section>
  );
}