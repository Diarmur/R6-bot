function withTimestamp(method: (...args: any[]) => void) {
  return (...args: any[]) => {
    const timestamp = new Date().toISOString();
    method(`[${timestamp}]`, ...args);
  };
}

console.log = withTimestamp(console.log);
console.info = withTimestamp(console.info);
console.warn = withTimestamp(console.warn);
console.error = withTimestamp(console.error);
