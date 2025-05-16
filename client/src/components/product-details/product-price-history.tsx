import { ActiveElement, ChartEvent, ChartOptions, TooltipItem } from "chart.js";
import { Line } from "react-chartjs-2";
import { tPriceEntry } from "../../../../server/models/price.models";

interface IProductPriceHistoryProps {
  prices: tPriceEntry[];
}

type tDailyLowest = {
  date: string;
  price: number;
};

function getDailyLowestPrices(data: tPriceEntry[]): tDailyLowest[] {
  const dailyMap: Record<string, number[]> = {};

  for (const point of data) {
    const dateObj = new Date(point.Date * 1000);
    const date = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    if (!dailyMap[date]) {
      dailyMap[date] = [];
    }
    dailyMap[date].push(point.Price);
  }

  const result: tDailyLowest[] = Object.entries(dailyMap).map(([date, prices]) => ({
    date,
    price: Math.min(...prices),
  }));

  return result;
}

const ProductPriceHistory: React.FC<IProductPriceHistoryProps> = ({
  prices,
}) => {

  const preprocessedChartData = getDailyLowestPrices(prices);

  const chartData = {
    labels: preprocessedChartData.map(d => d.date),
    datasets: [
      {
        stepped: true,
        label: "Price",
        data: preprocessedChartData.map(d => d.price),
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
    responsive: true,
    maintainAspectRatio: false,
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
            return `${prices[tooltipItem.dataIndex].Site_link}\n£${tooltipItem.formattedValue
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
    <>
      <Line data={chartData} options={chartOptions} />
    </>
  );
};

export default ProductPriceHistory;
