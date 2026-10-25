import {useMemo,useState} from 'react';
import {Search,SlidersHorizontal,X} from 'lucide-react';
import {useSearchParams} from 'react-router-dom';
import {CATEGORIES,WORDS} from '../data/catalog';
import type {Word} from '../types';
import {PageHeader} from '../components/Layout';
import {WordCard} from '../components/WordCard';
import {WordModal} from '../components/WordModal';
import {Empty} from '../components/Empty';
export default function Dictionary(){const [params,setParams]=useSearchParams();const [search,setSearch]=useState('');const [difficulty,setDifficulty]=useState('all');const [modal,setModal]=useState<Word|null>(null);
 const category=params.get('category')||'all';const filtered=useMemo(()=>WORDS.filter(w=>{
 const matchCat=category==='all'||w.category===category;
 const matchLevel=difficulty==='all'||w.difficulty===difficulty;
 const q=search.trim().toLocaleLowerCase();
 const matchSearch=!q||[w.memoni_script,w.roman_memoni,w.english_meaning,w.urdu_meaning,...w.tags].some(v=>v.toLocaleLowerCase().includes(q));
 return matchCat&&matchLevel&&matchSearch;
 }),[search,category,difficulty]);
 return <div><PageHeader eyebrow="THE LIVING DICTIONARY" title="Words worth remembering." description="Explore real Memoni words, their meanings, and the voices that bring them to life."/><div className="dictionary-panel"><div className="dictionary-bar"><div className="search-control"><Search size={20}/><input aria-label="Search dictionary" autoComplete="off" placeholder="Search Memoni, Roman, English or Urdu..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button className="icon-button" aria-label="Clear search" onClick={()=>setSearch('')}><X size={17}/></button>}</div><div className="level-control"><SlidersHorizontal size={17}/><select aria-label="Filter by difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option></select></div></div><div className="category-filter" aria-label="Dictionary categories"><button className={category==='all'?'active':''} onClick={()=>setParams({})}>✦ All topics</button>{CATEGORIES.map(c=><button className={category===c.id?'active':''} key={c.id} onClick={()=>setParams({category:c.id})}>{c.emoji} {c.name}</button>)}</div></div><div className="results-line"><div><b>{filtered.length}</b> {filtered.length===1?'word':'words'} found <span className="results-hint">· Select a card to see its details</span></div><span>Original Memoni dictionary · {WORDS.length} entries</span></div>{filtered.length?<div className="word-grid">{filtered.map(w=><WordCard key={w.id} word={w} onOpen={setModal}/>)}</div>:<Empty title="No words found" description="Try searching in another language, changing your level, or choosing a different category." icon="🌱"/>}<WordModal word={modal} onClose={()=>setModal(null)}/></div>
}
