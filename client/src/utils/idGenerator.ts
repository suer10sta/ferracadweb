export function generateIdFacturation(): string {
  const prefix = "FAC";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const timePart = Date.now().toString().slice(-5);
  const randomPart = Math.floor(Math.random() * 900 + 100);

  return `${prefix}-${datePart}-${timePart}-${randomPart}`;
}
