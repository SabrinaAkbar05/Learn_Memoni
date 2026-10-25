import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {LearningData,Contribution,Video,Story} from '../types';
import {loadData,saveData} from './storage';
import {localDay,shiftDay,scheduleReview} from './learning';
import {WORDS_BY_ID} from '../data/catalog';
type ProfileFields=Partial<Pick<LearningData,'name'|'avatar'|'goal'|'dark'|'onboarded'>>;
type ContextValue={data:LearningData;addXP:(n:number)=>void;toggleFavorite:(id:string)=>void;markLearned:(id:string)=>void;review:(id:string,grade:'again'|'good')=>void;quizAnswer:(correct:boolean,id?:string)=>void;finishQuiz:(cat:string,accuracy:number)=>void;completeLesson:(cat:string,part:number,wordIds:string[])=>void;addContribution:(v:Omit<Contribution,'id'|'createdAt'|'status'>)=>Contribution;updateContribution:(id:string,fields:Partial<Contribution>)=>void;addStory:(s:Omit<Story,'id'|'createdAt'|'status'>)=>Story;deleteStory:(id:string)=>void;updateStory:(id:string,fields:Partial<Story>)=>void;addVideo:(video:Omit<Video,'id'>)=>void;deleteVideo:(id:string)=>void;updateProfile:(fields:ProfileFields)=>void;updateNote:(id:string,note:string)=>void;completeChallenge:(id:string,reward:number)=>void;completeScenario:(id:string)=>void;replaceData:(next:LearningData)=>void;resetData:()=>void;};
const Context=createContext<ContextValue|null>(null);
const uid=()=>typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const isToday=(d:string)=>d===localDay();
export function LearningProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<LearningData>(loadData);
 useEffect(()=>saveData(data),[data]);
 useEffect(()=>{document.documentElement.dataset.theme=data.dark?'dark':'light'},[data.dark]);
 function transact(mutator:(old:LearningData)=>LearningData,activity=true){setData(old=>{const next=mutator(old);if(!activity)return next;const day=localDay();const consecutive=old.lastActive===shiftDay(-1);const streak=isToday(old.lastActive)?old.streak:consecutive?old.streak+1:1;return {...next,streak,lastActive:day,activity:{...next.activity,[day]:(next.activity[day]||0)+1}}})}
 const addXP=(n:number)=>transact(d=>({...d,xp:d.xp+Math.max(0,n)}));
 const toggleFavorite=(id:string)=>transact(d=>({...d,favorites:d.favorites.includes(id)?d.favorites.filter(x=>x!==id):[...d.favorites,id]}),false);
 const markLearned=(id:string)=>transact(d=>({...d,learned:d.learned.includes(id)?d.learned:[...d.learned,id],xp:d.learned.includes(id)?d.xp:d.xp+2}));
 const review=(id:string,grade:'again'|'good')=>transact(d=>({...d,reviewed:{...d.reviewed,[id]:scheduleReview(d.reviewed[id],grade)},learned:grade==='good'&&!d.learned.includes(id)?[...d.learned,id]:d.learned,xp:grade==='good'&&d.reviewed?.[id]?.lastReviewed!==localDay()?d.xp+5:d.xp,dailyStats:{...d.dailyStats,[localDay()]:{...(d.dailyStats?.[localDay()]||{quizCorrect:0,reviews:0,lessons:0}),reviews:(d.dailyStats?.[localDay()]?.reviews||0)+1}}}));
 const quizAnswer=(correct:boolean,id?:string)=>transact(d=>({...d,quiz:{answered:d.quiz.answered+1,correct:d.quiz.correct+(correct?1:0)},quizRewarded:{...d.quizRewarded,...(correct&&id?{[`${localDay()}:${id}`]:true}:{})},xp:d.xp+(correct&&id&&!d.quizRewarded?.[`${localDay()}:${id}`]?10:0),dailyStats:{...d.dailyStats,[localDay()]:{...(d.dailyStats?.[localDay()]||{quizCorrect:0,reviews:0,lessons:0}),quizCorrect:(d.dailyStats?.[localDay()]?.quizCorrect||0)+(correct?1:0)}}}));
 const finishQuiz=(cat:string,accuracy:number)=>transact(d=>({...d,categoryBest:{...d.categoryBest,[cat]:Math.max(accuracy,d.categoryBest[cat]||0)}}),false);
 const completeLesson=(cat:string,part:number,wordIds:string[])=>transact(d=>{const id=`${cat}:${part}`;const complete=d.completedLessons.includes(id);return {...d,completedLessons:complete?d.completedLessons:[...d.completedLessons,id],learned:[...new Set([...d.learned,...wordIds.filter(w=>WORDS_BY_ID.has(w))])],xp:d.xp+(complete?0:25),dailyStats:{...d.dailyStats,[localDay()]:{...(d.dailyStats?.[localDay()]||{quizCorrect:0,reviews:0,lessons:0}),lessons:(d.dailyStats?.[localDay()]?.lessons||0)+(complete?0:1)}}}});
 const addContribution=(v:Omit<Contribution,'id'|'createdAt'|'status'>)=>{const item:Contribution={...v,id:uid(),createdAt:new Date().toISOString(),status:'local-draft'};transact(d=>({...d,contributions:[item,...d.contributions]}),false);return item;};
 const updateContribution=(id:string,fields:Partial<Contribution>)=>transact(d=>({...d,contributions:d.contributions.map(c=>c.id===id?{...c,...fields}:c)}),false);
 const addStory=(s:Omit<Story,'id'|'createdAt'|'status'>)=>{const story:Story={...s,id:uid(),createdAt:new Date().toISOString(),status:'local-draft'};transact(d=>({...d,stories:[story,...d.stories]}),false);return story;};
 const deleteStory=(id:string)=>transact(d=>({...d,stories:d.stories.filter(s=>s.id!==id)}),false);
 const updateStory=(id:string,fields:Partial<Story>)=>transact(d=>({...d,stories:d.stories.map(s=>s.id===id?{...s,...fields}:s)}),false);
 const addVideo=(video:Omit<Video,'id'>)=>transact(d=>({...d,videos:[...d.videos,{...video,id:uid()}]}),false);
 const deleteVideo=(id:string)=>transact(d=>({...d,videos:d.videos.filter(x=>x.id!==id)}),false);
 const updateProfile=(fields:ProfileFields)=>transact(d=>({...d,...fields}),false);
 const updateNote=(id:string,note:string)=>transact(d=>({...d,notes:{...d.notes,[id]:note}}),false);
 const completeChallenge=(id:string,reward:number)=>transact(d=>d.dailyChallenge[`${localDay()}:${id}`]?d:{...d,xp:d.xp+reward,dailyChallenge:{...d.dailyChallenge,[`${localDay()}:${id}`]:true}});
 const completeScenario=(id:string)=>transact(d=>d.finishedScenarios?.includes(id)?d:{...d,finishedScenarios:[...(d.finishedScenarios||[]),id],xp:d.xp+35});
 return <Context.Provider value={{data,addXP,toggleFavorite,markLearned,review,quizAnswer,finishQuiz,completeLesson,addContribution,updateContribution,addStory,deleteStory,updateStory,addVideo,deleteVideo,updateProfile,updateNote,completeChallenge,completeScenario,replaceData:setData,resetData:()=>setData(loadEmptyData())}}>{children}</Context.Provider>
}
function loadEmptyData(){const d=loadData();return {...d,xp:0,streak:0,lastActive:'',favorites:[],learned:[],completedLessons:[],reviewed:{},quiz:{answered:0,correct:0},quizRewarded:{},categoryBest:{},activity:{},contributions:[],stories:[],videos:[],dailyChallenge:{},dailyStats:{},finishedScenarios:[],notes:{}} as LearningData}
export function useLearning(){const v=useContext(Context);if(!v)throw Error('LearningProvider missing');return v}
