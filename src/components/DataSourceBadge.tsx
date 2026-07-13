"use client";

import { DATA_SOURCES } from "@/data/wageData";
import { useState } from "react";

export default function DataSourceBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-blue-600 underline hover:text-blue-800"
      >
        数値の根拠を見る
      </button>
      {open && (
        <div className="absolute bottom-6 left-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">データソース</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <ul className="space-y-2">
            {DATA_SOURCES.map((src) => (
              <li key={src.name} className="text-xs text-gray-600">
                <span className="font-medium">{src.name}</span>
                <br />
                {src.publisher}・{src.year}
                <br />
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {src.url}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-3 border-t pt-2">
            ※ 地域係数・年齢係数は公的統計の傾向値をもとに構成。詳細はe-Statで確認できます。
          </p>
        </div>
      )}
    </div>
  );
}
