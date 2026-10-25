import type {Word} from '../types';
import {AUDIO_FILES} from '../data/catalog';
let current:HTMLAudioElement|null=null;
export function stopAudio(){current?.pause();current=null;}
export function playWordAudio(word:Word){
 const filename=AUDIO_FILES[word.audio_key];if(!filename)return false;
 stopAudio();const audio=new Audio(`/audio/${encodeURIComponent(filename)}`);current=audio;
 void audio.play().catch(()=>{current=null;});return true;
}
