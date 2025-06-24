import React from 'react';
import { FaBox, FaCheck, FaTruck, FaShippingFast, FaTimesCircle } from 'react-icons/fa';

const steps = [
  { key: 'ordered', label: 'Ordered', icon: <FaBox /> },
  { key: 'confirmed', label: 'Confirmed', icon: <FaCheck /> },
  { key: 'shipped', label: 'Shipped', icon: <FaTruck /> },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: <FaShippingFast /> },
  { key: 'delivered', label: 'Delivered', icon: <FaCheck /> },
  { key: 'cancelled', label: 'Cancelled', icon: <FaTimesCircle /> },
];

// Map Shopify/your status to stepper keys
const statusMap = {
  pending: 'ordered',
  confirmed: 'confirmed',
  paid: 'confirmed',
  processing: 'confirmed',
  shipped: 'shipped',
  in_transit: 'out_for_delivery',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  fulfilled: 'delivered',
  cancelled: 'cancelled',
};

const getCurrentStepIndex = (status) => {
  const mapped = statusMap[(status || '').toLowerCase()] || 'ordered';
  return steps.findIndex((s) => s.key === mapped);
};

const getStepColor = (stepIdx, lastIdx, cancelled) => {
  if (cancelled && stepIdx === steps.length - 1) return 'text-red-500 border-red-500 bg-red-100';
  if (stepIdx < lastIdx) return 'text-green-600 border-green-600 bg-green-100';
  if (stepIdx === lastIdx) return cancelled ? 'text-gray-400 border-gray-300 bg-gray-100' : 'text-blue-600 border-blue-600 bg-blue-100';
  return 'text-gray-400 border-gray-300 bg-gray-100';
};

/**
 * Props:
 * - currentStatus: string (the current status, e.g. 'shipped', 'cancelled')
 * - lastStatus: string (the last real status before cancellation, e.g. 'confirmed')
 */
const DeliveryStatusStepper = ({ currentStatus, lastStatus }) => {
  const cancelled = (statusMap[(currentStatus || '').toLowerCase()] === 'cancelled');
  // If cancelled, use lastStatus to determine how far to highlight
  const lastIdx = cancelled && lastStatus
    ? getCurrentStepIndex(lastStatus)
    : getCurrentStepIndex(currentStatus);
  const visibleSteps = steps.slice(0, cancelled ? steps.length : steps.length - 1);

  return (
    <div className="w-full py-4">
      {/* Stepper Line */}
      <div className="flex items-center w-full mb-2">
        {visibleSteps.map((_, idx) => (
          idx < visibleSteps.length - 1 ? (
            <div key={idx} className="flex-1 h-1"
              style={{
                background: idx < lastIdx ? '#22c55e' : '#e5e7eb', // green-400 or gray-200
                marginLeft: idx === 0 ? '50%' : 0,
                marginRight: idx === visibleSteps.length - 2 ? '50%' : 0,
              }}
            />
          ) : null
        ))}
      </div>
      {/* Stepper Icons and Labels */}
      <div className="flex items-center w-full">
        {visibleSteps.map((step, idx) => (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-1 z-10 ${getStepColor(idx, lastIdx, cancelled)}`}>
              {step.icon}
            </div>
            <span className={`text-xs font-medium ${idx <= lastIdx && !cancelled ? 'text-blue-700' : 'text-gray-400'}`}>{step.label}</span>
          </div>
        ))}
        {cancelled && (
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 mb-1 text-red-500 border-red-500 bg-red-100 z-10">
              <FaTimesCircle />
            </div>
            <span className="text-xs font-medium text-red-500">Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryStatusStepper; 