"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";

export interface Order {
  id: string;
}

interface ShipOrderDialogProps {
  order: Order;
  /** control externally */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShipOrderDialog({
  order,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ShipOrderDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;

  // sync local with controlled (if they switch quickly)
  useEffect(() => {
    if (isControlled) setLocalOpen(controlledOpen!);
  }, [controlledOpen]);

  const open = isControlled ? controlledOpen! : localOpen;
  const setOpen =
    isControlled && controlledOnOpenChange
      ? controlledOnOpenChange
      : setLocalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* trigger must be a child when uncontrolled */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Truck className="mr-1 h-4 w-4" /> Ship
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6 text-blue-500" />
            <DialogTitle>Ship Order?</DialogTitle>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Are you ready to mark <strong>{order.id}</strong> as shipped? The
            customer will be notified.
          </p>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // your ship logic here
              setOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
