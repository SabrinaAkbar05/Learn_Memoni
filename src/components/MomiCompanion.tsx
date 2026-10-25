import {useState} from 'react';
import {X} from 'lucide-react';
const TIPS=[
 'Learn one word today. Tomorrow, it might turn into a conversation. 🌷',
 'Native recordings have a speaker icon. If there is no clip, we won’t guess the pronunciation.',
 'Use “Got it” in flashcards to schedule the next review. Your future self will thank you! ✨',
 'You can search the dictionary in English, Urdu, Roman Memoni, or Memoni script.',
 'Save your favorite words and revisit them in My collection. 💌',
 'Your progress is saved locally. Keep a copy of your browser data until cloud sync launches.'
];
export function MomiCompanion(){const [open,setOpen]=useState(false);const [idx,setIdx]=useState(0);return <div className="momi-companion">{open&&<div className="momi-chat"><button className="icon-button" aria-label="Close Momi tip" onClick={()=>setOpen(false)}><X size={14}/></button><b>A little tip from Momi 🌸</b><p>{TIPS[idx%TIPS.length]}</p><button onClick={()=>setIdx(i=>i+1)}>Another tip →</button></div>}<button className="momi-fab" aria-label={open?'Close Momi tips':'Ask Momi for a learning tip'} aria-expanded={open} onClick={()=>setOpen(x=>!x)}><span>✿</span></button></div>}
