import { searchKnowledgeBase } from "@/data/aiKnowledgeBase";
import { FAILURE_CATEGORY_LABEL, type FailureRecord } from "@/types";

export interface AssistantAnswer {
  text: string;
  matchedFailureRecords: FailureRecord[];
}

/**
 * 產生 AI 助手回覆。目前為規則式問答（關鍵字比對知識庫 + 使用者失敗案例資料庫），
 * 未來若要串接 OpenAI API，只需替換此函式內部實作，
 * 呼叫端（AssistantPage）的介面不需變動。
 */
export function generateAssistantAnswer(
  userMessage: string,
  failureRecords: FailureRecord[]
): AssistantAnswer {
  const kbHits = searchKnowledgeBase(userMessage);

  const q = userMessage.toLowerCase();
  const matchedFailureRecords = failureRecords.filter(
    (r) =>
      r.failureReason.toLowerCase().includes(q) ||
      r.solution.toLowerCase().includes(q) ||
      q.includes(FAILURE_CATEGORY_LABEL[r.category].toLowerCase())
  );

  if (kbHits.length === 0 && matchedFailureRecords.length === 0) {
    return {
      text:
        "我目前還沒有這個問題的資料。你可以換個關鍵字再問一次（例如：翹曲、拉絲、層移、支撐、AMS、噴頭堵塞、PLA/PETG/ABS/TPU 溫度、Bambu Lab/Prusa/Creality/Elegoo/Anycubic），或到「列印失敗資料庫」把這次的案例記錄下來，之後我就能引用。\n\n（目前 AI 助手為規則式問答，尚未串接 OpenAI API，回答範圍僅限預建知識庫）",
      matchedFailureRecords: [],
    };
  }

  const parts: string[] = [];

  kbHits.slice(0, 2).forEach((entry) => {
    parts.push(`【${entry.title}】\n${entry.answer}`);
  });

  if (matchedFailureRecords.length > 0) {
    const list = matchedFailureRecords
      .slice(0, 3)
      .map(
        (r) =>
          `・[${FAILURE_CATEGORY_LABEL[r.category]}] ${r.failureReason}${
            r.solution ? `\n  解決方式：${r.solution}` : "（尚未記錄解決方式）"
          }`
      )
      .join("\n");
    parts.push(`根據你「列印失敗資料庫」裡的紀錄，你之前遇過類似狀況：\n${list}`);
  }

  return { text: parts.join("\n\n"), matchedFailureRecords };
}
