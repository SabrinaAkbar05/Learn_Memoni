import type {Word} from '../types';

/**
 * Normalizes an audio filename (without extension) or an English meaning
 * for deterministic vocabulary matching.
 * 
 * Rules:
 * - Case-insensitive
 * - Replaces hyphens, underscores, and slashes with whitespace
 * - Removes apostrophes (so "don't" and "dont" match)
 * - Removes remaining punctuation and special characters
 * - Collapses multiple spaces and trims
 */
export function normalizeAudioPhrase(text: string): string {
  if (!text) return '';
  return text
    .replace(/[_\-\/\\]+/g, ' ')
    .replace(/['’`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips file extensions (.ogg, .m4a, .mp3, etc.) from audio filenames.
 */
export function getAudioBaseName(filename: string): string {
  return filename.replace(/\.[a-zA-Z0-9]+$/, '');
}

/**
 * Deterministically matches an audio filename to a vocabulary word based on its English meaning.
 * Returns null if no match or if ambiguous.
 */
export function matchAudioFilenameToWord(
  filename: string,
  words: Word[]
): { word: Word | null; ambiguity: Word[] } {
  const baseName = getAudioBaseName(filename);
  const normFile = normalizeAudioPhrase(baseName);
  if (!normFile) {
    return { word: null, ambiguity: [] };
  }

  const matches = words.filter(w => normalizeAudioPhrase(w.english_meaning) === normFile);

  if (matches.length === 1) {
    return { word: matches[0], ambiguity: [] };
  }
  if (matches.length > 1) {
    return { word: null, ambiguity: matches };
  }
  return { word: null, ambiguity: [] };
}
