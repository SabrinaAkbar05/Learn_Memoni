import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {scheduleReview,videoFromUrl} from '../src/lib/learning.ts';
const base=new URL('../src/data/',import.meta.url);
const words=JSON.parse(readFileSync(new URL('words.json',base),'utf8'));
const audioMap=JSON.parse(readFileSync(new URL('audio-map.json',base),'utf8'));
const videos=JSON.parse(readFileSync(new URL('videos.json',base),'utf8'));
test('merges latest GitHub and earlier original sources without losing words',()=>{
 assert.equal(words.length,222);
 assert.equal(new Set(words.map(w=>w.id)).size,222);
 const grouped=Object.groupBy(words,w=>w.category);
 assert.equal(Object.keys(grouped).length,11);
 for(const [category,items] of Object.entries(grouped))assert.ok(items.length>=20,`${category} incomplete`);
});
test('all entries preserve core language fields and flag incomplete translations for review',()=>{
 for(const word of words){
  for(const field of ['id','category','english_meaning','urdu_meaning'])assert.ok(word[field],`${word.id} missing ${field}`);
  if(!word.roman_memoni||!word.memoni_script)assert.equal(word.manual_review,true,`${word.id} must be flagged for expert review`);
 }
});
test('all 55 source audio recordings match an actual archived file',()=>{
 assert.equal(Object.keys(audioMap).length,55);
 const ids=new Set(words.map(w=>w.audio_key));
 for(const [id,filename] of Object.entries(audioMap)){
  assert.ok(ids.has(id),`${id} has no word`);
  assert.ok(existsSync(new URL(`../public/audio/${filename}`,import.meta.url)),`${filename} missing`);
 }
});
test('five original Google Drive lessons preserved',()=>{
 assert.equal(videos.length,5);
 for(const video of videos){assert.equal(video.provider,'Google Drive');assert.ok(video.embed.startsWith('https://drive.google.com/file/d/'))}
});
test('daily review schedules: good pushes forward, again comes back today',()=>{
 const date='2026-10-25';const a=scheduleReview(undefined,'good',date);assert.equal(a.due,'2026-10-26');
 const b=scheduleReview(a,'good',date);assert.equal(b.due,'2026-10-28');
 const c=scheduleReview(b,'again',date);assert.equal(c.due,date);assert.equal(c.repetitions,0);
});
test('safe media links permit only recognized HTTPS domains',()=>{
 assert.deepEqual(videoFromUrl('https://youtu.be/dQw4w9WgXcQ'),{embed:'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',provider:'YouTube'});
 assert.equal(videoFromUrl('javascript:alert(1)'),null);
 assert.equal(videoFromUrl('https://untrusted.example/?v=dQw4w9WgXcQ'),null);
});
test('React app exposes all primary feature routes',()=>{
 const app=readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
 for(const route of ['learn','dictionary','practice','saved','progress','media','community','talk','challenges','heritage','profile','studio'])assert.ok(app.includes(`path="${route}"`),`/${route} route missing`);
});
test('security rules prevent self-granted administrator roles',()=>{
 const rules=readFileSync(new URL('../firebase/firestore.rules',import.meta.url),'utf8');
 assert.ok(rules.includes("request.resource.data.role == 'learner'"));
 assert.ok(rules.includes("changedKeys().hasOnly(['name','email'])"));
 assert.ok(rules.includes('function staff()'));
});
