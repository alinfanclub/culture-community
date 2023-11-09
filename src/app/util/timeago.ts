import { Timestamp } from "firebase/firestore";
import { format, register } from "timeago.js";
import KoLocale from "timeago.js/lib/lang/ko";
register("ko", KoLocale);

export function formatAgo(date: Timestamp, lang = "ko") {
  const covert = new Date( date.seconds *1000);
  return format(covert, lang);
}
