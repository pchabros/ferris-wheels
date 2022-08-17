import {
  axisBottom,
  axisLeft,
  axisRight,
  extent,
  max,
  scaleBand,
  scaleLinear,
  select,
  BaseType,
  interpolateRound,
} from "d3";
import { uniq } from "ramda";
import { FC, useEffect, useRef, useState } from "react";
import { Data } from "../types";
import "./Plot.css";

interface PlotProps {
  data: Data[];
}

const width = 950;
const height = 500;
const margin = {
  top: 40,
  right: 160,
  bottom: 60,
  left: 90,
};
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;

const Plot: FC<PlotProps> = ({ data }) => {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const sizeAxisRef = useRef<SVGGElement>(null);
  const [circles, setCircles] = useState<JSX.Element[]>([]);
  const [legend, setLegend] = useState<JSX.Element[]>([]);
  useEffect(() => {
    const xDomain = extent(data, ({ seating_capacity }) => seating_capacity);
    const xScale = scaleLinear(xDomain as [number, number], [
      0,
      plotWidth,
    ]).nice();
    const xAxis = axisBottom(xScale).tickSize(-plotHeight);
    select(xAxisRef.current!).call(xAxis);
    const yDomain = uniq(data.map(({ country }) => country)).sort();
    const biggest = yDomain.map((y) => {
      const biggest = data
        .sort((a, b) => b.seating_capacity! - a.seating_capacity!)
        .find((d) => d.country === y)?.seating_capacity;
      return {
        country: y,
        seating_capacity: biggest,
      };
    });
    const yDomainSorted = biggest
      .sort((a, b) => b.seating_capacity! - a.seating_capacity!)
      .map((d) => d.country);
    const yScale = scaleBand(yDomainSorted as string[], [0, plotHeight]);
    const yAxis = axisLeft(yScale).tickSize(-plotWidth).tickSizeOuter(0);
    select(yAxisRef.current!).call(yAxis);
    const sizeMax = max(data, ({ diameter }) => diameter);
    const sizeScale = scaleLinear([0, sizeMax!], [0, 70]);
    const sizeAxis = axisRight(sizeScale)
      .tickValues([0, 175, 350, 525, 700])
      .tickSize(40);
    select(sizeAxisRef.current!).call(sizeAxis);
    const circles = data.map(({ country, seating_capacity, diameter }, i) => (
      <circle
        key={`{country}-${i}`}
        cx={xScale(seating_capacity!)}
        cy={yScale(country!)! + +yScale.bandwidth() / 2}
        r={sizeScale(diameter!) / 2}
        fill="white"
        opacity="0.4"
        stroke="black"
        strokeWidth="0.9"
        onMouseEnter={(e) => {
          const hovered = select(e.target as BaseType);
          hovered.transition().attr("stroke-width", 1.5);
          const hoveredR = hovered.attr("r");
          select("#hovered-diameter")
            .transition()
            .duration(400)
            .attr("opacity", 1)
            .attr("transform", "translate(0, 90)")
            .textTween(() => {
              const value = Math.round(sizeScale.invert(+hoveredR) * 2);
              const i = interpolateRound(0, value);
              return (t: number) => i(t).toString();
            });
          select("#legend-hovered")
            .transition()
            .attr("r", hoveredR)
            .attr("cy", hoveredR);
        }}
        onMouseLeave={(e) => {
          select(e.target as BaseType)
            .transition()
            .attr("stroke-width", 0.9);
          select("#hovered-diameter")
            .transition()
            .duration(400)
            .attr("opacity", 0)
            .attr("transform", "translate(0, 80)")
            .textTween(() => {
              const current = select("#hovered-diameter").text();
              const i = interpolateRound(+current, 0);
              return (t: number) => i(t).toString();
            });
          select("#legend-hovered").transition().attr("r", 0).attr("cy", 0);
        }}
      />
    ));
    setCircles(circles);
    const legend = [0, 175, 350, 525, 700].map((d) => (
      <circle
        key={d}
        cy={sizeScale(d) / 2}
        r={sizeScale(d) / 2}
        fill="transparent"
        opacity="0.5"
        stroke="black"
        strokeWidth={d === 0 ? 1.2 : 0.4}
        id={d === 0 ? "legend-hovered" : ""}
      />
    ));
    setLegend(legend);
  }, [data]);
  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <g
          className="x-axis"
          ref={xAxisRef}
          transform={`translate(0, ${plotHeight})`}
        >
          <text
            className="axis-title"
            transform={`translate(${plotWidth / 2}, ${40})`}
          >
            Seating Capacity
          </text>
        </g>
        <g className="y-axis" ref={yAxisRef}></g>
        <g>{circles}</g>
      </g>
      <g
        transform={`translate(${width - margin.right * 0.55}, ${
          plotHeight / 2
        })`}
      >
        <text className="legend-title">Diameter [ft]</text>
        {legend}
        <g className="size-axis" ref={sizeAxisRef}></g>
        <text id="hovered-diameter" transform="translate(0, 80)"></text>
      </g>
    </svg>
  );
};

export default Plot;
