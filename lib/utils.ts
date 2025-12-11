import { twMerge, type ClassNameValue } from "tailwind-merge"

export const cn = (...classes: ClassNameValue[]) => {
  return twMerge(...classes.filter(Boolean))
}