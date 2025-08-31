import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function TokenomicsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ICO Sale', 'Team & Development', 'Ecosystem & Rewards', 'Marketing & Partners', 'Reserve Fund'],
        datasets: [{
          data: [30, 20, 25, 15, 10],
          backgroundColor: [
            'hsl(217, 91%, 60%)',
            'hsl(263, 70%, 65%)',
            'hsl(142, 71%, 45%)',
            'hsl(25, 95%, 53%)',
            'hsl(262, 83%, 58%)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'hsl(213, 31%, 91%)',
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
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
  }, []);

  return (
    <div className="relative h-80">
      <canvas ref={chartRef} data-testid="chart-tokenomics"></canvas>
    </div>
  );
}
