"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T, view?: "desktop" | "mobile") => React.ReactNode;
  className?: string;
}

export interface Action<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // CHANGED: The 'actions' array is now a 'getActions' function.
  // This function takes a row and returns an array of actions for that specific row.
  getActions?: (row: T) => Action<T>[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  getActions, // Updated prop name
}: DataTableProps<T>) {
  const hasActions = !!getActions;

  const DesktopTable = () => (
    <div className="hidden md:block bg-white rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor as string} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {hasActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.accessor as string} className="font-medium">
                  {col.cell
                    ? col.cell(row, "desktop")
                    : (row as any)[col.accessor]}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell>
                  {/* CHANGED: Call getActions(row) to get actions for this specific row */}
                  {getActions(row).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="sm"
                      className={`mr-2 ${action.className || ""}`}
                      onClick={() => action.onClick(row)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const MobileCard = ({ item }: { item: T }) => {
    // Get the actions for this specific card
    const itemActions = hasActions ? getActions(item) : [];

    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-start justify-between">
          {/* ... mobile card data rendering */}
        </div>
        {itemActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {itemActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(item)}
                  className={
                    action.variant === "destructive" ? "text-red-500" : ""
                  }
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <>
      <DesktopTable />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {data.map((item) => (
          <MobileCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
