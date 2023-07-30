/**
 * Convert the date string in the format dd-mm-yyyy to a date object
 * @param date_string A string in the format of a date
 * @returns The date object extracted from teh string
 */
export const date_string_to_date = (date_string: string) => {
  const [day, month, year] = date_string.split("-");
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
};

export const MISSING_DATE_MSG = "Missing date in request";
