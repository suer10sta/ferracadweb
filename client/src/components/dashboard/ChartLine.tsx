import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useLanguage } from "@/lang/LanguageProvider"

export const description = "A multiple line chart"

export function ChartLineMultiple({ chartData }: any) {
  const { t } = useLanguage();

  const chartConfig = {
    download: {
      label: t("dashboardAdmin_download"),
      color: "var(--chart-1)",
    },
    amount: {
      label: t("dashboardAdmin_amount"),
      color: "var(--chart-4)",
    },
  }

  return (
    <Card className="p-0 border-0 shadow-none">
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="download"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={4}
              dot={false}
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--chart-4)"
              strokeWidth={4}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
