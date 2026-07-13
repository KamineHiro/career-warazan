// 賃金構造基本統計調査（厚労省）および民間給与実態統計調査（国税庁）をもとにした簡易モデル
// 出所: 令和4年賃金構造基本統計調査, e-Stat
// 注意: MVPでは職種を大分類に丸め、年齢は5歳刻みで補間

export type Region = "okinawa" | "tokyo" | "osaka" | "national";
export type Occupation = "it" | "medical" | "education" | "service" | "manufacturing" | "sales" | "clerical";

export const REGION_LABELS: Record<Region, string> = {
  okinawa: "沖縄",
  tokyo: "東京",
  osaka: "大阪",
  national: "全国平均",
};

export const OCCUPATION_LABELS: Record<Occupation, string> = {
  it: "IT・エンジニア",
  medical: "医療・看護",
  education: "教育・保育",
  service: "サービス業",
  manufacturing: "製造業",
  sales: "営業・販売",
  clerical: "事務",
};

// 地域係数（全国平均=1.0）
// 出所: 賃金構造基本統計調査（令和4年）地方別第1表
export const REGION_COEFFICIENT: Record<Region, number> = {
  national: 1.0,
  tokyo: 1.25,
  osaka: 1.08,
  okinawa: 0.82,
};

// 職種別の全国平均基準年収係数（20代前半=1.0 の相対値）
// 出所: 職種別賃金カーブの傾向値
export const OCCUPATION_BASE_ANNUAL: Record<Occupation, number> = {
  it: 380,          // 万円（20代前半・全国平均）
  medical: 360,
  education: 300,
  service: 250,
  manufacturing: 290,
  sales: 310,
  clerical: 270,
};

// 年齢係数テーブル（全職種共通の傾向カーブ）
// 出所: 賃金構造基本統計調査の年齢階級別所定内給与額カーブ傾向
export const AGE_MULTIPLIER: Record<number, number> = {
  22: 1.00,
  23: 1.04,
  24: 1.08,
  25: 1.12,
  26: 1.16,
  27: 1.20,
  28: 1.24,
  29: 1.28,
  30: 1.32,
  31: 1.36,
  32: 1.40,
  33: 1.43,
  34: 1.46,
  35: 1.50,
  36: 1.53,
  37: 1.56,
  38: 1.59,
  39: 1.62,
  40: 1.65,
  41: 1.67,
  42: 1.69,
  43: 1.71,
  44: 1.73,
  45: 1.75,
  46: 1.76,
  47: 1.77,
  48: 1.78,
  49: 1.79,
  50: 1.80,
  51: 1.80,
  52: 1.79,
  53: 1.78,
  54: 1.77,
  55: 1.75,
  56: 1.73,
  57: 1.71,
  58: 1.69,
  59: 1.67,
  60: 1.50,
};

// 地域別生活費（月額・万円）
// 出所: 総務省「消費者物価地域差指数」「家計調査」令和4年
export const LIVING_COST: Record<Region, { rent: number; car: number; food: number; other: number }> = {
  tokyo:    { rent: 9.0, car: 0.5, food: 5.5, other: 4.0 },
  osaka:    { rent: 6.5, car: 1.0, food: 5.0, other: 3.5 },
  okinawa:  { rent: 5.0, car: 2.5, food: 4.5, other: 3.0 },
  national: { rent: 6.0, car: 1.5, food: 5.0, other: 3.5 },
};

export const DATA_SOURCES = [
  { name: "賃金構造基本統計調査", publisher: "厚生労働省", year: "令和4年（2022年）", url: "https://www.e-stat.go.jp/" },
  { name: "民間給与実態統計調査", publisher: "国税庁", year: "令和4年（2022年）", url: "https://www.nta.go.jp/" },
  { name: "消費者物価地域差指数", publisher: "総務省", year: "令和4年（2022年）", url: "https://www.stat.go.jp/" },
  { name: "家計調査（二人以上の世帯）", publisher: "総務省", year: "令和4年（2022年）", url: "https://www.stat.go.jp/" },
];
