import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  return months[monthIndex]
}

export function getMonthSlug(date: Date): string {
  return `${getMonthName(date.getMonth())}-${date.getFullYear()}`
}
