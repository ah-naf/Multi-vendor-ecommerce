// File Path: src/app/dashboard/layout.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen">
        <Header />

        {/* Search and Filter Section (Now part of the layout) */}
        <div className="bg-white border-b border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by product, brand, or keyword"
                className="pl-10 h-12 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Main Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
