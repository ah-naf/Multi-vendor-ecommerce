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
import { Inbox, MoreHorizontal } from "lucide-react";

export interface Column<T> {
  header: string;
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
  getActions?: (row: T) => Action<T>[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  getActions,
}: DataTableProps<T>) {
  const hasActions = !!getActions;

  if (data.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
        <Inbox className="h-16 w-16 mb-4" />
        <p className="text-lg">No data to display</p>
      </div>
    );
  }

  const DesktopTable = () => (
    <div className="hidden md:block bg-white rounded-lg border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, ind) => (
              <TableHead key={ind} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {hasActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col, ind) => (
                <TableCell key={ind} className="font-medium">
                  {col.cell ? col.cell(row, "desktop") : ""}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell>
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
    const itemActions = hasActions ? getActions(item) : [];

    return (
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-start justify-between"></div>
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
