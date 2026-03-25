const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatPublishedDate(isoString: string | null) {
  if (!isoString) {
    return "Draft";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return DATE_FORMATTER.format(date);
}

export function formatDateTime(isoString: string | null) {
  if (!isoString) {
    return "Not scheduled";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return DATE_TIME_FORMATTER.format(date);
}

export function toDateTimeLocalValue(isoString: string | null) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return [
    local.getFullYear(),
    pad(local.getMonth() + 1),
    pad(local.getDate()),
  ].join("-") + `T${pad(local.getHours())}:${pad(local.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
