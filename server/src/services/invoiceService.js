import { nanoid } from "nanoid";

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `RL-${year}${month}-${nanoid(8).toUpperCase()}`;
};
