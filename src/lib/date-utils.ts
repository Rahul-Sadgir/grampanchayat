const MARATHI_MONTHS = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

const MARATHI_WEEKDAYS = [
  "रविवार",
  "सोमवार",
  "मंगळवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
];

const MARATHI_DIGITS: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

export function toMarathiDigits(num: number | string): string {
  return String(num)
    .split("")
    .map((char) => MARATHI_DIGITS[char] || char)
    .join("");
}

export function formatMarathiDate(dateInput: Date | string | number | undefined | null) {
  const d = dateInput ? new Date(dateInput) : new Date(2026, 9, 15);
  const day = d.getDate();
  const dayStr = toMarathiDigits(String(day).padStart(2, "0"));
  const monthIdx = d.getMonth();
  const monthName = MARATHI_MONTHS[monthIdx] || "ऑक्टोबर";
  const shortMonth = monthName.slice(0, 5);
  const year = toMarathiDigits(d.getFullYear());
  const weekday = MARATHI_WEEKDAYS[d.getDay()] || "सोमवार";

  return {
    day: dayStr,
    month: shortMonth,
    fullMonth: monthName,
    year,
    weekday,
    formatted: `${weekday}, ${toMarathiDigits(day)} ${monthName} ${year}`,
  };
}
