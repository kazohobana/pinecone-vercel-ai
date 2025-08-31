import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface FundsChartProps {
  data: Array<{ name: string; raised: number }>;
}

export default function FundsChart({ data }: FundsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          label: 'Funds Raised (USD)',
          data: data.map(item => item.raised),
          backgroundColor: 'hsl(217, 91%, 60%)',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(223, 47%, 16%)'
            },
            ticks: {
              color: 'hsl(213, 31%, 91%)',
              callback: function(value) {
                return '$' + (value as number).toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'hsl(213, 31%, 91%)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative h-64">
      <canvas ref={chartRef} data-testid="chart-funds"></canvas>
    </div>
  );
}
