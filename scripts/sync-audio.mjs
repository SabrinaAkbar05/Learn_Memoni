import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const wordsPath = path.join(projectRoot, 'src/data/words.json');
const audioDir = path.join(projectRoot, 'public/audio');
const oldAudioMapPath = path.join(projectRoot, 'src/data/audio-map.json');
const manifestPath = path.join(projectRoot, 'src/data/audio-manifest.json');

const words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
const audioFiles = fs.readdirSync(audioDir);
const oldAudioMap = fs.existsSync(oldAudioMapPath)
  ? JSON.parse(fs.readFileSync(oldAudioMapPath, 'utf8'))
  : {};

export function normalizeAudioPhrase(text) {
  if (!text) return '';
  return text
    .replace(/[_\-\/\\]+/g, ' ')
    .replace(/['’`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const oggFiles = audioFiles.filter(f => f.toLowerCase().endsWith('.ogg'));
const m4aFiles = audioFiles.filter(f => f.toLowerCase().endsWith('.m4a'));

// Index words by normalized English meaning
const wordsByNormEnglish = new Map();
for (const w of words) {
  const norm = normalizeAudioPhrase(w.english_meaning);
  if (!wordsByNormEnglish.has(norm)) {
    wordsByNormEnglish.set(norm, []);
  }
  wordsByNormEnglish.get(norm).push(w);
}

const manifest = {};
const matchedOggFiles = new Set();
const unmatchedOggFiles = [];
const ambiguousOggFiles = [];

// 1. Baseline of existing m4a recordings in public/audio
const CANONICAL_M4A_RECORDINGS = {
  "greet_001": "Salam.m4a",
  "greet_002": "Kien_ayo.m4a",
  "greet_003": "aoun_theek_ayan.m4a",
  "greet_004": "Khuda_hafiz.m4a",
  "greet_005": "Mehrbani.m4a",
  "greet_006": "Khush_amded.m4a",
  "greet_007": "Maaf_krja.m4a",
  "greet_011": "Phir_milengy.m4a",
  "greet_012": "Mubarak.m4a",
  "greet_013": "dua_mai_yaad_rkhja.m4a",
  "family_001": "Abbu.m4a",
  "family_002": "Ammi.m4a",
  "family_004": "Nani.m4a",
  "family_005": "Nana.m4a",
  "family_006": "Beti.m4a",
  "family_007": "Beta.m4a",
  "family_012": "Shohar.m4a",
  "food_001": "Roti.m4a",
  "food_002": "Chawal.m4a",
  "food_004": "Doodh.m4a",
  "food_005": "Machli.m4a",
  "food_008": "Chai.m4a",
  "food_009": "Piyaaz.m4a",
  "food_010": "Allo.m4a",
  "numbers_001": "One.m4a",
  "numbers_002": "Two.m4a",
  "numbers_003": "Three.m4a",
  "numbers_004": "Four.m4a",
  "numbers_005": "Five.m4a",
  "numbers_006": "Six.m4a",
  "numbers_007": "Seven.m4a",
  "numbers_008": "Eight.m4a",
  "numbers_009": "Nine.m4a",
  "numbers_010": "Ten.m4a",
  "numbers_011": "Eleven.m4a",
  "numbers_012": "Twelve.m4a",
  "numbers_013": "Thirteen.m4a",
  "numbers_014": "Fourteen.m4a",
  "numbers_015": "Fifteen.m4a",
  "numbers_016": "Twenty.m4a",
  "numbers_017": "Twenty_five.m4a",
  "numbers_018": "Fifty.m4a",
  "numbers_019": "Hundred.m4a",
  "daily_001": "Your_name.m4a",
  "daily_002": "My_name.m4a",
  "daily_003": "From_where.m4a",
  "daily_004": "From_Karachi.m4a",
  "daily_005": "Price.m4a",
  "daily_006": "Hunger.m4a",
  "daily_008": "Love.m4a",
  "daily_009": "Sleep.m4a",
  "daily_010": "Going.m4a",
  "daily_013": "Time.m4a",
  "daily_015": "Pain.m4a",
  "daily_018": "What_day.m4a",
  "daily_019": "Where_live.m4a"
};

for (const [key, filename] of Object.entries(CANONICAL_M4A_RECORDINGS)) {
  if (fs.existsSync(path.join(audioDir, filename))) {
    manifest[key] = {
      primary: filename,
      format: 'm4a',
      m4a: filename
    };
  }
}

// 3. Match new .ogg recordings deterministically based on English meaning
for (const file of oggFiles) {
  const baseName = file.replace(/\.ogg$/i, '');
  const norm = normalizeAudioPhrase(baseName);
  const matches = wordsByNormEnglish.get(norm) || [];

  if (matches.length === 1) {
    const word = matches[0];
    matchedOggFiles.add(file);

    const existing = manifest[word.id] || {};
    const fallback = existing.m4a || (existing.primary && existing.primary !== file ? existing.primary : undefined);

    manifest[word.id] = {
      primary: file,
      ogg: file,
      ...(fallback ? { fallback, m4a: fallback } : {}),
      format: 'ogg'
    };
  } else if (matches.length === 0) {
    unmatchedOggFiles.push(file);
  } else {
    ambiguousOggFiles.push({ file, matches: matches.map(m => m.id) });
  }
}

// 4. Build sorted clean audio-map.json (for backwards-compatible Record<string, string>)
const flatAudioMap = {};
for (const [key, info] of Object.entries(manifest)) {
  flatAudioMap[key] = info.primary;
}

// Write out files
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
fs.writeFileSync(oldAudioMapPath, JSON.stringify(flatAudioMap, null, 2) + '\n', 'utf8');

const wordsWithoutAudio = words.filter(w => !manifest[w.id]);

console.log('✅ Audio sync completed successfully!');
console.log(`- Total audio files in public/audio: ${audioFiles.length}`);
console.log(`- Total .ogg files discovered: ${oggFiles.length}`);
console.log(`- Successfully matched .ogg recordings: ${matchedOggFiles.size}`);
console.log(`- Unmatched .ogg recordings: ${unmatchedOggFiles.length} (${unmatchedOggFiles.join(', ') || 'none'})`);
console.log(`- Ambiguous matches: ${ambiguousOggFiles.length}`);
console.log(`- Total vocabulary entries with audio: ${Object.keys(manifest).length}`);
console.log(`- Total vocabulary entries without audio: ${wordsWithoutAudio.length} / ${words.length}`);
console.log(`- Words with both primary .ogg and fallback .m4a: ${Object.values(manifest).filter(v => v.fallback).length}`);
