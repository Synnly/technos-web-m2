import type { FC } from "react";
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { type EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { TimelineDataPoint } from "../../modules/prediction/prediction.interface";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, CanvasRenderer]);

interface Props {
	votesAsPercentage: boolean;
	timelineData: Array<TimelineDataPoint>;
}

export const PredictionTimeline: FC<Props> = ({ votesAsPercentage, timelineData }) => {
	const chartElementRef = useRef<HTMLDivElement | null>(null);
	const chartRef = useRef<echarts.EChartsType | null>(null);

	// Init chart once
	useEffect(() => {
		if (!chartElementRef.current) return;
		chartRef.current = echarts.init(chartElementRef.current);
		const onResize = () => chartRef.current?.resize();
		window.addEventListener("resize", onResize);

		const resizeObserver = new ResizeObserver(() => chartRef.current?.resize());
		resizeObserver.observe(chartElementRef.current);

		return () => {
			window.removeEventListener("resize", onResize);
			resizeObserver.disconnect();
			chartRef.current?.dispose();
			chartRef.current = null;
		};
	}, []);

	// Update options when data changes
	useEffect(() => {
		if (!chartRef.current || !timelineData) return;

		const optionKeys = Array.from(new Set(timelineData.flatMap((item) => Object.keys(item.options))));

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
					formatter: (value: number) => `${value} ${votesAsPercentage ? "%" : ""}`,
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
			<div ref={chartElementRef} id="chart" style={{ width: "100%", height: "100%" }} />
		</>
	);
};
