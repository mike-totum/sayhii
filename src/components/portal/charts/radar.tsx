"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export function SubThemeRadar({
  data,
}: {
  data: { name: string; you: number; org: number }[];
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
          <PolarGrid stroke="#ebe4da" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#0f1117" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ebe4da",
              background: "#ffffff",
              fontSize: 12,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Radar
            name="Organization"
            dataKey="org"
            stroke="#0f1117"
            strokeOpacity={0.4}
            fill="#0f1117"
            fillOpacity={0.05}
            isAnimationActive={false}
          />
          <Radar
            name="You / your group"
            dataKey="you"
            stroke="#ff6b5b"
            fill="#ff6b5b"
            fillOpacity={0.22}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
