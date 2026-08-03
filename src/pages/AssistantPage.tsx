import { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon, SparklesIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useFailureRecords } from "@/hooks/useFailureRecords";
import { generateAssistantAnswer } from "@/services/aiService";
import { cn } from "@/utils/cn";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = ["翹曲怎麼辦", "PETG 溫度建議", "AMS 卡料", "Bambu Lab 常見問題", "支撐設定"];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "你好！我可以回答列印失敗、材料溫度/速度建議、支撐設定、AMS 問題，以及 Bambu Lab / Prusa / Creality / Elegoo / Anycubic 等機型的常見問題，也會引用你「列印失敗資料庫」裡記錄過的案例。試著問我一個問題吧！",
};

export default function AssistantPage() {
  const { records } = useFailureRecords();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const answer = generateAssistantAnswer(trimmed, records);
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: answer.text,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-display font-bold">AI 助手</h2>
        <p className="text-sm text-ink-500 mt-1">
          列印失敗、材料建議、參數設定，隨時問我
        </p>
      </div>

      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 flex items-start gap-2">
        <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          目前為規則式問答（比對預建知識庫與你的失敗案例資料庫），尚未串接 OpenAI
          API，對話內容僅保留在本次瀏覽器工作階段中，重新整理頁面會清空。
        </p>
      </div>

      <Card className="flex flex-col h-[60vh] p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                  <SparklesIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-black/5 dark:bg-white/10 text-ink-900 dark:text-ink-100 rounded-bl-sm"
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-black/5 dark:border-white/5 p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-ink-700 dark:text-ink-300 hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入你的問題..."
              className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <Button type="submit">
              <PaperAirplaneIcon className="h-4 w-4" />
              送出
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
