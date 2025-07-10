"use client";

import * as React from "react";
import axios from "axios";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;


type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

type ChartPoint = {
  date: string;
  [key: string]: number | string;
};

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function ChartProjectOverview() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartPoint[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    axios
      .get(`${API_BASE_URL}/dashboard`)
      .then((res) => {
        const { charConfig, dataValues } = res.data;

        // Converte o objeto dataValues em array ordenado por data
        const dataArray = (Object.values(dataValues) as ChartPoint[]).sort(
          (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
        );

        console.log(dataArray)

        setChartData(dataArray);
        setChartConfig(charConfig);
      })
      .catch((err) => {
        console.error("Erro ao carregar gráfico:", err);
      });
  }, []);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date as string);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  const dataKeys = Object.keys(chartConfig);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Total for the selected period</span>
          <span className="@[540px]/card:hidden">Last period</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex">
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full lg:h-[250px]">
          <AreaChart data={filteredData}>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient
                  key={key}
                  id={`fill${capitalizeFirstLetter(key.replace(/\s+/g, ""))}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric"
                });
              }}
            />

            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric"
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {dataKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill${capitalizeFirstLetter(key.replace(/\s+/g, ""))})`}
                stroke={chartConfig[key].color}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
