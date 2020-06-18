import { Escape } from '../utils/escape';

export function URL(domain: string): RegExp {
  return new RegExp(`^(?:https?://)?(?:www\\.)?${Escape.regex(domain)}`, 'i');
}

export const YOUTUBE = URL('youtube.com');
