import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PROJECT_DOMAIN =
  import.meta.env.MODE === "development"
    ? ".localhost"
    : ".zosair.com";

