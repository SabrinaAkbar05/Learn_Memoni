import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {GoogleAuthProvider,createUserWithEmailAndPassword,onAuthStateChanged,sendPasswordResetEmail,signInWithEmailAndPassword,signInWithPopup,signOut,type User} from 'firebase/auth';
import {doc,getDoc,setDoc} from 'firebase/firestore';
import {firebaseAuth,firestore,CLOUD_CONFIGURED} from './firebase';
type Role='learner'|'expert'|'admin';
type AuthState={user:User|null;role:Role;loading:boolean;configured:boolean;login:(email:string,password:string)=>Promise<void>;signup:(name:string,email:string,password:string)=>Promise<void>;google:()=>Promise<void>;logout:()=>Promise<void>;resetPassword:(email:string)=>Promise<void>};
const Context=createContext<AuthState|null>(null);
async function ensureMember(u:User){if(!firestore)return 'learner' as Role;const ref=doc(firestore,'users',u.uid);const result=await getDoc(ref);if(!result.exists())await setDoc(ref,{name:u.displayName||'',email:u.email||'',role:'learner',createdAt:new Date().toISOString()});const role=result.exists()?result.data().role:'learner';return role==='admin'||role==='expert'?role:'learner';}
export function AuthProvider({children}:{children:ReactNode}){const [user,setUser]=useState<User|null>(null);const [role,setRole]=useState<Role>('learner');const [loading,setLoading]=useState(CLOUD_CONFIGURED);
 useEffect(()=>{if(!firebaseAuth){setLoading(false);return}return onAuthStateChanged(firebaseAuth,async u=>{setUser(u);setLoading(true);try{setRole(u?await ensureMember(u):'learner')}catch(err){console.error('Profile lookup error',err);setRole('learner')}finally{setLoading(false)}},()=>setLoading(false))},[]);
 async function login(email:string,password:string){if(!firebaseAuth)throw Error('Cloud account is not configured.');await signInWithEmailAndPassword(firebaseAuth,email,password)}
 async function signup(name:string,email:string,password:string){if(!firebaseAuth)throw Error('Cloud account is not configured.');const cred=await createUserWithEmailAndPassword(firebaseAuth,email,password);if(firestore){await setDoc(doc(firestore,'users',cred.user.uid),{name:name.trim(),email,role:'learner',createdAt:new Date().toISOString()},{merge:true})}}
 async function google(){if(!firebaseAuth)throw Error('Cloud account is not configured.');await signInWithPopup(firebaseAuth,new GoogleAuthProvider())}
 async function logout(){if(firebaseAuth)await signOut(firebaseAuth)}
 async function resetPassword(email:string){if(!firebaseAuth)throw Error('Cloud account is not configured.');await sendPasswordResetEmail(firebaseAuth,email)}
 return <Context.Provider value={{user,role,loading,configured:CLOUD_CONFIGURED,login,signup,google,logout,resetPassword}}>{children}</Context.Provider>}
export function useAuth(){const v=useContext(Context);if(!v)throw Error('AuthProvider missing');return v}
