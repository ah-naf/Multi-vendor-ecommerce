// File Path: src/components/DataTable.tsx
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export const DataTable = ({ columns, data, onEdit, onDelete }) => {
  // ---- DESKTOP VIEW ----
  const DesktopTable = () => (
    <div className="hidden md:block bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.accessor} className="font-medium">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => onEdit(row)}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Edit
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

  // ---- MOBILE/TABLET VIEW ----
  const MobileCard = ({ item }) => (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {columns.find((c) => c.accessor === "image") &&
            columns.find((c) => c.accessor === "image").cell(item, "mobile")}
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-500">{item.sku}</p>
            {columns.find((c) => c.accessor === "price") && (
              <p className="text-sm font-bold mt-1">
                {columns.find((c) => c.accessor === "price").cell(item)}
              </p>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mt-2 -mr-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
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
      <div className="flex items-center justify-between mt-4">
        {columns.find((c) => c.accessor === "status") &&
          columns.find((c) => c.accessor === "status").cell(item)}
        {columns.find((c) => c.accessor === "stock") && (
          <p className="text-sm text-gray-600">
            Stock: <span className="font-bold">{item.stock}</span>
          </p>
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
};
