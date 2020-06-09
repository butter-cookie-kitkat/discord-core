import { Escape } from "../utils/escape";

export const URL = (domain) => {
  return new RegExp(`^(?:https?://)?(?:www\\.)?${Escape.regex(domain)}`, 'i');
}

export const YOUTUBE = URL('youtube.com');
