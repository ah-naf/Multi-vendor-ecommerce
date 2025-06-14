import React from "react";
import {
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle, // For Cancelled
  PackageCheck, // For Packed
  Navigation, // For Out for Delivery (example, could be Truck again)
  CheckCircle, // Explicitly for completed steps if needed, or use colored circles
} from "lucide-react";

type TimelineEventState = "completed" | "current" | "pending" | "cancelled" | "cancelled_completed";


interface TimelineEvent {
  label: string;
  date: string | null;
  state: TimelineEventState;
  icon: React.ReactNode;
}

interface TimelineProps {
  status: string;
  orderDate: string; // ISO format
  shippedDate?: string; // ISO format, optional
  deliveredDate?: string; // ISO format, optional
  cancelledDate?: string; // ISO format, optional
}

const formatDate = (isoDateString?: string): string => {
  if (!isoDateString) return "N/A";
  try {
    return new Date(isoDateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const Timeline: React.FC<TimelineProps> = ({
  status,
  orderDate,
  shippedDate,
  deliveredDate,
  cancelledDate,
}) => {
  const normalizedStatus = status.toLowerCase();

  const étapesIcon = ( // Renamed to avoid conflict with getIcon prop name if it were a prop
    IconComponent: React.ElementType,
    state: TimelineEventState
  ) => {
    let iconColorClass = "text-gray-400"; // Default for pending
    switch (state) {
      case "completed":
      case "cancelled_completed":
      case "current":
      case "cancelled":
        iconColorClass = "text-white";
        break;
    }
    return <IconComponent className={`h-5 w-5 ${iconColorClass}`} />;
  };

  const definedSteps = [
    {
      key: "Order Placed",
      statusesToComplete: ["processing", "packed", "shipped", "out for delivery", "delivered"],
      dateToUse: orderDate,
      icon: Package,
    },
    {
      key: "Processing",
      statusesToComplete: ["packed", "shipped", "out for delivery", "delivered"],
      dateToUse: orderDate, // Proxy
      icon: Clock,
    },
    {
      key: "Packed",
      statusesToComplete: ["shipped", "out for delivery", "delivered"],
      dateToUse: normalizedStatus === "packed" ? orderDate : shippedDate || orderDate, // Proxy
      icon: PackageCheck,
    },
    {
      key: "Shipped",
      statusesToComplete: ["out for delivery", "delivered"],
      dateToUse: shippedDate,
      icon: Truck,
    },
    {
      key: "Out for Delivery",
      statusesToComplete: ["delivered"],
      dateToUse: deliveredDate || shippedDate, // Proxy
      icon: Navigation,
    },
    {
      key: "Delivered",
      statusesToComplete: [], // Only "delivered" status itself
      dateToUse: deliveredDate,
      icon: MapPin,
    },
  ];

  let timelineEvents: TimelineEvent[] = [];

  if (normalizedStatus === "cancelled" && cancelledDate) {
    definedSteps.forEach((step) => {
      let stepState: TimelineEventState = "pending";
      let eventDate: string | undefined = undefined;

      // Determine if step was completed *before* cancellation
      if (step.key === "Order Placed" && orderDate && new Date(orderDate) < new Date(cancelledDate)) {
        stepState = "cancelled_completed";
        eventDate = orderDate;
      } else if (step.key === "Processing" && orderDate && new Date(orderDate) < new Date(cancelledDate)) {
        // Simplified: if orderDate is before cancelledDate, processing is assumed to have started.
        stepState = "cancelled_completed";
        eventDate = orderDate; // Date of processing start
      } else if (step.key === "Shipped" && shippedDate && new Date(shippedDate) < new Date(cancelledDate)) {
        stepState = "cancelled_completed";
        eventDate = shippedDate;
      } else {
        // For other steps like Packed, Out for Delivery, Delivered, without specific dates before cancellation,
        // they are considered not completed.
        stepState = "pending"; // Or 'cancelled_pending' if a different style is needed
      }
       // If a step was considered completed before cancellation, its date should be shown.
      // Otherwise, it's a step that was made irrelevant by cancellation.
      // All prior steps in a cancelled order are shown as 'greyed out' or 'cancelled context'.

      timelineEvents.push({
        label: step.key,
        date: formatDate(eventDate), // Show date if it was completed pre-cancellation
        state: stepState,
        icon: étapesIcon(step.icon, stepState),
      });
    });

    timelineEvents.push({
      label: "Cancelled",
      date: formatDate(cancelledDate),
      state: "cancelled", // This is the final, active "cancelled" state
      icon: étapesIcon(XCircle, "cancelled"),
    });
  } else {
    // Handle Non-Cancelled Order
    let currentFound = false;
    definedSteps.forEach((step) => {
      let stepState: TimelineEventState = "pending";
      let eventDate: string | undefined = undefined;

      const stepStatusKey = step.key.toLowerCase().replace(/ /g, "");
      const currentOrderStatus = normalizedStatus.replace(/ /g, "");

      if (normalizedStatus === "delivered") {
        stepState = "completed";
        eventDate = step.dateToUse;
         if (step.key === "Delivered" && !deliveredDate) eventDate = orderDate; // Fallback for delivered date
      } else if (stepStatusKey === currentOrderStatus) {
        stepState = "current";
        eventDate = step.dateToUse;
        currentFound = true;
      } else if ( (step.key === "Order Placed" && !!orderDate) || step.statusesToComplete.includes(normalizedStatus)) {
         // Condition for completed:
         // 1. "Order Placed" is always completed if orderDate exists (and not current/delivered)
         // 2. Step is in statusesToComplete for the current normalizedStatus
         //    AND it's not the current step itself (which would be handled above)
         //    AND the order is not yet delivered (which makes everything 'completed')
        if (!currentFound) { // If current step (matching status) hasn't been found yet, this is a past completed step
             stepState = "completed";
             eventDate = step.dateToUse;
        } else { // If current step was already found, subsequent steps are pending
            stepState = "pending";
            eventDate = undefined;
        }
      }
       // Ensure Order Placed is completed if orderDate is there and it's not current/delivered
      if (step.key === "Order Placed" && !!orderDate && stepState !== 'current' && normalizedStatus !== 'delivered') {
        stepState = "completed";
        eventDate = orderDate;
      }
       // If delivered, all steps are completed.
      if (normalizedStatus === "delivered") {
        stepState = "completed";
        eventDate = step.dateToUse;
        if (step.key === "Delivered" && !deliveredDate && shippedDate) eventDate = shippedDate; // Delivered date might be missing, use shipped or orderDate
        else if (step.key === "Delivered" && !deliveredDate && !shippedDate) eventDate = orderDate;
      }


      timelineEvents.push({
        label: step.key,
        date: formatDate(eventDate),
        state: stepState,
        icon: étapesIcon(step.icon, stepState),
      });
    });
  }

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-xl font-semibold mb-6 text-gray-700">Order Timeline</h4>
      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
        {timelineEvents.map((evt, idx) => {
          let dotBgColor = "bg-gray-100"; // Pending
          let dotBorderColor = "border-gray-300";
          let contentBgColor = "bg-gray-50";
          let contentBorderColor = "border-l-gray-300";
          let titleColor = "text-gray-700";
          let dateColor = "text-gray-500";
          let dateText = evt.date || "Pending";

          if (evt.state === "completed") {
            dotBgColor = "bg-green-500"; dotBorderColor = "border-green-100";
            contentBgColor = "bg-green-50"; contentBorderColor = "border-l-green-500";
            titleColor = "text-green-900"; dateColor = "text-green-700";
          } else if (evt.state === "current") {
            dotBgColor = "bg-blue-500"; dotBorderColor = "border-blue-100";
            contentBgColor = "bg-blue-50"; contentBorderColor = "border-l-blue-500";
            titleColor = "text-blue-900"; dateColor = "text-blue-700";
            dateText = evt.date || "In Progress";
          } else if (evt.state === "cancelled") {
            dotBgColor = "bg-red-500"; dotBorderColor = "border-red-100";
            contentBgColor = "bg-red-50"; contentBorderColor = "border-l-red-500";
            titleColor = "text-red-900"; dateColor = "text-red-700";
            dateText = evt.date || "";
          } else if (evt.state === "cancelled_completed") {
            dotBgColor = "bg-gray-400"; dotBorderColor = "border-gray-200"; // Greyed out completed
            contentBgColor = "bg-gray-100"; contentBorderColor = "border-l-gray-400";
            titleColor = "text-gray-600"; dateColor = "text-gray-500";
            dateText = evt.date || "";
          } else { // Pending for non-cancelled, or steps after cancellation point for cancelled orders
             if (normalizedStatus === "cancelled") { // Steps that were not completed before cancellation
                dotBgColor = "bg-gray-100"; dotBorderColor = "border-gray-300";
                contentBgColor = "bg-gray-50"; contentBorderColor = "border-l-gray-300";
                titleColor = "text-gray-400 line-through"; dateColor = "text-gray-400";
                dateText = " "; // Indicate it was skipped/cancelled
             }
          }

          return (
            <div key={idx} className="relative flex items-start mb-8 last:mb-0">
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg ${dotBgColor} ${dotBorderColor}`}>
                {evt.icon}
              </div>
              <div className="ml-6 flex-1 min-w-0">
                <div className={`p-4 rounded-lg border-l-4 shadow-sm ${contentBgColor} ${contentBorderColor}`}>
                  <h5 className={`font-semibold text-base mb-1 ${titleColor}`}>
                    {evt.label}
                  </h5>
                  <p className={`text-sm ${dateColor}`}>
                    {dateText}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
