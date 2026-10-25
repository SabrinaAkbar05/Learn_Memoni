import {useEffect,useRef,useState} from 'react';
import {doc,getDoc,setDoc} from 'firebase/firestore';
import {useAuth} from './AuthContext';
import {useLearning} from './LearningContext';
import {firestore} from './firebase';
import type {LearningData} from '../types';
function combine(local:LearningData,remote:LearningData):LearningData{
 const combineIds=(a:string[],b:string[])=>[...new Set([...(a||[]),...(b||[])])];
 return {...local,...remote,
 name:remote.name||local.name,avatar:remote.avatar||local.avatar,goal:remote.goal||local.goal,
 xp:Math.max(local.xp||0,remote.xp||0),favorites:combineIds(local.favorites,remote.favorites),learned:combineIds(local.learned,remote.learned),completedLessons:combineIds(local.completedLessons,remote.completedLessons),
 reviewed:{...local.reviewed,...remote.reviewed},quiz:{answered:Math.max(local.quiz.answered,remote.quiz.answered),correct:Math.max(local.quiz.correct,remote.quiz.correct)},
 quizRewarded:{...local.quizRewarded,...remote.quizRewarded},categoryBest:{...local.categoryBest,...remote.categoryBest},activity:{...local.activity,...remote.activity},
 videos:[...new Map([...local.videos,...remote.videos].map(v=>[v.id,v])).values()],contributions:[...new Map([...local.contributions,...remote.contributions].map(v=>[v.id,v])).values()],
 stories:[...new Map([...local.stories,...remote.stories].map(v=>[v.id,v])).values()],dailyChallenge:{...local.dailyChallenge,...remote.dailyChallenge},dailyStats:{...local.dailyStats,...remote.dailyStats},finishedScenarios:combineIds(local.finishedScenarios||[],remote.finishedScenarios||[]),notes:{...local.notes,...remote.notes}
 };
}
export function CloudSync(){const {user}=useAuth();const {data,replaceData}=useLearning();const [readyUid,setReadyUid]=useState('');const latest=useRef(data);useEffect(()=>{latest.current=data},[data]);
 useEffect(()=>{if(!user||!firestore){setReadyUid('');return}const uid=user.uid;let active=true;setReadyUid('');void (async()=>{try{const ref=doc(firestore!,'users',uid,'private','progress');const result=await getDoc(ref);if(!active)return;if(result.exists()){replaceData(combine(latest.current,result.data() as LearningData))}else{await setDoc(ref,latest.current)}if(active)setReadyUid(uid)}catch(e){console.error('Cloud sync unavailable',e);if(active)setReadyUid('')}})();return()=>{active=false}},[user?.uid]);
 useEffect(()=>{if(!firestore||!user||readyUid!==user.uid)return;const id=setTimeout(()=>{void setDoc(doc(firestore!,'users',user.uid,'private','progress'),data).catch(err=>console.error('Progress sync failed',err))},900);return()=>clearTimeout(id)},[data,readyUid,user?.uid]);return null;
}
