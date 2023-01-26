import moment from "moment";
export const makeElipsisAddress = (
  address: string,
  padding = 6
): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(address.length - padding)}`;
};



export const fromUnixToString = (time: number, format = "MMM DD, YYYY h:mm a") => {
  return moment.unix(time).format(format);
};