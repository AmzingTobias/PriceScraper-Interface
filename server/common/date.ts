// Convert the date string in the format dd-mm-yyyy to a date object
export const date_string_to_date = (date_string: string) => {
  const [day, month, year] = date_string.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  return new Date(parseInt(year), monthIndex, parseInt(day));
};
