/**
 * ── 核心型別定義 ──────────────────────────────────────────────────────────────
 *
 * 【Firestore Schema 設計說明】
 *
 * Collection: products/{productId}
 * ┌──────────────────────────────────────────────────────────────┐
 * │ name          : string   (必填) 產品名稱                       │
 * │ brand         : string   (必填) 品牌名                        │
 * │ category      : string   (必填) 產品類別                      │
 * │ releaseDate   : string   YYYY-MM-DD                          │
 * │ price         : number   建議售價 (USD)                       │
 * │ thumbnail     : string   圖片 URL                            │
 * │ website       : string   官網                                │
 * │ tags          : string[] 標籤陣列                             │
 * │                                                              │
 * │ 【動態規格 Map】                                               │
 * │ specGroups    : Record<string, SpecItem[]>                   │
 * │   key = 群組名稱（例如："處理器", "電池", "RFID讀頭規格"）        │
 * │   value = 該群組下的規格項目陣列                                │
 * │                                                              │
 * │ 優點：                                                        │
 * │  - 管理員可自由增刪群組和項目，不受固定 schema 限制               │
 * │  - 跨品類對比時，各產品只會顯示自己有的欄位                       │
 * │  - Firestore 的 Map 型別原生支援，讀寫效率佳                    │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Collection: trends/{trendId}
 * ┌──────────────────────────────────────────────────────────────┐
 * │ type          : 'market_share' | 'pain_point'                │
 * │ label         : string                                       │
 * │ value         : number  (market_share 用)                    │
 * │ sentiment     : 'positive' | 'negative' | 'neutral'         │
 * │ weight        : number  (pain_point 優先權)                  │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Collection: news/{newsId}
 * ┌──────────────────────────────────────────────────────────────┐
 * │ title / content / source / url / date / category            │
 * └──────────────────────────────────────────────────────────────┘
 */

/** 單一規格項目 */
export interface SpecItem {
  label: string;  // 項目名稱，例如 "CPU型號" / "電池容量"
  value: string;  // 數值，例如 "Snapdragon 8 Gen 3" / "5000"
  unit:  string;  // 單位，例如 "" / "mAh" / "mm"
}

/** 動態規格群組 Map：key = 群組名，value = 規格項目陣列 */
export type SpecGroups = Record<string, SpecItem[]>;

/** 產品（競品）資料結構 */
export interface Product {
  id:          string;
  name:        string;
  brand:       string;
  category:    string;
  releaseDate: string;
  price:       number;
  thumbnail:   string;
  website?:    string;
  tags:        string[];
  /** 動態規格 Map，支援任意群組與欄位 */
  specGroups:  SpecGroups;
}

/** 趨勢資料 */
export interface Trend {
  id:         string;
  type:       'market_share' | 'pain_point';
  label:      string;
  value?:     number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  weight?:    number;
}

/** 新聞 / 情報資料 */
export interface NewsItem {
  id:       string;
  title:    string;
  content:  string;
  source:   string;
  url:      string;
  date:     string;
  category: string;
}

/** 當前使用者角色 */
export type UserRole = 'admin' | 'guest';

/** App 整體分頁 */
export type TabId = 'dashboard' | 'comparison' | 'strategy' | 'news' | 'admin';
