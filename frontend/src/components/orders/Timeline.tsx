import React from "react";
import {
  Clock,
  Package,
  Truck,
  MapPin,
  XCircle,
  PackageCheck,
  Navigation,
} from "lucide-react";

type TimelineEventState =
  | "completed"
  | "current"
  | "pending"
  | "cancelled"
  | "cancelled_completed";

interface TimelineEvent {
  label: string;
  date: string | null;
  state: TimelineEventState;
  icon: React.ReactNode;
}

interface TimelineProps {
  status: string;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  cancelledDate?: string;
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

  const étapesIcon = (
    IconComponent: React.ElementType,
    state: TimelineEventState
  ) => {
    let iconColorClass = "text-gray-400";
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
      statusesToComplete: [
        "processing",
        "packed",
        "shipped",
        "out for delivery",
        "delivered",
      ],
      dateToUse: orderDate,
      icon: Package,
    },
    {
      key: "Processing",
      statusesToComplete: [
        "packed",
        "shipped",
        "out for delivery",
        "delivered",
      ],
      dateToUse: orderDate,
      icon: Clock,
    },
    {
      key: "Packed",
      statusesToComplete: ["shipped", "out for delivery", "delivered"],
      dateToUse:
        normalizedStatus === "packed" ? orderDate : shippedDate || orderDate,
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
      dateToUse: deliveredDate || shippedDate,
      icon: Navigation,
    },
    {
      key: "Delivered",
      statusesToComplete: [],
      dateToUse: deliveredDate,
      icon: MapPin,
    },
  ];

  const timelineEvents: TimelineEvent[] = [];

  if (normalizedStatus === "cancelled" && cancelledDate) {
    definedSteps.forEach((step) => {
      let stepState: TimelineEventState = "pending";
      let eventDate: string | undefined = undefined;

      if (
        step.key === "Order Placed" &&
        orderDate &&
        new Date(orderDate) < new Date(cancelledDate)
      ) {
        stepState = "cancelled_completed";
        eventDate = orderDate;
      } else if (
        step.key === "Processing" &&
        orderDate &&
        new Date(orderDate) < new Date(cancelledDate)
      ) {
        stepState = "cancelled_completed";
        eventDate = orderDate;
      } else if (
        step.key === "Shipped" &&
        shippedDate &&
        new Date(shippedDate) < new Date(cancelledDate)
      ) {
        stepState = "cancelled_completed";
        eventDate = shippedDate;
      } else {
        stepState = "pending";
      }

      timelineEvents.push({
        label: step.key,
        date: formatDate(eventDate),
        state: stepState,
        icon: étapesIcon(step.icon, stepState),
      });
    });

    timelineEvents.push({
      label: "Cancelled",
      date: formatDate(cancelledDate),
      state: "cancelled",
      icon: étapesIcon(XCircle, "cancelled"),
    });
  } else {
    let currentFound = false;
    definedSteps.forEach((step) => {
      let stepState: TimelineEventState = "pending";
      let eventDate: string | undefined = undefined;

      const stepStatusKey = step.key.toLowerCase().replace(/ /g, "");
      const currentOrderStatus = normalizedStatus.replace(/ /g, "");

      if (normalizedStatus === "delivered") {
        stepState = "completed";
        eventDate = step.dateToUse;
        if (step.key === "Delivered" && !deliveredDate) eventDate = orderDate;
      } else if (stepStatusKey === currentOrderStatus) {
        stepState = "current";
        eventDate = step.dateToUse;
        currentFound = true;
      } else if (
        (step.key === "Order Placed" && !!orderDate) ||
        step.statusesToComplete.includes(normalizedStatus)
      ) {
        if (!currentFound) {
          stepState = "completed";
          eventDate = step.dateToUse;
        } else {
          stepState = "pending";
          eventDate = undefined;
        }
      }

      if (
        step.key === "Order Placed" &&
        !!orderDate &&
        stepState !== "current" &&
        normalizedStatus !== "delivered"
      ) {
        stepState = "completed";
        eventDate = orderDate;
      }
      if (normalizedStatus === "delivered") {
        stepState = "completed";
        eventDate = step.dateToUse;
        if (step.key === "Delivered" && !deliveredDate && shippedDate)
          eventDate = shippedDate;
        else if (step.key === "Delivered" && !deliveredDate && !shippedDate)
          eventDate = orderDate;
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
      <h4 className="text-xl font-semibold mb-6 text-gray-700">
        Order Timeline
      </h4>
      <div className="relative">
        <div className="absolute left-[23px] top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
        {timelineEvents.map((evt, idx) => {
          let dotBgColor = "bg-gray-100";
          let dotBorderColor = "border-gray-300";
          let contentBgColor = "bg-gray-50";
          let contentBorderColor = "border-l-gray-300";
          let titleColor = "text-gray-700";
          let dateColor = "text-gray-500";
          let dateText = evt.date || "Pending";

          if (evt.state === "completed") {
            dotBgColor = "bg-green-500";
            dotBorderColor = "border-green-100";
            contentBgColor = "bg-green-50";
            contentBorderColor = "border-l-green-500";
            titleColor = "text-green-900";
            dateColor = "text-green-700";
          } else if (evt.state === "current") {
            dotBgColor = "bg-blue-500";
            dotBorderColor = "border-blue-100";
            contentBgColor = "bg-blue-50";
            contentBorderColor = "border-l-blue-500";
            titleColor = "text-blue-900";
            dateColor = "text-blue-700";
            dateText = evt.date || "In Progress";
          } else if (evt.state === "cancelled") {
            dotBgColor = "bg-red-500";
            dotBorderColor = "border-red-100";
            contentBgColor = "bg-red-50";
            contentBorderColor = "border-l-red-500";
            titleColor = "text-red-900";
            dateColor = "text-red-700";
            dateText = evt.date || "";
          } else if (evt.state === "cancelled_completed") {
            dotBgColor = "bg-gray-400";
            dotBorderColor = "border-gray-200";
            contentBgColor = "bg-gray-100";
            contentBorderColor = "border-l-gray-400";
            titleColor = "text-gray-600";
            dateColor = "text-gray-500";
            dateText = evt.date || "";
          } else {
            if (normalizedStatus === "cancelled") {
              dotBgColor = "bg-gray-100";
              dotBorderColor = "border-gray-300";
              contentBgColor = "bg-gray-50";
              contentBorderColor = "border-l-gray-300";
              titleColor = "text-gray-400 line-through";
              dateColor = "text-gray-400";
              dateText = " ";
            }
          }

          return (
            <div key={idx} className="relative flex items-start mb-8 last:mb-0">
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg ${dotBgColor} ${dotBorderColor}`}
              >
                {evt.icon}
              </div>
              <div className="ml-6 flex-1 min-w-0">
                <div
                  className={`p-4 rounded-lg border-l-4 shadow-sm ${contentBgColor} ${contentBorderColor}`}
                >
                  <h5 className={`font-semibold text-base mb-1 ${titleColor}`}>
                    {evt.label}
                  </h5>
                  <p className={`text-sm ${dateColor}`}>{dateText}</p>
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
