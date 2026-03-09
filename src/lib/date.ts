import dayjs from "dayjs";

export function formatDate(
  value?: string | null,
  template = "DD MMM YYYY, hh:mm A",
) {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(template) : "-";
}
