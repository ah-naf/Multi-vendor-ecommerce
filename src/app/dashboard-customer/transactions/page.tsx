"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, CheckCircle, Clock, XCircle } from "lucide-react";

// --- MOCK DATA ---
const transactions = [
  {
    product: "Wireless Noise-Cancelling Headphones",
    id: "TXN-4532219",
    amount: 249.99,
    date: "May 28, 2025",
    status: "Paid",
  },
  {
    product: "Smart Fitness Watch",
    id: "TXN-4532218",
    amount: 199.5,
    date: "May 26, 2025",
    status: "Pending",
  },
  {
    product: "Ultra-Thin Laptop",
    id: "TXN-4532217",
    amount: 1299.0,
    date: "May 25, 2025",
    status: "Failed",
  },
  {
    product: "Portable Bluetooth Speaker",
    id: "TXN-4532216",
    amount: 159.98,
    date: "May 22, 2025",
    status: "Paid",
  },
];

// --- HELPER COMPONENT ---
const TransactionStatusBadge = ({
  status,
}: {
  status: "Paid" | "Pending" | "Failed";
}) => {
  const statusConfig = {
    Paid: { icon: CheckCircle, className: "bg-green-100 text-green-800" },
    Pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
    Failed: { icon: XCircle, className: "bg-red-100 text-red-800" },
  };
  const { icon: Icon, className } = statusConfig[status];
  return (
    <Badge className={`px-2 py-1 ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {status}
    </Badge>
  );
};

// --- MAIN TRANSACTIONS PAGE ---
export default function TransactionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Payment Transactions
        </h1>
        <p className="text-gray-500 mt-1">
          Track your payments and download receipts.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Transaction History</CardTitle>
          <CardDescription>
            All transactions are securely processed via XYZ gateway.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-gray-50/50"
            >
              <div className="mb-3 sm:mb-0">
                <p className="font-semibold text-gray-800">{txn.product}</p>
                <p className="text-sm text-gray-500">
                  Transaction ID: {txn.id}
                </p>
                <p className="font-bold text-lg text-gray-900 mt-1">
                  ${txn.amount.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    on {txn.date}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4 self-start sm:self-center">
                <TransactionStatusBadge status={txn.status as any} />
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Download Receipt
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
