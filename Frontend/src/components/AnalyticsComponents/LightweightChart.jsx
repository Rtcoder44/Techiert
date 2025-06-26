import React, { useRef, useEffect } from 'react';

const LightweightChart = ({ data, type = 'bar', title, height = 300, color = '#E7000B' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max values
    const values = data.map(d => d.value || d.views || d.blogs || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(rect.width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }

    // Draw data
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    data.forEach((item, index) => {
      const value = item.value || item.views || item.blogs || 0;
      const normalizedValue = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
      
      if (type === 'bar') {
        const x = padding + (chartWidth / data.length) * index + barSpacing / 2;
        const barHeight = normalizedValue;
        const y = height - padding - barHeight;

        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw value label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

        // Draw x-axis label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.fillText(item.label || item.date || item.month || '', x + barWidth / 2, height - padding + 15);
      } else if (type === 'line') {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = height - padding - normalizedValue;

        if (index === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Draw value label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x, y - 10);

        // Draw x-axis label
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.fillText(item.label || item.date || item.month || '', x, height - padding + 15);
      }
    });

    if (type === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [data, type, height, color]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
      />
    </div>
  );
};

export default LightweightChart; 