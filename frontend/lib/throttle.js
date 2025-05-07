export default function throttle(func, limit) {
  let lastRun = 0;
  let timeout;
  return function (...args) {
    const context = this;
    const now = Date.now();
    const remainingTime = limit - (now - lastRun);

    if (remainingTime <= 0) {
      if (timeout) clearTimeout(timeout);
      func.apply(context, args);
      lastRun = now;
    } else {
      if (!timeout) {
        timeout = setTimeout(() => {
          func.apply(context, args);
          lastRun = Date.now();
          timeout = null;
        }, remainingTime);
      }
    }
  };
}
