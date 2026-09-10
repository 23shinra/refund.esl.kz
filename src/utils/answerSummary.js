/**
 * Short preview of a long answer for list cards.
 */
export function answerSummary(answer, languageId, maxLen = 260) {
  const text =
    typeof answer === 'string'
      ? answer
      : answer?.[languageId] ?? answer?.ru ?? answer?.kz ?? '';
  if (!text) return '';
  const firstBlock = text.split(/\n\n+/)[0]?.trim() || text.trim();
  const compact = firstBlock.replace(/\s*\n\s*/g, ' ').trim();
  if (compact.length <= maxLen) return compact;
  const cut = compact.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > 120 ? cut.slice(0, lastSpace) : cut;
  return `${safe.trimEnd()}…`;
}
