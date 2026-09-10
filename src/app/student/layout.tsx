import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Madarasah Badru-diin - Student Portal",
  description: "Independent Student Academic & Fee Portal for Madarasah Badru-diin",
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="student-portal-wrapper min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {children}
    </div>
  );
}
