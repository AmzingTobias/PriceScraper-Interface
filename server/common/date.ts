/**
 * Convert the date string in the format dd-mm-yyyy to a date object
 * @param date_string A string in the format of a date
 * @returns The date object extracted from teh string
 */
export const date_string_to_date = (date_string: string) => {
  const [day, month, year] = date_string.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
};

export const get_today_date_as_string = (): string => {
  const today = new Date();
  const date_string = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getUTCMonth() + 1
  ).padStart(2, "0")}-${today.getUTCFullYear()}`;
  return date_string;
};

export const get_today_date_as_string_with_time = (): string => {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}T${hours}:${minutes}:${seconds}`;
};

export const MISSING_DATE_MSG = "Missing date in request";
