import {ArrowRight,Heart} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import {PageHeader} from '../components/Layout';
import {WordCard} from '../components/WordCard';
import {WordModal} from '../components/WordModal';
import {Empty} from '../components/Empty';
import {WORDS_BY_ID} from '../data/catalog';
import {useLearning} from '../lib/LearningContext';
import type {Word} from '../types';
export default function Saved(){const {data}=useLearning();const [open,setOpen]=useState<Word|null>(null);const words=data.favorites.map(id=>WORDS_BY_ID.get(id)).filter((x):x is Word=>Boolean(x));return <div><PageHeader eyebrow="A COLLECTION OF LITTLE TREASURES" title="Your favorite words." description="All the words you want to remember, in one cozy place." action={<span className="progress-badge"><Heart size={17}/>{words.length} saved</span>}/>{words.length?<div className="word-grid">{words.map(word=><WordCard key={word.id} word={word} onOpen={setOpen}/>)}</div>:<Empty icon="💌" title="Your collection is waiting" description="Find a word you love and tap the bookmark to save it here." action={<Link to="/dictionary" className="btn btn-primary">Explore the dictionary <ArrowRight size={17}/></Link>}/>}<WordModal word={open} onClose={()=>setOpen(null)}/></div>}
