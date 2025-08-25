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
import { useAuth } from "@/contexts/AuthContext";

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

// Função para adicionar um dia à data e formatar
const adjustAndFormatDate = (value: string) => {
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      console.warn('Data inválida:', value);
      return value;
    }
    
    // Adiciona um dia para compensar o fuso horário
    date.setDate(date.getDate() + 1);
    
    return date.toLocaleDateString("pt-BR", {
      month: "short",
      day: "numeric"
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error, value);
    return value;
  }
};

export function ChartProjectOverview() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<ChartPoint[]>([]);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});
  const { token } = useAuth();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    axios
      .get(`${API_BASE_URL}/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        const { charConfig, dataValues } = res.data;

        // Converte o objeto dataValues em array e ordena por data
        const dataArray = Object.values(dataValues) as ChartPoint[];
        
        const sortedData = dataArray.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        console.log('Dados carregados:', sortedData);
        setChartData(sortedData);
        setChartConfig(charConfig);
      })
      .catch((err) => {
        console.error("Erro ao carregar gráfico:", err);
      });
  }, [token]);

  const filteredData = chartData.filter((item) => {
    if (!item.date) return false;
    
    const itemDate = new Date(item.date);
    if (isNaN(itemDate.getTime())) return false;

    const today = new Date();
    let cutoffDate = new Date();
    
    if (timeRange === "90d") cutoffDate.setDate(today.getDate() - 90);
    else if (timeRange === "30d") cutoffDate.setDate(today.getDate() - 30);
    else if (timeRange === "7d") cutoffDate.setDate(today.getDate() - 7);

    cutoffDate.setHours(0, 0, 0, 0);

    return itemDate >= cutoffDate;
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
              tickFormatter={adjustAndFormatDate}
            />

            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    if (typeof value === 'string' && value.includes('-')) {
                      return adjustAndFormatDate(value);
                    }
                    return String(value);
                  }}
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