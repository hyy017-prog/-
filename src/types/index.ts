import type { Timestamp } from "firebase/firestore";

/** 使用者個人資料，對應 Firestore users/{uid} */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp | null;
  /** 成本計算參數（功能四：成本計算） */
  settings?: CostSettings;
}

/** 成本計算的全域參數，使用者可自行調整，存於 users/{uid}.settings */
export interface CostSettings {
  electricityRatePerKwh: number; // 電費單價 (NT$/度)
  printerPowerWatts: number; // 印表機平均功率 (瓦)
  laborRatePerHour: number; // 人工時薪
  machineDepreciationPerHour: number; // 機器折舊 (NT$/小時)
  packagingCost: number; // 包材成本 (每件)
  shippingCost: number; // 運費 (每件)
  platformFeePercent: number; // 平台抽成 (%)
  taxPercent: number; // 稅金 (%)
  defaultMarkup: number; // 預設利潤倍率，如 2 代表 200%
}

export const DEFAULT_COST_SETTINGS: CostSettings = {
  electricityRatePerKwh: 4.5,
  printerPowerWatts: 150,
  laborRatePerHour: 200,
  machineDepreciationPerHour: 15,
  packagingCost: 10,
  shippingCost: 0,
  platformFeePercent: 0,
  taxPercent: 0,
  defaultMarkup: 2,
};

/** 列印工作狀態（對應「功能二：列印作品管理」） */
export type PrintJobStatus =
  | "queued" // 待列印
  | "printing" // 列印中
  | "completed" // 已完成
  | "failed" // 失敗
  | "cancelled"; // 取消

export const PRINT_JOB_STATUS_LABEL: Record<PrintJobStatus, string> = {
  queued: "待列印",
  printing: "列印中",
  completed: "已完成",
  failed: "失敗",
  cancelled: "取消",
};

/**
 * 列印工作，對應 Firestore users/{uid}/printJobs/{jobId}
 */
export interface PrintJob {
  id: string;
  userId: string;

  // 基本資訊
  name: string; // 作品名稱
  photoURL: string | null; // 作品照片
  stlFileName: string; // STL 名稱
  gcodeFileName: string; // Gcode 名稱

  // 列印設定
  printer: string;
  material: string; // 材料（PLA / PETG / ABS / TPU / Resin ...）
  materialBrand: string; // 材料品牌
  color: string;
  materialGrams: number; // 使用克數
  printTimeMinutes: number; // 列印時間（分鐘）
  layerHeight: number; // 層高 (mm)
  nozzleSize: number; // 噴嘴尺寸 (mm)
  infillPercentage: number; // 填充率 (%)
  supportSetting: string; // 支撐設定
  speed: number; // 速度 (mm/s)

  // 日期與狀態
  printDate: Timestamp | null;
  completedDate: Timestamp | null;
  status: PrintJobStatus;
  failureReason: string; // 失敗原因（狀態為失敗時填寫）
  notes: string; // 備註

  // 財務（Phase 1 先手動輸入，Phase 2 的成本計算模組會自動帶入）
  materialCost: number;
  totalCost: number;
  revenue: number;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/** 建立 / 編輯列印工作時使用的表單資料（不含系統自動產生欄位） */
export type PrintJobFormValues = Omit<
  PrintJob,
  "id" | "userId" | "createdAt" | "updatedAt" | "photoURL"
> & {
  photoFile?: File | null;
  existingPhotoURL?: string | null;
};

/** 通用非同步狀態，供各頁面資料載入使用 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 耗材（線材）庫存，對應 Firestore users/{uid}/filaments/{id}
 */
export interface Filament {
  id: string;
  userId: string;
  brand: string; // 品牌
  material: string; // 材料
  color: string;
  weightGrams: number; // 整捲總重量
  remainingGrams: number; // 剩餘重量
  price: number; // 購入價格
  purchaseDate: Timestamp | null;
  openedDate: Timestamp | null; // 開封日期
  isDried: boolean; // 是否烘乾
  driedDate: Timestamp | null;
  storageLocation: string; // 存放位置
  lowStockThreshold: number; // 低於此重量觸發提醒 (g)
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type FilamentFormValues = Omit<
  Filament,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

/**
 * 客戶，對應 Firestore users/{uid}/customers/{id}
 * 總消費／歷史訂單數量不存在文件內，而是即時從訂單集合計算，避免資料不同步。
 */
export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  line: string;
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type CustomerFormValues = Omit<
  Customer,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type PaymentStatus = "unpaid" | "partial" | "paid";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "未付款",
  partial: "部分付款",
  paid: "已付款",
};

/**
 * 訂單，對應 Firestore users/{uid}/orders/{id}
 */
export interface Order {
  id: string;
  userId: string;
  customerId: string;
  customerName: string; // 下單當下的客戶姓名快照，客戶改名不影響歷史訂單顯示
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number; // 訂單總金額（quantity * unitPrice，可手動覆寫）
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderDate: Timestamp | null;
  deliveryDate: Timestamp | null;
  shippingCompany: string;
  trackingNumber: string;
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type OrderFormValues = Omit<
  Order,
  "id" | "userId" | "createdAt" | "updatedAt" | "customerName"
>;

/**
 * 作品展示，對應 Firestore users/{uid}/showcaseItems/{id}
 * 可選擇從「列印作品管理」的某筆已完成工作匯入，自動帶入照片/成本/售價/材料/列印時間。
 */
export interface ShowcaseItem {
  id: string;
  userId: string;
  sourceJobId: string | null; // 來源列印工作 ID（若從列印作品匯入）
  name: string;
  photoURL: string; // 作品照片網址
  timelapseVideoURL: string; // 縮時影片網址（YouTube/Vimeo 等連結）
  description: string; // 作品介紹
  material: string;
  printTimeMinutes: number;
  cost: number;
  price: number;
  isFavorited: boolean; // 收藏
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type ShowcaseItemFormValues = Omit<
  ShowcaseItem,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type FailureCategory =
  | "warping" // 翹曲
  | "stringing" // 拉絲
  | "layer_shift" // 層移
  | "support" // 支撐問題
  | "adhesion" // 掉料/黏著失敗
  | "clog" // 噴頭堵塞
  | "other"; // 其他

export const FAILURE_CATEGORY_LABEL: Record<FailureCategory, string> = {
  warping: "翹曲",
  stringing: "拉絲",
  layer_shift: "層移",
  support: "支撐問題",
  adhesion: "掉料/黏著失敗",
  clog: "噴頭堵塞",
  other: "其他",
};

/**
 * 列印失敗資料庫，對應 Firestore users/{uid}/failureRecords/{id}
 * 未來 AI 助手（功能九）會引用這裡的資料回答問題。
 */
export interface FailureRecord {
  id: string;
  userId: string;
  photoURL: string;
  category: FailureCategory;
  failureReason: string;
  solution: string;
  isResolved: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type FailureRecordFormValues = Omit<
  FailureRecord,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type EquipmentType = "printer" | "nozzle" | "pei_sheet" | "hotend" | "ams" | "other";

export const EQUIPMENT_TYPE_LABEL: Record<EquipmentType, string> = {
  printer: "3D Printer",
  nozzle: "噴嘴",
  pei_sheet: "PEI 板",
  hotend: "熱端",
  ams: "AMS",
  other: "其他",
};

/**
 * 設備，對應 Firestore users/{uid}/equipment/{id}
 */
export interface Equipment {
  id: string;
  userId: string;
  name: string; // 自訂名稱，例如「主力印表機」
  type: EquipmentType;
  model: string; // 型號
  purchaseDate: Timestamp | null;
  lastMaintenanceDate: Timestamp | null;
  maintenanceIntervalDays: number; // 保養提醒間隔（天）
  accumulatedHours: number; // 累積使用時數（手動記錄，printer 類型會額外顯示平台自動統計的列印時數供參考）
  notes: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type EquipmentFormValues = Omit<
  Equipment,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type MaintenanceStatus = "ok" | "due_soon" | "overdue";
