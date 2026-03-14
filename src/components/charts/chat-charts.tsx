"use client"

import * as React from "react"
import { TrendingUp, GitCommitVertical } from "lucide-react"
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    Radar,
    RadarChart,
    RadialBar,
    RadialBarChart,
    Label,
    LabelList,
    YAxis,
    Cell
} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
]

const chartConfig = {
    desktop: {
        label: "Citations",
        color: "#ff751f",
    },
} satisfies ChartConfig

export function ChartAreaGradient() {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <CardTitle className="text-[16px]">Research Growth</CardTitle>
                <CardDescription className="text-[12px]">Showing citations for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            fontSize={10}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="url(#fillDesktop)"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export function ChartBarMultiple() {
    return (
        <div className="border border-black/5 rounded-[7px] overflow-hidden bg-white shadow-none p-6">
            <ChartContainer config={chartConfig} className="max-h-[300px] w-full px-0">
                <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        fontSize={12}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}

export function ChartPieDonutText() {
    const totalVisitors = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.desktop, 0)
    }, [])

    return (
        <Card className="border-none shadow-none bg-transparent flex flex-col">
            <CardHeader className="items-center pb-0 px-0">
                <CardTitle className="text-[16px]">Publisher Distribution</CardTitle>
                <CardDescription className="text-[12px]">Top 5 Publishers 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 px-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[200px]"
                >
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={chartData}
                            dataKey="desktop"
                            nameKey="browser"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                                    {totalVisitors.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-[10px]">
                                                    Citations
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
