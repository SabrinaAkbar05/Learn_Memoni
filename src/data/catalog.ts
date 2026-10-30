import source from './words.json';
import audioMap from './audio-map.json';
import audioManifest from './audio-manifest.json';
import originalVideos from './videos.json';
import type {Word,Video,AudioEntry} from '../types';
export const WORDS=source as Word[];
export const VERIFIED_WORDS=WORDS.filter(w=>Boolean(w.roman_memoni?.trim())&&Boolean(w.memoni_script?.trim()));
export const ORIGINAL_VIDEOS=originalVideos as Video[];
export const CATEGORIES=[
 {id:'greetings',name:'Greetings',urdu:'سلام',emoji:'🤝',color:'#f2c0b4',description:'First hellos, polite expressions & warm welcomes'},
 {id:'family',name:'Family',urdu:'خاندان',emoji:'👨‍👩‍👧',color:'#f1d69b',description:'The people who make a house a home'},
 {id:'food',name:'Food & Drink',urdu:'کھانا',emoji:'🍛',color:'#bed5b7',description:'From kitchens to family tables'},
 {id:'numbers',name:'Numbers',urdu:'نمبر',emoji:'🔢',color:'#dfd2ef',description:'Count your way through the day'},
 {id:'colours',name:'Colours',urdu:'رنگ',emoji:'🎨',color:'#f3c2d2',description:'Give the world its colors'},
 {id:'body_parts',name:'Body Parts',urdu:'جسم',emoji:'💪',color:'#b9d4d9',description:'Everyday words about the body'},
 {id:'daily_phrases',name:'Daily Phrases',urdu:'جملے',emoji:'💬',color:'#e9bdb2',description:'Little conversations that make a big difference'},
 {id:'emotions',name:'Emotions',urdu:'جذبات',emoji:'😊',color:'#ebc4d8',description:'Name what you feel'},
 {id:'shopping',name:'Shopping',urdu:'خریداری',emoji:'🛍️',color:'#f0d59f',description:'At the market and on the street'},
 {id:'travel',name:'Travel',urdu:'سفر',emoji:'✈️',color:'#bdd7ca',description:'Words for going places'},
 {id:'religious',name:'Faith & Traditions',urdu:'دینی',emoji:'🤲',color:'#d3c4e2',description:'Familiar traditions and expressions'}
] as const;
export const AUDIO_FILES:Record<string,string>=audioMap;
export const AUDIO_MANIFEST:Record<string,AudioEntry>=audioManifest as Record<string,AudioEntry>;
export const WORDS_BY_ID=new Map(WORDS.map(w=>[w.id,w]));
export function hasAudio(w:Word){return Boolean(AUDIO_MANIFEST[w.audio_key]||AUDIO_FILES[w.audio_key]);}
export function getWordAudio(w:Word):AudioEntry|null{return AUDIO_MANIFEST[w.audio_key]||(AUDIO_FILES[w.audio_key]?{primary:AUDIO_FILES[w.audio_key],format:AUDIO_FILES[w.audio_key].endsWith('.ogg')?'ogg':'m4a'}:null);}
export const lessonsFor=(cat:string)=>Math.ceil(VERIFIED_WORDS.filter(w=>w.category===cat).length/5);
export const TOTAL_LESSONS=CATEGORIES.reduce((total,c)=>total+lessonsFor(c.id),0);
export function getWordOfDay(){const d=new Date();const start=new Date(d.getFullYear(),0,1);const day=Math.floor((d.getTime()-start.getTime())/86400000);return VERIFIED_WORDS[day%VERIFIED_WORDS.length];}
