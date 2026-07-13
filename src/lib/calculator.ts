// 年収・手取りシミュレーション計算エンジン
// 計算の前提: 税・社会保険は簡易モデル（MVPの範囲として明記）

const VALID_REGIONS = new Set(["okinawa", "tokyo", "osaka", "national"]);
const VALID_OCCUPATIONS = new Set(["it", "medical", "education", "service", "manufacturing", "sales", "clerical"]);

export function validateInputs(startAge: number, endAge: number): string | null {
  if (!Number.isFinite(startAge) || !Number.isFinite(endAge)) return "年齢に無効な値が入力されています";
  if (startAge < 18 || startAge > 60) return "開始年齢は18〜60歳の範囲で入力してください";
  if (endAge < 18 || endAge > 60) return "終了年齢は18〜60歳の範囲で入力してください";
  if (startAge >= endAge) return "終了年齢は開始年齢より大きくしてください";
  return null;
}

export function validateSegment(seg: { startAge: number; endAge: number; region: string; occupation: string }): string | null {
  if (!Number.isFinite(seg.startAge) || !Number.isFinite(seg.endAge)) return "年齢に無効な値があります";
  if (seg.startAge >= seg.endAge) return "期間の終了年齢は開始年齢より大きくしてください";
  if (!VALID_REGIONS.has(seg.region)) return "無効な勤務地が選択されています";
  if (!VALID_OCCUPATIONS.has(seg.occupation)) return "無効な職種が選択されています";
  return null;
}

export function sanitizeLivingCost(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 100); // 月100万円を上限とする
}

import {
  Region,
  Occupation,
  REGION_COEFFICIENT,
  OCCUPATION_BASE_ANNUAL,
  AGE_MULTIPLIER,
  LIVING_COST,
} from "@/data/wageData";

export interface RouteSegment {
  id: string;
  label: string;
  startAge: number;
  endAge: number;
  region: Region;
  occupation: Occupation;
}

export interface Route {
  id: string;
  name: string;
  color: string;
  segments: RouteSegment[];
}

export interface YearlyData {
  age: number;
  grossIncome: number;      // 額面年収（万円）
  netIncome: number;        // 手取り年収（万円）
  livingCost: number;       // 年間生活費（万円）
  disposable: number;       // 可処分所得（手取り - 生活費）（万円）
  region: Region;
  occupation: Occupation;
}

export interface RouteResult {
  route: Route;
  yearly: YearlyData[];
  totalGross: number;
  totalNet: number;
  totalDisposable: number;
}

// 年齢係数を線形補間で取得
function getAgeMultiplier(age: number): number {
  const clamped = Math.max(22, Math.min(60, age));
  if (AGE_MULTIPLIER[clamped] !== undefined) return AGE_MULTIPLIER[clamped];
  // テーブルにない年齢は前後で補間
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  if (AGE_MULTIPLIER[lower] && AGE_MULTIPLIER[upper]) {
    const t = clamped - lower;
    return AGE_MULTIPLIER[lower] * (1 - t) + AGE_MULTIPLIER[upper] * t;
  }
  return 1.0;
}

// 額面年収計算（万円）
export function calcGrossIncome(age: number, region: Region, occupation: Occupation): number {
  const base = OCCUPATION_BASE_ANNUAL[occupation];
  const ageMult = getAgeMultiplier(age);
  const regionCoeff = REGION_COEFFICIENT[region];
  return Math.round(base * ageMult * regionCoeff);
}

// 所得税の簡易計算（課税所得ベース）
// 出所: 所得税法別表第一（令和4年）の速算表を簡略化
function calcIncomeTax(taxableIncome: number): number {
  // taxableIncome: 万円
  const y = taxableIncome;
  if (y <= 195) return y * 0.05;
  if (y <= 330) return y * 0.10 - 9.75;
  if (y <= 695) return y * 0.20 - 42.75;
  if (y <= 900) return y * 0.23 - 63.6;
  if (y <= 1800) return y * 0.33 - 153.6;
  if (y <= 4000) return y * 0.40 - 279.6;
  return y * 0.45 - 479.6;
}

// 社会保険料の簡易計算
// 健康保険 + 厚生年金 ≒ 額面の約15%（労働者負担分）
function calcSocialInsurance(gross: number): number {
  return Math.round(gross * 0.15);
}

// 手取り年収計算（万円）
// 注意: 簡易モデル（控除・扶養など個人差を省略）
export function calcNetIncome(grossIncome: number): number {
  const socialInsurance = calcSocialInsurance(grossIncome);
  const deduction = 55 + Math.max(0, (grossIncome - 550) * 0.2); // 給与所得控除（令和4年简易）
  const taxable = Math.max(0, grossIncome - socialInsurance - deduction - 48); // 48=基礎控除
  const incomeTax = calcIncomeTax(taxable);
  const residentialTax = Math.round(taxable * 0.10); // 住民税10%（均等割省略）
  return Math.round(grossIncome - socialInsurance - incomeTax - residentialTax);
}

// 年間生活費計算（万円）
export function calcLivingCost(
  region: Region,
  rentOverride?: number,
  carOverride?: number,
): number {
  const base = LIVING_COST[region];
  const rent = sanitizeLivingCost(rentOverride !== undefined ? rentOverride : base.rent);
  const car = sanitizeLivingCost(carOverride !== undefined ? carOverride : base.car);
  const monthly = rent + car + base.food + base.other;
  return Math.round(monthly * 12);
}

// ルートの年次シミュレーション
export function simulateRoute(
  route: Route,
  livingCostOverrides?: Partial<Record<Region, { rent?: number; car?: number }>>,
): RouteResult {
  const yearlyData: YearlyData[] = [];

  for (const seg of route.segments) {
    for (let age = seg.startAge; age <= seg.endAge; age++) {
      const overrides = livingCostOverrides?.[seg.region];
      const gross = calcGrossIncome(age, seg.region, seg.occupation);
      const net = calcNetIncome(gross);
      const living = calcLivingCost(
        seg.region,
        overrides?.rent,
        overrides?.car,
      );

      yearlyData.push({
        age,
        grossIncome: gross,
        netIncome: net,
        livingCost: living,
        disposable: net - living,
        region: seg.region,
        occupation: seg.occupation,
      });
    }
  }

  const totalGross = yearlyData.reduce((s, d) => s + d.grossIncome, 0);
  const totalNet = yearlyData.reduce((s, d) => s + d.netIncome, 0);
  const totalDisposable = yearlyData.reduce((s, d) => s + d.disposable, 0);

  return { route, yearly: yearlyData, totalGross, totalNet, totalDisposable };
}

// デフォルトのルートプリセット（例示用）
export function createDefaultRoutes(
  startAge: number,
  endAge: number,
  occupation: Occupation,
): Route[] {
  return [
    {
      id: "okinawa-only",
      name: "ずっと沖縄",
      color: "#22c55e",
      segments: [
        {
          id: "seg1",
          label: "沖縄",
          startAge,
          endAge,
          region: "okinawa",
          occupation,
        },
      ],
    },
    {
      id: "tokyo-only",
      name: "ずっと東京",
      color: "#3b82f6",
      segments: [
        {
          id: "seg1",
          label: "東京",
          startAge,
          endAge,
          region: "tokyo",
          occupation,
        },
      ],
    },
    {
      id: "uturn",
      name: "途中Uターン（27歳で沖縄へ）",
      color: "#f59e0b",
      segments: [
        {
          id: "seg1",
          label: "東京（〜27歳）",
          startAge,
          endAge: Math.min(27, endAge),
          region: "tokyo",
          occupation,
        },
        {
          id: "seg2",
          label: "沖縄（28歳〜）",
          startAge: Math.min(28, endAge),
          endAge,
          region: "okinawa",
          occupation,
        },
      ],
    },
  ];
}
