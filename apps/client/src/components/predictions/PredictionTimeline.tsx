import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
	LineChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	TitleComponent,
	CanvasRenderer,
]);

interface Props {
	predictionId: string;
}

export const PredictionTimeline: FC<Props> = ({ predictionId }) => {
	const API_URL = import.meta.env.VITE_API_URL;
	const [timelineData, setTimelineData] = useState<
		{ date: Date; options: { [option: string]: number } }[]
	>([]);
	const [votesAsPercentage, setVotesAsPercentage] = useState(true);
	const chartElementRef = useRef<HTMLDivElement | null>(null);
	const chartRef = useRef<echarts.EChartsType | null>(null);

	const fetchTimelineData = async (
		intervalMinutes: number,
		votesAsPercentage: boolean,
		fromStart: boolean,
	) => {
		const response = await axios.get(
			`${API_URL}/prediction/${predictionId}/timeline`,
			{
				params: {
					intervalMinutes,
					votesAsPercentage,
					fromStart,
				},
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			},
		);
		setTimelineData(response.data);
		setVotesAsPercentage(votesAsPercentage);
	};

	useEffect(() => {
		fetchTimelineData(10, votesAsPercentage, true);
	}, [API_URL, predictionId, votesAsPercentage]);

	// Init chart once
	useEffect(() => {
		if (!chartElementRef.current) return;
		chartRef.current = echarts.init(chartElementRef.current);
		const onResize = () => chartRef.current?.resize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			chartRef.current?.dispose();
			chartRef.current = null;
		};
	}, []);

	// Update options when data changes
	useEffect(() => {
		if (!chartRef.current) return;

		const optionKeys = Array.from(
			new Set(timelineData.flatMap((item) => Object.keys(item.options))),
		);

		const option: EChartsOption = {
			grid: {
				left: 0,
				right: 0,
				top: 0,
				bottom: 0,
			},
			tooltip: { trigger: "axis" },
			xAxis: {
				type: "category",
				data: timelineData.map((item) => {
					const date = new Date(item.date);
					return `${date.getDate()}/${date.getMonth() + 1}`;
				}),
			},
			yAxis: {
				type: "value",
				position: "right",
				axisLabel: {
					formatter: (value: number) =>
						`${value} ${votesAsPercentage ? "%" : ""}`,
				},
				splitLine: {
					show: true,
					lineStyle: {
						type: [4, 10],
					},
				},
			},
			series: optionKeys.map((key) => ({
				name: key,
				type: "line",
				data: timelineData.map((item) => item.options[key]),
				smooth: true,
				showSymbol: false,
			})),
		};
		chartRef.current.setOption(option);
	}, [timelineData, votesAsPercentage]);

	return (
		<>
			<div
				ref={chartElementRef}
				id="chart"
				style={{ width: "100%", height: "100%" }}
			/>
		</>
	);
};
