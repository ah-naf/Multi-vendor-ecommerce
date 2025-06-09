"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface Props {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function CancelOrderDialog({
  orderId,
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle>Cancel Order?</DialogTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Are you sure you want to cancel this order? The customer will be
            notified and the order will be marked as cancelled.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Enter reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="border rounded-lg p-4 bg-gray-50 text-sm">
            <p className="text-gray-600">Order Summary</p>
            <div className="mt-1 flex justify-between">
              <span>Order ID:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Order
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => onConfirm(reason)}
          >
            Cancel Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
