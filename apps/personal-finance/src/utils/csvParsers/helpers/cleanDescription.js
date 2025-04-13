export default function cleanDescription(raw) {
  return raw
    .split(' ')
    .filter(part => !/^ID:/.test(part))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
