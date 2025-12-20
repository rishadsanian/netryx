import { useState, useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import "./Exhibit.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// const {labels, displayLatency} = PacketLatency();

const LatencyChart = ({ labels, displayLatency }) => {
  const chartRef = useRef();

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: {
          unit: "second",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Latency Chart",
        color: "#00BCEB",
        font: "Courier New",
      },
    },
  };

  const data = useMemo(
    () => ({
      datasets: [
        {
          label: "Latency",
          data: displayLatency.map((y, i) => ({ x: new Date(labels[i]), y })),
          fill: false,
          borderColor: "#00BCEB",
          backgroundColor: "rgba(0, 188, 235, 0.5)",
        },
      ],
    }),
    [labels, displayLatency]
  );

  useEffect(() => {
    // console.log("Chart data updated:", data);
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [data]);

  return (
    <div className="chart" style={{ width: "70%" }}>
      <Line ref={chartRef} options={options} data={data} />
    </div>
  );
};

export default LatencyChart;
