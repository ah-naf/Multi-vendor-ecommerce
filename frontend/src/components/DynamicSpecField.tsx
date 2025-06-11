import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { toast } from "sonner"; // Added toast

// --- Dynamic Spec Field ---
export const DynamicSpecField = ({ spec, onUpdate, onRemove }) => {
  const renderField = () => {
    switch (spec.type) {
      case "textarea":
        return (
          <Textarea
            value={spec.value}
            onChange={(e) => onUpdate(spec.id, "value", e.target.value)}
            rows={3}
          />
        );
      case "number":
      case "date":
      case "text":
      default:
        return (
          <Input
            type={spec.type}
            value={spec.value}
            onChange={(e) => onUpdate(spec.id, "value", e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border rounded-lg bg-gray-50/50">
      <div className="flex-1 space-y-2">
        <Label className="font-semibold">{spec.label}</Label>
        {renderField()}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-red-500"
        onClick={() => onRemove(spec.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// --- Add Spec Dialog ---
export const AddSpecDialog = ({ onAdd }) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");

  const handleAdd = () => {
    if (!label.trim()) {
      toast.error("Please enter a field label."); // Replaced alert with toast
      return;
    }
    onAdd({
      id: `spec_${Date.now()}`,
      label,
      type,
      value: "",
    });
    setLabel("");
    setType("text");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add another specification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Specification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="spec-label">Field Label</Label>
            <Input
              id="spec-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Color, Material, Warranty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spec-type">Field Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="spec-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>Add Field</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
