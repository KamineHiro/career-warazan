"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { RouteResult } from "@/lib/calculator";
import { REGION_LABELS } from "@/data/wageData";

type ChartMode = "gross" | "net" | "disposable";

interface Props {
  results: RouteResult[];
  mode: ChartMode;
}

const MODE_LABELS: Record<ChartMode, string> = {
  gross: "額面年収",
  net: "手取り年収",
  disposable: "可処分所得（手取り−生活費）",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-2">{label}歳</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{p.value.toLocaleString()}万円</span>
        </div>
      ))}
    </div>
  );
};

export default function CompareChart({ results, mode }: Props) {
  if (results.length === 0) return null;

  const allAges = Array.from(
    new Set(results.flatMap((r) => r.yearly.map((y) => y.age))),
  ).sort((a, b) => a - b);

  const chartData = allAges.map((age) => {
    const row: Record<string, number | string> = { age };
    results.forEach((r) => {
      const y = r.yearly.find((d) => d.age === age);
      if (y) {
        const val = mode === "gross" ? y.grossIncome : mode === "net" ? y.netIncome : y.disposable;
        row[r.route.id] = val;
        row[`${r.route.id}_region`] = REGION_LABELS[y.region];
      }
    });
    return row;
  });

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-2 text-right">{MODE_LABELS[mode]}（万円/年）</p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            tickFormatter={(v) => `${v}歳`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => `${v}`}
            tick={{ fontSize: 12 }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const r = results.find((r) => r.route.id === value);
              return r?.route.name ?? value;
            }}
          />
          <ReferenceLine y={0} stroke="#e5e7eb" />
          {results.map((r) => (
            <Line
              key={r.route.id}
              type="monotone"
              dataKey={r.route.id}
              name={r.route.id}
              stroke={r.route.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
