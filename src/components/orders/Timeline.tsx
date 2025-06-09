import React from "react";
import {
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  Truck,
  MapPin,
} from "lucide-react";

const Timeline = () => {
  const order = {
    timeline: [
      {
        label: "Order Placed",
        date: "May 15, 2025",
        completed: true,
        icon: "order",
      },
      {
        label: "Payment Confirmed",
        date: "May 15, 2025",
        completed: true,
        icon: "payment",
      },
      {
        label: "Processed",
        date: "Waiting for processing",
        completed: false,
        icon: "process",
      },
      {
        label: "Shipped",
        date: "Not shipped yet",
        completed: false,
        icon: "shipped",
      },
      {
        label: "Delivered",
        date: "Waiting for delivery",
        completed: false,
        icon: "delivered",
      },
    ],
  };

  const getIcon = (iconType, completed) => {
    const iconProps = {
      className: `h-4 w-4 ${completed ? "text-white" : "text-gray-400"}`,
    };

    switch (iconType) {
      case "order":
        return <Package {...iconProps} />;
      case "payment":
        return <CreditCard {...iconProps} />;
      case "process":
        return <Clock {...iconProps} />;
      case "shipped":
        return <Truck {...iconProps} />;
      case "delivered":
        return <MapPin {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h4 className="text-lg font-semibold mb-4">Order Timeline</h4>

      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {order.timeline.map((evt, idx) => (
          <div key={idx} className="relative flex items-start mb-8 last:mb-0">
            {/* Timeline dot with icon */}
            <div
              className={`
              relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 
              ${
                evt.completed
                  ? "bg-red-500 border-red-100 shadow-lg"
                  : "bg-gray-50 border-gray-200"
              }
            `}
            >
              {getIcon(evt.icon, evt.completed)}
            </div>

            {/* Content */}
            <div className="ml-6 flex-1 min-w-0">
              <div
                className={`
                p-4 rounded-lg border-l-4 
                ${
                  evt.completed
                    ? "bg-red-50 border-l-red-500 shadow-sm"
                    : "bg-gray-50 border-l-gray-300"
                }
              `}
              >
                <h5
                  className={`
                  font-semibold text-base mb-1
                  ${evt.completed ? "text-red-900" : "text-gray-600"}
                `}
                >
                  {evt.label}
                </h5>
                <p
                  className={`
                  text-sm 
                  ${evt.completed ? "text-red-700" : "text-gray-500"}
                `}
                >
                  {evt.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
