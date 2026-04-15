import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with no separator";

const chartData = [
  { country: "France", visitors: 39.11, fill: "var(--color-france)" },
  { country: "Belgique", visitors: 28.02, fill: "var(--color-belgique)" },
  { country: "USA", visitors: 23.13, fill: "var(--color-usa)" },
  { country: "Spain", visitors: 5.03, fill: "var(--color-spain)" },
  { country: "Autre", visitors: 4.71, fill: "var(--color-autre)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  france: {
    label: "France",
    color: "var(--chart-1)",
  },
  belgique: {
    label: "Belgique",
    color: "var(--chart-2)",
  },
  usa: {
    label: "USA",
    color: "var(--chart-3)",
  },
spain: {
    label: "Spain",
    color: "var(--chart-4)",
  },
  autre: {
    label: "Autre",
    color: "var(--chart-5)",
  },
};

export function ChartPieSeparatorNone() {
  return (
    <Card className="flex flex-col p-0 m-0 border-0 shadow-none">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="country"
              stroke="0"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
