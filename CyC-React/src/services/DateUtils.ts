export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date(NaN);
  if (dateString.includes("/")) {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  } else if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  }

  return new Date(dateString);
};

export const formatDateShortEs = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date
    .toLocaleString("es-AR", { month: "short" })
    .replace(".", "");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getPreviousWeekday = (date: Date, daysBack: number): Date => {
  const result = new Date(date);
  let daysToGoBack = 1;
  let weekdaysFound = 0;

  while (weekdaysFound < daysBack) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - daysToGoBack);
    const dayOfWeek = newDate.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdaysFound++;
      result.setTime(newDate.getTime());
    }

    daysToGoBack++;

    if (daysToGoBack > 100) {
      console.error("Error: Too many iterations in getPreviousWeekday");
      break;
    }
  }

  return result;
};

export const isWeekday = (date: Date): boolean => {
  const d = date.getDay();
  return d >= 1 && d <= 5;
};

export const formatYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDate = (date: Date): string => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${dayName} ${day}/${month}/${year}`;
};

export const formatDateWithDayName = (date: Date): string => {
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${dayName} - ${day}/${month}/${year}`;
};
