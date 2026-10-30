import {useState,useEffect} from 'react';
import type {Word} from '../types';
import {getWordAudio} from '../data/catalog';

let currentAudio:HTMLAudioElement|null=null;
let currentWordId:string|null=null;
const listeners=new Set<(id:string|null)=>void>();

function notifyListeners(){
 listeners.forEach(fn=>fn(currentWordId));
}

export function getCurrentPlayingWordId():string|null{
 return currentWordId;
}

export function isAudioPlaying(wordId:string):boolean{
 return currentWordId===wordId;
}

export function stopAudio():void{
 if(currentAudio){
  try{
   currentAudio.pause();
   currentAudio.currentTime=0;
   currentAudio.onended=null;
   currentAudio.onerror=null;
  }catch{
   // ignore pause error
  }
  currentAudio=null;
 }
 if(currentWordId!==null){
  currentWordId=null;
  notifyListeners();
 }
}

/**
 * Checks if the browser supports OGG audio playback.
 */
function canPlayOgg():boolean{
 if(typeof window==='undefined'||typeof Audio==='undefined')return false;
 try{
  const probe=new Audio();
  const can=probe.canPlayType('audio/ogg');
  return can==='probably'||can==='maybe';
 }catch{
  return false;
 }
}

/**
 * Plays the native pronunciation recording for a given word.
 * Prioritizes the native .ogg recording when available.
 * If the browser cannot play .ogg or loading fails, gracefully falls back to the .m4a recording.
 * Prevents multiple recordings from playing simultaneously.
 */
export function playWordAudio(word:Word):boolean{
 if(!word)return false;

 // Toggle off if clicking the currently playing word
 if(currentWordId===word.id){
  stopAudio();
  return true;
 }

 stopAudio();

 const entry=getWordAudio(word);
 if(!entry||!entry.primary){
  return false;
 }

 let primaryFile=entry.primary;
 let fallbackFile=entry.fallback;

 // If primary is ogg but browser explicitly cannot play ogg, switch to fallback
 if(primaryFile.endsWith('.ogg')&&!canPlayOgg()&&fallbackFile){
  primaryFile=fallbackFile;
  fallbackFile=undefined;
 }

 const playFile=(filename:string,hasFallback:boolean):boolean=>{
  try{
   const audio=new Audio(`/audio/${encodeURIComponent(filename)}`);
   currentAudio=audio;
   currentWordId=word.id;
   notifyListeners();

   audio.onended=()=>{
    if(currentAudio===audio){
     stopAudio();
    }
   };

   audio.onerror=()=>{
    if(hasFallback&&fallbackFile){
     const nextFallback=fallbackFile;
     fallbackFile=undefined;
     playFile(nextFallback,false);
    }else{
     stopAudio();
    }
   };

   const playPromise=audio.play();
   if(playPromise!==undefined){
    playPromise.catch((err)=>{
     if(err&&err.name==='AbortError')return;
     if(hasFallback&&fallbackFile){
      const nextFallback=fallbackFile;
      fallbackFile=undefined;
      playFile(nextFallback,false);
     }else{
      stopAudio();
     }
    });
   }
   return true;
  }catch{
   stopAudio();
   return false;
  }
 };

 return playFile(primaryFile,Boolean(fallbackFile));
}

/**
 * Reusable React hook for listening and controlling audio playback state.
 */
export function useAudioPlayback(){
 const [playingId,setPlayingId]=useState<string|null>(currentWordId);

 useEffect(()=>{
  const listener=(id:string|null)=>setPlayingId(id);
  listeners.add(listener);
  setPlayingId(currentWordId);
  return ()=>{
   listeners.delete(listener);
  };
 },[]);

 return {
  playingId,
  isPlaying:(id:string)=>playingId===id,
  play:playWordAudio,
  stop:stopAudio
 };
}
