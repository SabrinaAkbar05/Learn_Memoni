import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { normalizeAudioPhrase, matchAudioFilenameToWord } from '../src/lib/audio-matcher.ts';

const base = new URL('../src/data/', import.meta.url);
const words = JSON.parse(readFileSync(new URL('words.json', base), 'utf8'));
const audioManifest = JSON.parse(readFileSync(new URL('audio-manifest.json', base), 'utf8'));
const audioMap = JSON.parse(readFileSync(new URL('audio-map.json', base), 'utf8'));
const publicAudioDir = new URL('../public/audio/', import.meta.url);

test('normalizeAudioPhrase handles case, whitespace, hyphens, and punctuation correctly', () => {
  // Case insensitivity
  assert.equal(normalizeAudioPhrase('Good Morning'), 'good morning');
  assert.equal(normalizeAudioPhrase('GOOD MORNING'), 'good morning');
  assert.equal(normalizeAudioPhrase('how ARE you?'), 'how are you');

  // Punctuation removal
  assert.equal(normalizeAudioPhrase('How are you?'), 'how are you');
  assert.equal(normalizeAudioPhrase('Thank You!'), 'thank you');
  assert.equal(normalizeAudioPhrase("I don't understand"), 'i dont understand');
  assert.equal(normalizeAudioPhrase("I dont understand"), 'i dont understand');

  // Hyphens, underscores and whitespace
  assert.equal(normalizeAudioPhrase('Twenty_five'), 'twenty five');
  assert.equal(normalizeAudioPhrase('Twenty-five'), 'twenty five');
  assert.equal(normalizeAudioPhrase('  see   you   later  '), 'see you later');

  // Avoids falsely matching similar but different phrases
  assert.notEqual(
    normalizeAudioPhrase('How much does this cost'),
    normalizeAudioPhrase('How much is this?')
  );
});

test('deterministic matching connects .ogg filenames to vocabulary entries', () => {
  const oggTestCases = [
    { file: 'How are you.ogg', expectedId: 'greet_002' },
    { file: 'How much is this.ogg', expectedId: 'daily_005' },
    { file: 'I am fine.ogg', expectedId: 'greet_003' },
    { file: 'I am from Karachi.ogg', expectedId: 'daily_004' },
    { file: 'I am hungry.ogg', expectedId: 'daily_006' },
    { file: 'I am sleepy.ogg', expectedId: 'daily_009' },
    { file: 'I am thirsty.ogg', expectedId: 'daily_007' },
    { file: "I don't understand.ogg", expectedId: 'daily_011' },
    { file: 'Remember me in your prayers.ogg', expectedId: 'greet_013' },
    { file: 'see you later.ogg', expectedId: 'greet_011' },
    { file: 'Thank You.ogg', expectedId: 'greet_005' },
    { file: 'What is your name.ogg', expectedId: 'daily_001' },
    { file: 'my name is momi.ogg', expectedId: 'daily_002' },
    { file: 'where are you from.ogg', expectedId: 'daily_003' },
  ];

  for (const { file, expectedId } of oggTestCases) {
    const { word, ambiguity } = matchAudioFilenameToWord(file, words);
    assert.ok(word, `Expected match for ${file}`);
    assert.equal(word.id, expectedId, `Expected ${file} to match ${expectedId}, got ${word.id}`);
    assert.equal(ambiguity.length, 0, `Expected no ambiguity for ${file}`);
  }

  // Verify unmatched recording without false positive
  const unmatched = matchAudioFilenameToWord('How much does this cost.ogg', words);
  assert.equal(unmatched.word, null, 'How much does this cost.ogg must NOT match any word falsely');
});

test('all 15 discovered .ogg recordings are accounted for with no silent drops', () => {
  const allPublicFiles = readdirSync(publicAudioDir);
  const oggFiles = allPublicFiles.filter(f => f.toLowerCase().endsWith('.ogg'));
  assert.equal(oggFiles.length, 15, 'Expected exactly 15 .ogg files in public/audio');

  const matched = [];
  const unmatched = [];

  for (const ogg of oggFiles) {
    const { word } = matchAudioFilenameToWord(ogg, words);
    if (word) matched.push({ ogg, word });
    else unmatched.push(ogg);
  }

  assert.equal(matched.length, 14);
  assert.deepEqual(unmatched, ['How much does this cost.ogg']);
});

test('audio manifest prioritizes new native .ogg recordings and preserves .m4a fallbacks', () => {
  // Check that words with both formats prioritize .ogg as primary
  const dualAudioWords = ['greet_002', 'greet_003', 'greet_005', 'greet_011', 'greet_013', 'daily_001', 'daily_002', 'daily_003', 'daily_004', 'daily_005', 'daily_006', 'daily_009'];
  
  for (const id of dualAudioWords) {
    const entry = audioManifest[id];
    assert.ok(entry, `Missing manifest entry for ${id}`);
    assert.ok(entry.primary.endsWith('.ogg'), `${id} primary must be .ogg, got ${entry.primary}`);
    assert.ok(entry.fallback && entry.fallback.endsWith('.m4a'), `${id} must have .m4a fallback`);
    assert.ok(existsSync(new URL(entry.primary, publicAudioDir)), `Missing file ${entry.primary}`);
    assert.ok(existsSync(new URL(entry.fallback, publicAudioDir)), `Missing file ${entry.fallback}`);
  }

  // Check words with only .ogg
  const oggOnlyWords = ['daily_007', 'daily_011'];
  for (const id of oggOnlyWords) {
    const entry = audioManifest[id];
    assert.ok(entry, `Missing manifest entry for ${id}`);
    assert.ok(entry.primary.endsWith('.ogg'), `${id} primary must be .ogg`);
    assert.ok(existsSync(new URL(entry.primary, publicAudioDir)), `Missing file ${entry.primary}`);
  }

  // Check that all 58 manifest entries reference real files
  for (const [id, entry] of Object.entries(audioManifest)) {
    assert.ok(existsSync(new URL(entry.primary, publicAudioDir)), `Manifest primary missing: ${entry.primary} for ${id}`);
    if (entry.fallback) {
      assert.ok(existsSync(new URL(entry.fallback, publicAudioDir)), `Manifest fallback missing: ${entry.fallback} for ${id}`);
    }
  }
});
