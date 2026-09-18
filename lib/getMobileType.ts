export function getMobileType() {
  const userAgent = navigator.userAgent || navigator.vendor;

  if (/android/i.test(userAgent)) {
    return "android";
  } else if (/iPad|iPhone|iPod/.test(userAgent)) {
    return "ios";
  } else {
    return "other";
  }
}