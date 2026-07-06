import React, { useMemo } from "react";
import Chart from "react-apexcharts";

// 1. Accept the 'expenses' array as a prop
const ExpensePieChart = ({ expenses = [] }) => {
  
  // 2. Dynamically calculate totals whenever 'expenses' changes
  const chartData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      // Group by category and sum the amounts
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryTotals),   // e.g., ["Rent", "Salaries"]
      series: Object.values(categoryTotals), // e.g., [12000, 30000]
    };
  }, [expenses]);

  // 3. Update the configuration to use the dynamic data
  const options = {
    labels: chartData.labels, // Use dynamic labels
    chart: {
      type: "pie",
    },
    // ApexCharts will automatically assign these colors to your categories
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
      {/* 4. Handle empty data state cleanly */}
      {expenses.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No expense data available</p>
      ) : (
        <Chart 
          options={options} 
          series={chartData.series} // Use dynamic series
          type="pie" 
          width="380" 
          height="220"
        />
      )}
    </div>
  );
};

export default ExpensePieChart;