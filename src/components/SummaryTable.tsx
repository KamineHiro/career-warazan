"use client";

import { RouteResult } from "@/lib/calculator";

interface Props {
  results: RouteResult[];
  years: number;
}

export default function SummaryTable({ results, years }: Props) {
  if (results.length === 0) return null;

  const sorted = [...results].sort((a, b) => b.totalDisposable - a.totalDisposable);
  const best = sorted[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-2 px-3 font-medium text-gray-600 border-b">ルート</th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 border-b">
              生涯額面<br /><span className="text-xs font-normal">（{years}年間・万円）</span>
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 border-b">
              生涯手取り<br /><span className="text-xs font-normal">（万円）</span>
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 border-b">
              生涯可処分<br /><span className="text-xs font-normal">（手取り−生活費）</span>
            </th>
            <th className="text-right py-2 px-3 font-medium text-gray-600 border-b">
              最良との差<br /><span className="text-xs font-normal">（可処分）</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const diff = r.totalDisposable - best.totalDisposable;
            const isBest = r.route.id === best.route.id;
            return (
              <tr key={r.route.id} className={isBest ? "bg-yellow-50" : ""}>
                <td className="py-2 px-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.route.color }} />
                    <span>{r.route.name}</span>
                    {isBest && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">最良</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 border-b text-right font-mono">
                  {r.totalGross.toLocaleString()}
                </td>
                <td className="py-2 px-3 border-b text-right font-mono">
                  {r.totalNet.toLocaleString()}
                </td>
                <td className="py-2 px-3 border-b text-right font-mono font-semibold">
                  {r.totalDisposable.toLocaleString()}
                </td>
                <td className={`py-2 px-3 border-b text-right font-mono ${diff < 0 ? "text-red-600" : "text-gray-400"}`}>
                  {diff === 0 ? "—" : `${diff.toLocaleString()}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">
        ※ 税・社会保険は簡易モデル（給与所得控除・基礎控除・社会保険料率15%を使用）。生活費は地域別の標準的な推計値。実際の金額は個人差があります。
      </p>
    </div>
  );
}
