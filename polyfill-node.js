// Polyfill URL.parse for Node.js < 22 (required by Expo CLI in Expo SDK 58)
if (!URL.parse) {
  URL.parse = function (url, base) {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}
