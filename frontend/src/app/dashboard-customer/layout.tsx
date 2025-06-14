import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import PrivateRoute from "@/components/auth/PrivateRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateRoute>
      <div className="flex h-screen w-full bg-gray-50 font-sans">
        <Sidebar isCustomer={true} />

        <div className="flex-1 flex flex-col h-screen">
          <Header />

          {/* Main Page Content */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PrivateRoute>
  );
}
