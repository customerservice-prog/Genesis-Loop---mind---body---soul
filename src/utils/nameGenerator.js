/**
 * Generates a clean, URL-friendly repo name from a user prompt
 * e.g. "make me a marketing agency website" -> "marketing-agency-website"
 */
function generateRepoName(prompt) {
    // Common words to strip
  const stopWords = [
        'make', 'me', 'a', 'an', 'the', 'build', 'create', 'generate',
        'i', 'want', 'need', 'please', 'can', 'you', 'my', 'for', 'with',
        'that', 'and', 'or', 'but', 'simple', 'basic', 'new', 'some'
      ];

  const words = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0 && !stopWords.includes(word))
      .slice(0, 5); // max 5 meaningful words

  const name = words.join('-');

  // Ensure it starts with a letter and isn't empty
  const cleaned = name.replace(/^-+|-+$/g, '') || 'genesis-project';

  // GitHub repo name max 100 chars
  return cleaned.substring(0, 100);
}

module.exports = { generateRepoName };
