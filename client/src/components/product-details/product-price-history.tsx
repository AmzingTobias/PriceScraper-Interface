import { ActiveElement, ChartEvent, ChartOptions, TooltipItem } from "chart.js";
import { Line } from "react-chartjs-2";
import { tPriceEntry } from "../../../../server/models/price.models";

interface IProductPriceHistoryProps {
  prices: tPriceEntry[];
}

const ProductPriceHistory: React.FC<IProductPriceHistoryProps> = ({
  prices,
}) => {
  const chartData = {
    labels:
      prices.length > 0 ? prices.map((priceEntry) => priceEntry.Date) : [],
    datasets: [
      {
        stepped: true,
        label: "Price",
        data:
          prices.length > 0 ? prices.map((priceEntry) => priceEntry.Price) : [],
        fill: false,
        borderColor: "rgb(34, 197, 94)",
      },
    ],
  };

  const handleClick = (
    event: ChartEvent,
    chartElements: ActiveElement[]
  ): void => {
    if (chartElements.length > 0) {
      if (prices.length > 0) {
        window.open(prices[chartElements[0].datasetIndex].Site_link, "_blank");
      }
    }
  };

  const chartOptions: ChartOptions<"line"> = {
    scales: {
      x: {
        grid: {
          color: "rgba(229, 229, 229, 0.2)",
        },
        ticks: {
          font: {
            family: "Work Sans",
            size: 12,
          },
          color: "rgb(229, 229, 229)",
        },
      },
      y: {
        type: "linear",
        grid: {
          color: "rgba(229, 229, 229, 0.2)",
        },
        beginAtZero: true,
        ticks: {
          font: {
            family: "Work Sans",
            size: 16,
          },
          color: "rgb(229, 229, 229)",
          callback: (value, index, values) => {
            // Format the value as currency with the appropriate symbol
            return "£" + value;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"line">): string => {
            return `${prices[tooltipItem.dataIndex].Site_link}\n£${
              tooltipItem.formattedValue
            }`;
          },
        },
      },
      legend: {
        display: false,
        labels: {
          color: "rgB(229, 229, 229)",
        },
      },
    },
    onClick: handleClick,
  };

  return (
    <div>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default ProductPriceHistory;
