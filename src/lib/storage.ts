import type {LearningData} from '../types';
import {localDay,shiftDay} from './learning';
const KEY='memoni_v3_studio';
const defaults:LearningData={name:'Learner',avatar:'rose',goal:10,xp:0,streak:0,lastActive:'',favorites:[],learned:[],completedLessons:[],reviewed:{},quiz:{answered:0,correct:0},quizRewarded:{},categoryBest:{},activity:{},contributions:[],stories:[],videos:[],dailyChallenge:{},dailyStats:{},finishedScenarios:[],notes:{},dark:false,onboarded:false};
function readLegacy():Partial<LearningData>{
 try {
 const saved=JSON.parse(localStorage.getItem('momi_saved')||'[]');
 const quiz=JSON.parse(localStorage.getItem('momi_quizStats')||'{}');
 const rawProgress=JSON.parse(localStorage.getItem('momi_catProgress')||'{}');
 const prev=localStorage.getItem('momi_lastVisit')||'';
 const last=prev?localDay(new Date(prev)):'';
 return {favorites:Array.isArray(saved)?saved:[],xp:Math.max(0,Number(localStorage.getItem('momi_xp'))||0),streak:Math.max(0,Number(localStorage.getItem('momi_streak'))||0),lastActive:last,quiz:{answered:quiz.total||0,correct:quiz.correct||0},categoryBest:rawProgress,dark:localStorage.getItem('momi_dark')==='1',onboarded:localStorage.getItem('momi_onboarded')==='1'};
 }catch {return {};}
}
export function loadData():LearningData {
 try {
  const raw=localStorage.getItem(KEY)||localStorage.getItem('memoni_v2_local');
  const val=raw?JSON.parse(raw):readLegacy();
  const data:LearningData={...defaults,...val,quiz:{...defaults.quiz,...val.quiz},activity:val.activity||{},reviewed:val.reviewed||{},categoryBest:val.categoryBest||{},quizRewarded:val.quizRewarded||{},favorites:Array.isArray(val.favorites)?val.favorites:[],learned:Array.isArray(val.learned)?val.learned:[],completedLessons:Array.isArray(val.completedLessons)?val.completedLessons:[],contributions:Array.isArray(val.contributions)?val.contributions:[],videos:Array.isArray(val.videos)?val.videos:[],stories:Array.isArray(val.stories)?val.stories:[],dailyChallenge:val.dailyChallenge||{},dailyStats:val.dailyStats||{},finishedScenarios:Array.isArray(val.finishedScenarios)?val.finishedScenarios:[],notes:val.notes||{},avatar:typeof val.avatar==='string'?val.avatar:'rose'};
  if(data.lastActive && data.lastActive<shiftDay(-1))data.streak=0;
  return data;
 }catch {return {...defaults};}
}
export function saveData(data:LearningData){try {localStorage.setItem(KEY,JSON.stringify(data));}catch { /* storage disabled */ }}
