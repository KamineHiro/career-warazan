"use client";

import { Route, RouteSegment } from "@/lib/calculator";
import { REGION_LABELS, OCCUPATION_LABELS, Region, Occupation } from "@/data/wageData";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  routes: Route[];
  startAge: number;
  endAge: number;
  onChange: (routes: Route[]) => void;
}

export default function RouteEditor({ routes, startAge, endAge, onChange }: Props) {
  const addRoute = () => {
    const newRoute: Route = {
      id: crypto.randomUUID(),
      name: `ルート ${routes.length + 1}`,
      color: COLORS[routes.length % COLORS.length],
      segments: [
        {
          id: crypto.randomUUID(),
          label: "期間1",
          startAge,
          endAge,
          region: "okinawa",
          occupation: "it",
        },
      ],
    };
    onChange([...routes, newRoute]);
  };

  const removeRoute = (routeId: string) => {
    onChange(routes.filter((r) => r.id !== routeId));
  };

  const updateRouteName = (routeId: string, name: string) => {
    onChange(routes.map((r) => (r.id === routeId ? { ...r, name } : r)));
  };

  const updateSegment = (routeId: string, segId: string, patch: Partial<RouteSegment>) => {
    onChange(
      routes.map((r) =>
        r.id === routeId
          ? {
              ...r,
              segments: r.segments.map((s) => (s.id === segId ? { ...s, ...patch } : s)),
            }
          : r,
      ),
    );
  };

  const addSegment = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId)!;
    const lastSeg = route.segments[route.segments.length - 1];
    const newStart = Math.min(lastSeg.endAge + 1, endAge);
    if (newStart >= endAge) return;
    const newSeg: RouteSegment = {
      id: crypto.randomUUID(),
      label: `期間${route.segments.length + 1}`,
      startAge: newStart,
      endAge,
      region: lastSeg.region,
      occupation: lastSeg.occupation,
    };
    onChange(
      routes.map((r) =>
        r.id === routeId
          ? { ...r, segments: [...r.segments, newSeg] }
          : r,
      ),
    );
  };

  const removeSegment = (routeId: string, segId: string) => {
    onChange(
      routes.map((r) =>
        r.id === routeId
          ? { ...r, segments: r.segments.filter((s) => s.id !== segId) }
          : r,
      ),
    );
  };

  return (
    <div className="space-y-4">
      {routes.map((route, ri) => (
        <div
          key={route.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
          style={{ borderLeftColor: route.color, borderLeftWidth: 4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: route.color }} />
            <input
              className="font-semibold text-sm text-gray-900 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 flex-1"
              value={route.name}
              onChange={(e) => updateRouteName(route.id, e.target.value)}
            />
            {routes.length > 1 && (
              <button
                onClick={() => removeRoute(route.id)}
                className="text-gray-400 hover:text-red-500 text-sm px-1"
              >
                削除
              </button>
            )}
          </div>

          <div className="space-y-2">
            {route.segments.map((seg, si) => (
              <div key={seg.id} className="bg-gray-50 rounded p-3 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-xs font-medium">期間{si + 1}</span>
                  {route.segments.length > 1 && (
                    <button
                      onClick={() => removeSegment(route.id, seg.id)}
                      className="text-gray-400 hover:text-red-500 text-xs ml-auto"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">開始年齢</label>
                    <input
                      type="number"
                      min={startAge}
                      max={seg.endAge}
                      value={seg.startAge}
                      onChange={(e) => updateSegment(route.id, seg.id, { startAge: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">終了年齢</label>
                    <input
                      type="number"
                      min={seg.startAge}
                      max={endAge}
                      value={seg.endAge}
                      onChange={(e) => updateSegment(route.id, seg.id, { endAge: Number(e.target.value) })}
                      className="w-full border rounded px-2 py-1 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">勤務地</label>
                    <select
                      value={seg.region}
                      onChange={(e) => updateSegment(route.id, seg.id, { region: e.target.value as Region })}
                      className="w-full border rounded px-2 py-1 text-sm text-gray-900"
                    >
                      {Object.entries(REGION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">職種</label>
                    <select
                      value={seg.occupation}
                      onChange={(e) => updateSegment(route.id, seg.id, { occupation: e.target.value as Occupation })}
                      className="w-full border rounded px-2 py-1 text-sm text-gray-900"
                    >
                      {Object.entries(OCCUPATION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => addSegment(route.id)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            + 期間を追加（Uターンなど）
          </button>
        </div>
      ))}

      {routes.length < 5 && (
        <button
          onClick={addRoute}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + ルートを追加
        </button>
      )}
    </div>
  );
}
