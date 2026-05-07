"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

type Series = { date: string; [key: string]: number | string };

const tickStyle = { fontSize: 11, fill: "#5a5751" };

export function ThemeLineChart({
  data,
  series,
}: {
  data: Series[];
  series: { key: string; label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#ebe4da" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) =>
              new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
            }
            tick={tickStyle}
            stroke="#ebe4da"
            interval="preserveStartEnd"
            minTickGap={48}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={tickStyle}
            stroke="#ebe4da"
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ebe4da",
              background: "#ffffff",
              fontSize: 12,
            }}
            labelFormatter={(d) =>
              new Date(d as string).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VitalsAreaChart({
  data,
}: {
  data: { month: string; resources: number; demands: number; balance: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="g-resources" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#7da88a" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#7da88a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-demands" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#a8c5da" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#a8c5da" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g-balance" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ff6b5b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ff6b5b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ebe4da" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={tickStyle} stroke="#ebe4da" />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={tickStyle} stroke="#ebe4da" width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ebe4da",
              background: "#ffffff",
              fontSize: 12,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="resources" name="Resources" stroke="#7da88a" strokeWidth={2} fill="url(#g-resources)" isAnimationActive={false} />
          <Area type="monotone" dataKey="demands" name="Demands" stroke="#a8c5da" strokeWidth={2} fill="url(#g-demands)" isAnimationActive={false} />
          <Area type="monotone" dataKey="balance" name="Work-life balance" stroke="#ff6b5b" strokeWidth={2} fill="url(#g-balance)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
