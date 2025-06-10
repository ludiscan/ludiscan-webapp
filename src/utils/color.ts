export function getRandomPrimitiveColor(): string {
  const colors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FFFF33', // Yellow
    '#FF33FF', // Magenta
    '#33FFFF', // Cyan
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
