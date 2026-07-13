"use client";

import { useState, useMemo } from "react";
import { Route, simulateRoute, createDefaultRoutes, RouteResult, validateInputs, validateSegment } from "@/lib/calculator";
import { OCCUPATION_LABELS, Occupation, Region, LIVING_COST } from "@/data/wageData";
import RouteEditor from "@/components/RouteEditor";
import CompareChart from "@/components/CompareChart";
import SummaryTable from "@/components/SummaryTable";
import DataSourceBadge from "@/components/DataSourceBadge";

type ChartMode = "gross" | "net" | "disposable";

const CHART_MODES: { key: ChartMode; label: string }[] = [
  { key: "gross", label: "額面年収" },
  { key: "net", label: "手取り年収" },
  { key: "disposable", label: "可処分所得" },
];

export default function Home() {
  const [startAge, setStartAge] = useState(22);
  const [endAge, setEndAge] = useState(40);
  const [startAgeStr, setStartAgeStr] = useState("22");
  const [endAgeStr, setEndAgeStr] = useState("40");
  const [occupation, setOccupation] = useState<Occupation>("it");
  const [routes, setRoutes] = useState<Route[]>(() =>
    createDefaultRoutes(22, 40, "it"),
  );
  const [chartMode, setChartMode] = useState<ChartMode>("disposable");
  const [livingOverrides, setLivingOverrides] = useState<
    Partial<Record<Region, { rent?: number; car?: number }>>
  >({});
  const [startAgeError, setStartAgeError] = useState<string | null>(null);
  const [endAgeError, setEndAgeError] = useState<string | null>(null);
  const [showParams, setShowParams] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const results: RouteResult[] = useMemo(() => {
    if (!calculated) return [];
    return routes.map((r) => simulateRoute(r, livingOverrides));
  }, [routes, livingOverrides, calculated]);

  const handleCalculate = () => {
    if (startAgeError || endAgeError) return;

    for (const route of routes) {
      for (const seg of route.segments) {
        const segError = validateSegment(seg);
        if (segError) { alert(`「${route.name}」: ${segError}`); return; }
      }
    }

    setCalculated(true);
  };

  const handleOccupationChange = (occ: Occupation) => {
    setOccupation(occ);
    setRoutes(createDefaultRoutes(startAge, endAge, occ));
    setCalculated(false);
  };

  const handleAgeChange = (newStart: number, newEnd: number) => {
    setStartAge(newStart);
    setEndAge(newEnd);
    setStartAgeStr(String(newStart));
    setEndAgeStr(String(newEnd));
    setRoutes(createDefaultRoutes(newStart, newEnd, occupation));
    setCalculated(false);
  };

  const years = endAge - startAge + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-gray-900">キャリアシミュレーション（仮）</h1>
            <span className="text-sm text-gray-500">沖縄の若者向け 分岐型キャリア・所得シミュレーター</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            グループF / システムエンジニアリング演習 — 公的統計ベース・MVP v0.1
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">① 基本条件を設定</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">職種</label>
              <select
                value={occupation}
                onChange={(e) => handleOccupationChange(e.target.value as Occupation)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(OCCUPATION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">開始年齢</label>
              <input
                type="number"
                min={18}
                max={60}
                value={startAgeStr}
                onChange={(e) => {
                  setStartAgeStr(e.target.value);
                  const n = Number(e.target.value);
                  if (!e.target.value || n < 18 || n > 60) setStartAgeError("18〜60歳の範囲で入力してください");
                  else if (n >= endAge) setStartAgeError("開始年齢は終了年齢より小さくしてください");
                  else setStartAgeError(null);
                }}
                onBlur={(e) => {
                  const v = Math.min(Math.max(Number(e.target.value) || 18, 18), endAge - 1);
                  handleAgeChange(v, endAge);
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${startAgeError ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-400"}`}
              />
              {startAgeError && <p className="mt-1 text-xs text-red-600">{startAgeError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">終了年齢</label>
              <input
                type="number"
                min={18}
                max={60}
                value={endAgeStr}
                onChange={(e) => {
                  setEndAgeStr(e.target.value);
                  const n = Number(e.target.value);
                  if (!e.target.value || n < 18 || n > 60) setEndAgeError("18〜60歳の範囲で入力してください");
                  else if (n <= startAge) setEndAgeError("終了年齢は開始年齢より大きくしてください");
                  else setEndAgeError(null);
                }}
                onBlur={(e) => {
                  const v = Math.min(Math.max(Number(e.target.value) || 40, startAge + 1), 60);
                  handleAgeChange(startAge, v);
                }}
                className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${endAgeError ? "border-red-400 focus:ring-red-300" : "focus:ring-blue-400"}`}
              />
              {endAgeError && <p className="mt-1 text-xs text-red-600">{endAgeError}</p>}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowParams(!showParams)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showParams ? "▼" : "▶"} 生活費パラメータを調整（FR-7）
            </button>
            {showParams && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["okinawa", "tokyo", "osaka", "national"] as Region[]).map((region) => {
                  const defaults = LIVING_COST[region];
                  const label = region === "okinawa" ? "沖縄" : region === "tokyo" ? "東京" : region === "osaka" ? "大阪" : "全国平均";
                  return (
                    <div key={region} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
                      <div className="space-y-1">
                        <div>
                          <label className="text-xs text-gray-500">家賃（月・万円）</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            defaultValue={defaults.rent}
                            onChange={(e) =>
                              setLivingOverrides((prev) => ({
                                ...prev,
                                [region]: { ...prev[region], rent: Number(e.target.value) },
                              }))
                            }
                            className="w-full border rounded px-2 py-1 text-xs text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">車維持費（月・万円）</label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            defaultValue={defaults.car}
                            onChange={(e) =>
                              setLivingOverrides((prev) => ({
                                ...prev,
                                [region]: { ...prev[region], car: Number(e.target.value) },
                              }))
                            }
                            className="w-full border rounded px-2 py-1 text-xs text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">② キャリアルートを設定</h2>
          <p className="text-xs text-gray-500 mb-4">
            各ルートに「期間を追加」することでUターンなどの分岐を表現できます。
          </p>
          <RouteEditor
            routes={routes}
            startAge={startAge}
            endAge={endAge}
            onChange={(r) => {
              setRoutes(r);
              setCalculated(false);
            }}
          />
          <button
            onClick={handleCalculate}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            シミュレーション実行
          </button>
        </section>

        {calculated && results.length > 0 && (
          <>
            <section className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">③ 比較グラフ（FR-5）</h2>
                <div className="flex gap-1">
                  {CHART_MODES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setChartMode(m.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        chartMode === m.key
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <CompareChart results={results} mode={chartMode} />
              <div className="mt-3 text-right">
                <DataSourceBadge />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                ④ 生涯収支サマリー（{years}年間）
              </h2>
              <SummaryTable results={results} years={years} />
            </section>
          </>
        )}

        <footer className="text-center text-xs text-gray-400 pb-8">
          <p>キャリアシミュレーション（仮） MVP v0.1 — グループF / システムエンジニアリング演習</p>
          <p className="mt-1">
            数値は公的統計（令和4年）をもとにした簡易モデルです。実際の収入・生活費は個人差があります。
          </p>
        </footer>
      </main>
    </div>
  );
}
