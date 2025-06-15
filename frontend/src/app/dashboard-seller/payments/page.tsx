"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable, Column } from "@/components/DataTable";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AlertTriangle, Trash2 } from "lucide-react";
import { PaymentMethod, Withdraw } from "@/types";

export default function PaymentsPage() {
  const [withdrawHistory, setWithdrawHistory] = useState<Withdraw[]>([
    { id: "wd_001", date: "2025-06-01", amount: 500, status: "Completed" },
    { id: "wd_002", date: "2025-05-24", amount: 300, status: "Completed" },
    { id: "wd_003", date: "2025-05-17", amount: 250, status: "Failed" },
    { id: "wd_004", date: "2025-05-10", amount: 400, status: "Pending" },
  ]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [totalBalance, setTotalBalance] = useState(1250);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newType, setNewType] =
    useState<PaymentMethod["type"]>("Bank Transfer");
  const [formFields, setFormFields] = useState<Record<string, string>>({});
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const pendingPayout = useMemo(
    () =>
      withdrawHistory
        .filter((w) => w.status === "Pending")
        .reduce((sum, w) => sum + w.amount, 0),
    [withdrawHistory]
  );

  const withdrawCols: Column<Withdraw>[] = [
    { header: "Date", cell: (w: Withdraw) => w.date },
    {
      header: "Amount",
      cell: (r) => `$${r.amount.toFixed(2)}`,
    },
    { header: "Status", cell: (w: Withdraw) => w.status },
  ];

  function confirmAddMethod() {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: newType,
      label:
        newType === "Bank Transfer"
          ? `${formFields.bankName} (${formFields.accountNumber})`
          : newType === "PayPal"
          ? formFields.paypalEmail
          : newType === "Credit Card"
          ? `•••• ${formFields.cardNumber.slice(-4)}`
          : `Stripe: ${formFields.stripeEmail}`,
      details: { ...formFields },
    };
    setPaymentMethods((prev) => [...prev, newMethod]);
    setFormFields({});
    setShowAddMethod(false);
  }

  function confirmWithdraw() {
    const wd: Withdraw = {
      id: "wd_" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      amount: withdrawAmount,
      status: "Pending",
    };
    setWithdrawHistory((prev) => [wd, ...prev]);
    setTotalBalance((b) => b - withdrawAmount);
    setWithdrawAmount(0);
    setShowWithdraw(false);
  }

  function removeMethod(id: string) {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-8">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Please note: Payment and withdrawal functionalities are currently
          under development and not yet available.
        </AlertDescription>
      </Alert>

      <h1 className="text-2xl font-bold">Payments</h1>

      {/* 1. Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${pendingPayout.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Withdraw History</h2>
          <Button
            className="bg-red-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowWithdraw(true)}
            disabled
          >
            Request Payout
          </Button>
        </div>
        <DataTable<Withdraw> columns={withdrawCols} data={withdrawHistory} />
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Payment Methods</CardTitle>
          <Button
            className="bg-red-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAddMethod(true)}
            disabled
          >
            Add Payment Method
          </Button>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500">No payment methods added.</p>
          ) : (
            <ul className="space-y-2">
              {paymentMethods.map((m) => (
                <li
                  key={m.id}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded"
                >
                  <div>
                    <p className="font-medium">{m.type}</p>
                    <p className="text-sm text-gray-600">{m.label}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMethod(m.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newType}
                onValueChange={(v) => {
                  setNewType(v as any);
                  setFormFields({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newType === "Bank Transfer" && (
              <>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={formFields.bankName || ""}
                    onChange={(e) =>
                      setFormFields((f) => ({
                        ...f,
                        bankName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={formFields.accountNumber || ""}
                    onChange={(e) =>
                      setFormFields((f) => ({
                        ...f,
                        accountNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input
                    value={formFields.routingNumber || ""}
                    onChange={(e) =>
                      setFormFields((f) => ({
                        ...f,
                        routingNumber: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {newType === "PayPal" && (
              <div className="space-y-2">
                <Label>PayPal Email</Label>
                <Input
                  type="email"
                  value={formFields.paypalEmail || ""}
                  onChange={(e) =>
                    setFormFields((f) => ({
                      ...f,
                      paypalEmail: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {newType === "Credit Card" && (
              <>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    value={formFields.cardNumber || ""}
                    onChange={(e) =>
                      setFormFields((f) => ({
                        ...f,
                        cardNumber: e.target.value,
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry (MM/YY)</Label>
                    <Input
                      value={formFields.expiry || ""}
                      onChange={(e) =>
                        setFormFields((f) => ({
                          ...f,
                          expiry: e.target.value,
                        }))
                      }
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      value={formFields.cvv || ""}
                      onChange={(e) =>
                        setFormFields((f) => ({
                          ...f,
                          cvv: e.target.value,
                        }))
                      }
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cardholder Name</Label>
                  <Input
                    value={formFields.cardName || ""}
                    onChange={(e) =>
                      setFormFields((f) => ({
                        ...f,
                        cardName: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {newType === "Stripe" && (
              <div className="space-y-2">
                <Label>Stripe Account Email</Label>
                <Input
                  type="email"
                  value={formFields.stripeEmail || ""}
                  onChange={(e) =>
                    setFormFields((f) => ({
                      ...f,
                      stripeEmail: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setShowAddMethod(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddMethod}>Add Method</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(+e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.type}: {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>
              Cancel
            </Button>
            <Button onClick={confirmWithdraw}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
