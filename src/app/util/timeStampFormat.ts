import { Timestamp } from "firebase/firestore";

export function timeStampFormat(createdAt: Timestamp) {
  if (createdAt) {
    const date = new Date( createdAt.seconds *1000).toISOString();
    // const year = date.getFullYear();
    // const month = date.getMonth() + 1;
    // const day = date.getDate();
    // const hour = String(date.getHours()).padStart(2, "0");
    // const minutes = String(date.getMinutes()).padStart(2, "0");
    // const createdAtSimple = `${year}-${month}-${day} ${hour}:${minutes}`;
    return date;
  }
}
export function timeStampFormatNotHour(createdAt: Timestamp) {
  if (createdAt) {
    const date = new Date(createdAt.seconds);
    const year = date.getFullYear();
    // month 10 이하면 0 붙여주기
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const createdAtSimple = `${year}${month}${day}`;
    return createdAtSimple;
  }
}
