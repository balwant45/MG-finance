import React from "react";
import Chart from "react-apexcharts";

const ExpensePieChart = () => {
  // The data values for the chart
  const series = [12000, 30000, 1500, 800, 900];

  // The configuration options
  const options = {
    labels: ["Rent", "Salaries", "Utilities", "Supplies", "Travel"],
    chart: {
      type: "pie",
    },
    colors: ["#2196F3", "#4CAF50", "#FFC107", "#F44336", "#9C27B0"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
  };

  return (
    <div className="chart-container" style={{ padding: "20px", background: "#fff", borderRadius: "8px" }}>
      <h3>Category Breakdown</h3>
      <Chart 
        options={options} 
        series={series} 
        type="pie" 
        width="380" 
        height="220"
      />
    </div>
  );
};

export default ExpensePieChart;