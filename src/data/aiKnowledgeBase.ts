export interface KnowledgeEntry {
  id: string;
  keywords: string[]; // 命中比對用的關鍵字（不分大小寫）
  title: string;
  answer: string;
}

/**
 * 規則式問答知識庫。目前以關鍵字比對方式運作，
 * Phase 9 保留的 `aiService.ts` 介面未來可直接替換為呼叫 OpenAI API，
 * 不需更動呼叫端（AssistantPage）的程式碼。
 */
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "warping",
    keywords: ["翹曲", "翹起", "warping", "邊角", "角落翹"],
    title: "翹曲（Warping）",
    answer:
      "翹曲通常是因為材料冷卻收縮不均勻造成邊角上翹。建議：\n1. 提高熱床溫度（PLA 55-60°C、ABS 90-100°C）\n2. 加裝上蓋或使用有機艙的印表機，避免風扇直吹底層\n3. 使用 Brim（邊緣裙邊）增加底面附著力\n4. 確認熱床有清潔並使用適合的膠水/貼紙（如 PEI 板、口紅膠）\n5. ABS/ASA 建議搭配全罩式機殼列印",
  },
  {
    id: "stringing",
    keywords: ["拉絲", "牽絲", "stringing", "絲線"],
    title: "拉絲（Stringing）",
    answer:
      "拉絲是噴頭移動時滲出的細絲。建議：\n1. 提高回抽距離（Bowden 結構約 5-7mm，直驅結構約 1-2mm）\n2. 提高回抽速度\n3. 降低列印溫度 5-10°C\n4. 開啟「Combing」或「僅在外圍周長回抽」選項\n5. PLA 若吸濕嚴重也容易拉絲，先烘乾線材再試",
  },
  {
    id: "layer_shift",
    keywords: ["層移", "layer shift", "位移", "錯層"],
    title: "層移（Layer Shift）",
    answer:
      "層移通常是機械或速度問題，跟材料無關：\n1. 檢查同步帶（皮帶）張力是否過鬆\n2. 降低列印速度與加速度，尤其轉角處\n3. 確認軸承、導桿沒有卡滯或異物\n4. 檢查馬達驅動電流是否過低（步進遺失）\n5. 若機器曾被移動或碰撞，重新校正 X/Y 軸皮帶",
  },
  {
    id: "support",
    keywords: ["支撐", "support", "懸空", "懸垂"],
    title: "支撐設定建議",
    answer:
      "支撐設定的常見原則：\n1. 懸空角度超過 45-50° 建議加支撐\n2. 支撐密度：一般模型 10-15% 即可，精細模型可到 20%\n3. 樹狀支撐（Tree Support）適合曲面模型，比一般格狀支撐更容易移除且用料更少\n4. 支撐與模型間距（Z Gap）建議 0.15-0.2mm，太小會黏死不好拆\n5. 介面層（Interface Layer）可以讓支撐面更平整，但會增加移除難度",
  },
  {
    id: "ams",
    keywords: ["ams", "換料", "料架", "斷料"],
    title: "Bambu Lab AMS 常見問題",
    answer:
      "AMS（自動換料系統）常見狀況排解：\n1. 進料卡料：檢查料盤是否纏繞，線材末端建議削尖\n2. AMS 讀不到線材：確認線材已插入到底聽到「喀」聲，並重新校準 AMS\n3. 換料失敗：清理 AMS 內的碎屑，確認 PTFE 管沒有阻塞\n4. 濕度過高：AMS 濕度感測器顯示過高時，先烘乾線材再放回\n5. 多色列印斷料：確認每卷線材餘量足夠，AMS 會在餘量不足時提前提醒",
  },
  {
    id: "clog",
    keywords: ["堵塞", "塞噴頭", "clog", "噴嘴堵", "擠出不順"],
    title: "噴頭堵塞排除",
    answer:
      "噴頭堵塞（部分堵塞或完全堵塞）處理方式：\n1. 冷拉法（Cold Pull）：加熱到列印溫度，手動進料後降溫至材料稍微凝固再快速抽出，重複幾次直到抽出乾淨線材\n2. 使用噴嘴清潔針疏通\n3. 檢查散熱風扇是否正常運作，熱漲區（Heatbreak）過熱容易造成「熱潛變堵塞」\n4. 更換噴嘴，長期使用碳纖/金屬填充材料容易磨損噴嘴造成堵塞\n5. 確認線材乾燥，受潮的線材更容易在噴頭內起泡堵塞",
  },
  {
    id: "material_pla",
    keywords: ["pla溫度", "pla 溫度", "pla速度", "pla"],
    title: "PLA 建議參數",
    answer:
      "PLA 建議列印參數：\n噴頭溫度 190-220°C\n熱床溫度 45-60°C\n列印速度 50-100mm/s\n風扇 開啟（100%）\n適合初學者，翹曲風險低，但耐熱性較差（約 60°C 軟化）",
  },
  {
    id: "material_petg",
    keywords: ["petg溫度", "petg 溫度", "petg速度", "petg"],
    title: "PETG 建議參數",
    answer:
      "PETG 建議列印參數：\n噴頭溫度 230-250°C\n熱床溫度 70-85°C\n列印速度 40-70mm/s（比 PLA 慢）\n風扇 部分開啟（30-50%）\n韌性佳、耐候性好，但容易拉絲，回抽設定要調整仔細",
  },
  {
    id: "material_abs",
    keywords: ["abs溫度", "abs 溫度", "abs速度", "abs"],
    title: "ABS 建議參數",
    answer:
      "ABS 建議列印參數：\n噴頭溫度 230-260°C\n熱床溫度 90-110°C\n列印速度 40-60mm/s\n風扇 關閉或極低（避免層間開裂）\n翹曲風險高，強烈建議使用全罩式機殼，且需良好通風（有異味）",
  },
  {
    id: "material_tpu",
    keywords: ["tpu溫度", "tpu 溫度", "tpu速度", "tpu"],
    title: "TPU 建議參數",
    answer:
      "TPU（軟性材料）建議列印參數：\n噴頭溫度 220-240°C\n熱床溫度 30-60°C\n列印速度 20-40mm/s（務必放慢，太快會擠料不順）\n回抽 盡量減少或關閉回抽，直驅結構效果較佳\nBowden 結構的印表機列印 TPU 較容易卡料，建議降速",
  },
  {
    id: "bambu",
    keywords: ["bambu lab", "bambu", "拓竹", "x1carbon", "p1s", "a1"],
    title: "Bambu Lab 系列印表機",
    answer:
      "Bambu Lab（拓竹）系列重點：\nX1 Carbon：全功能旗艦機，支援 AMS、Lidar 校正、自動材料辨識\nP1S：X1C 的簡化版，同樣支援 AMS，但無 Lidar\nA1 / A1 mini：入門款，開放式機構，適合 PLA/PETG，不建議 ABS\n常見問題多與 AMS 進料、首層校正（自動 Flow 校正）有關，官方韌體更新頻繁，建議保持最新版",
  },
  {
    id: "prusa",
    keywords: ["prusa", "mk4", "mini"],
    title: "Prusa 系列印表機",
    answer:
      "Prusa 系列重點：\nMK4：開源社群支援完整，穩定性高，內建輸入補償（Input Shaper）\nMini：體積小巧，適合小型模型，同樣支援 Input Shaper\n官方切片軟體 PrusaSlicer 的預設參數已針對自家線材調校過，新手可直接套用",
  },
  {
    id: "creality",
    keywords: ["creality", "k1", "ender", "ender-3", "ender3"],
    title: "Creality 系列印表機",
    answer:
      "Creality 系列重點：\nK1：高速機種，內建 AI 檢測攝影機，適合大量生產\nEnder-3：入門經典機種，性價比高，但需要自行校正調機（如皮帶張力、Z軸偏移）\n高速列印（K1 系列）建議搭配高流量噴頭與相對應的線材（部分材料在高速下容易斷料）",
  },
  {
    id: "elegoo",
    keywords: ["elegoo", "neptune", "saturn", "樹脂", "光固化", "resin"],
    title: "Elegoo 系列印表機 / 樹脂列印",
    answer:
      "Elegoo 系列重點：\nNeptune：FDM 熔絲列印機種，入門價格帶\nSaturn：LCD 光固化（樹脂）機種，適合精細模型（公仔、牙模）\n樹脂列印常見問題：曝光時間需依樹脂品牌校正、脫模失敗多為底層曝光不足、後處理需要酒精清洗與二次固化",
  },
  {
    id: "anycubic",
    keywords: ["anycubic", "kobra"],
    title: "Anycubic 系列印表機",
    answer:
      "Anycubic Kobra 系列重點：\n內建自動調平（LeviQ），大幅降低調機門檻\n入門機型性價比高，適合初學者從 FDM 入門\n若列印品質不穩定，優先檢查噴嘴是否有異物、熱床是否確實加熱到設定溫度",
  },
];

/** 依關鍵字比對知識庫，回傳命中的條目（依命中關鍵字數量排序） */
export function searchKnowledgeBase(query: string): KnowledgeEntry[] {
  const q = query.toLowerCase();
  const scored = KNOWLEDGE_BASE.map((entry) => {
    const hits = entry.keywords.filter((k) => q.includes(k.toLowerCase())).length;
    return { entry, hits };
  }).filter((s) => s.hits > 0);

  scored.sort((a, b) => b.hits - a.hits);
  return scored.map((s) => s.entry);
}
