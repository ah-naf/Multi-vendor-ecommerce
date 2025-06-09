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
import { MoreHorizontal, Pencil, Trash2, Truck } from "lucide-react";
import Link from "next/link";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T, view?: "desktop" | "mobile") => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onShip?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onShip,
}: DataTableProps<T>) {
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
            {(onEdit || onDelete || onShip) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.accessor as string} className="font-medium">
                  {col.cell
                    ? col.cell(row, "desktop")
                    : // @ts-ignore
                      row[col.accessor]}
                </TableCell>
              ))}

              {(onEdit || onDelete || onShip) && (
                <TableCell>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> View
                    </Button>
                  )}

                  {onShip && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mr-2"
                      onClick={() => onShip(row)}
                    >
                      <Truck className="mr-1 h-4 w-4" /> Ship
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => onDelete(row)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const MobileCard = ({ item }: { item: T }) => (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {columns.find((c) => c.accessor === "image")?.cell?.(item, "mobile")}
          <div>
            <p className="font-semibold">
              {/* first column */}
              {(item as any)[columns[0].accessor]}
            </p>
            {columns.find((c) => c.accessor === "date") && (
              <p className="text-sm text-gray-500">
                {
                  (item as any)[
                    columns.find((c) => c.accessor === "date")!.accessor
                  ]
                }
              </p>
            )}
            {columns.find((c) => c.accessor === "amount") && (
              <p className="text-sm font-bold mt-1">
                {columns.find((c) => c.accessor === "amount")!.cell!(
                  item,
                  "mobile"
                )}
              </p>
            )}
          </div>
        </div>

        {(onEdit || onShip || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
              )}
              {onShip && (
                <DropdownMenuItem onClick={() => onShip(item)}>
                  <Truck className="mr-2 h-4 w-4" /> Ship
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

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
