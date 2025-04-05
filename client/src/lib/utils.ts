import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Extract country code and local number
  const countryCode = phoneNumber.slice(0, phoneNumber.length - cleaned.length + 1);
  const localNumber = cleaned.slice(countryCode.length - 1);
  
  // Format local number with spaces or dashes
  let formatted = '';
  for (let i = 0; i < localNumber.length; i++) {
    if (i > 0 && i % 3 === 0) {
      formatted += ' ';
    }
    formatted += localNumber[i];
  }
  
  return `${countryCode} ${formatted}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatMessageDate(date: Date | string): string {
  const messageDate = new Date(date);
  const now = new Date();
  
  // Today
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Within a week
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (messageDate > oneWeekAgo) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  }
  
  // Older messages
  return messageDate.toLocaleDateString([], { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
