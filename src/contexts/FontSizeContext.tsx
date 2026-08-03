import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type FontSize = "normal" | "large" | "xlarge";

const SIZE_PX: Record<FontSize, string> = {
  normal: "16px",
  large: "18px",
  xlarge: "20px",
};

const SIZE_ORDER: FontSize[] = ["normal", "large", "xlarge"];

interface FontSizeContextValue {
  fontSize: FontSize;
  increase: () => void;
  decrease: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontSizeContext = createContext<FontSizeContextValue | undefined>(undefined);

const STORAGE_KEY = "printos-font-size";

function getInitialFontSize(): FontSize {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "normal" || stored === "large" || stored === "xlarge") return stored;
  return "normal";
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>(getInitialFontSize);

  useEffect(() => {
    document.documentElement.style.fontSize = SIZE_PX[fontSize];
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  const index = SIZE_ORDER.indexOf(fontSize);

  const increase = () => {
    const next = SIZE_ORDER[Math.min(index + 1, SIZE_ORDER.length - 1)];
    setFontSize(next);
  };

  const decrease = () => {
    const next = SIZE_ORDER[Math.max(index - 1, 0)];
    setFontSize(next);
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSize,
        increase,
        decrease,
        canIncrease: index < SIZE_ORDER.length - 1,
        canDecrease: index > 0,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize 必須在 FontSizeProvider 內使用");
  return ctx;
}
