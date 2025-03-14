import React from "react";
import Navbar from "./Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {/* Footer or other components can be added here */}
    </div>
  );
}
