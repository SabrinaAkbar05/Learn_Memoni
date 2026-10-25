import type {CSSProperties} from 'react';
export const AVATARS=[
 {id:'rose',name:'Rose',skin:'#e9ad85',hair:'#452d2e',shirt:'#d78385',bg:'#f8e1de',style:'hijab'},
 {id:'sage',name:'Sage',skin:'#c48967',hair:'#2b2326',shirt:'#789986',bg:'#e0eddf',style:'short'},
 {id:'lilac',name:'Lilac',skin:'#a86648',hair:'#34212b',shirt:'#9576b8',bg:'#eee1f3',style:'curly'},
 {id:'sunny',name:'Sunny',skin:'#f0bd90',hair:'#51312f',shirt:'#dfaa4c',bg:'#fff0c9',style:'long'},
 {id:'ocean',name:'Ocean',skin:'#b77b5c',hair:'#2f2e35',shirt:'#648fb1',bg:'#dcecf5',style:'short'},
 {id:'peach',name:'Peach',skin:'#d79c77',hair:'#5a342d',shirt:'#e39a78',bg:'#f9e5d7',style:'hijab'},
 {id:'plum',name:'Plum',skin:'#976044',hair:'#27212a',shirt:'#a05c79',bg:'#f6dbe7',style:'curly'},
 {id:'mint',name:'Mint',skin:'#d6a27e',hair:'#3b3435',shirt:'#7baea6',bg:'#daf1e9',style:'long'},
 {id:'sky',name:'Sky',skin:'#b27755',hair:'#2f2426',shirt:'#6e96c6',bg:'#e3ebfc',style:'hijab'},
 {id:'gold',name:'Gold',skin:'#edb48a',hair:'#574334',shirt:'#c69c51',bg:'#fff0d9',style:'curly'},
 {id:'berry',name:'Berry',skin:'#a76a52',hair:'#211f29',shirt:'#bf819e',bg:'#fae7ef',style:'long'},
 {id:'forest',name:'Forest',skin:'#c18a6d',hair:'#302b2b',shirt:'#668b7c',bg:'#e7eee0',style:'short'}
] as const;
export function Avatar({id='rose',size=48,className='',ring=false}:{id?:string;size?:number;className?:string;ring?:boolean}){
 const person=AVATARS.find(a=>a.id===id)||AVATARS[0];
 return <svg className={`avatar-art ${className}`} style={{flexShrink:0,...(ring?{outline:'3px solid #fff',boxShadow:'0 0 0 4px #e8afa7'}:{})} as CSSProperties} width={size} height={size} viewBox="0 0 100 100" fill="none" role="img" aria-label={`${person.name} illustrated avatar`}>
 <defs><clipPath id={`clip-${person.id}`}><circle cx="50" cy="50" r="50"/></clipPath></defs>
 <g clipPath={`url(#clip-${person.id})`}><rect width="100" height="100" fill={person.bg}/><circle cx="80" cy="17" r="23" fill="#fff" opacity=".22"/><circle cx="15" cy="88" r="20" fill="#fff" opacity=".23"/>
 <path d="M10 110C10 74 27 73 39 70h22C77 74 92 84 91 110" fill={person.shirt}/>
 {person.style==='hijab'?<><path d="M22 62C10 43 21 10 51 10c28 0 39 25 29 52l11 41H10z" fill={person.shirt}/><ellipse cx="50" cy="46" rx="22" ry="28" fill={person.skin}/><path d="M27 39Q30 15 50 18q25 0 25 26Q69 27 50 26q-16-1-23 13Z" fill={person.shirt}/><path d="M23 73q10 21 27 24 20-3 28-24" stroke="#fff" strokeWidth="2" opacity=".35"/></>:<>
 <ellipse cx="50" cy="43" rx="25" ry="29" fill={person.hair}/>
 {person.style==='long'&&<path d="M24 30q-10 34-4 67h17l3-47M78 32q14 37 7 66H63l-4-49" fill={person.hair}/>}
 {person.style==='curly'&&<>{[25,36,48,61,72].map((x,i)=><circle key={i} cx={x} cy={23+(i%2)*-4} r="12" fill={person.hair}/>)}</>}
 <ellipse cx="50" cy="47" rx="22" ry="27" fill={person.skin}/><path d="M27 36Q32 17 53 20q20 1 22 17Q58 27 51 30q-14 8-24 6" fill={person.hair}/>
 </>}
 <path d="M35 50q5-4 10 0M56 50q5-4 10 0" stroke="#392f32" strokeWidth="2.4" strokeLinecap="round"/><circle cx="40" cy="51" r="1.8" fill="#392f32"/><circle cx="61" cy="51" r="1.8" fill="#392f32"/>
 <path d="M45 62q5 5 11 0" stroke="#a45e5f" strokeWidth="2" strokeLinecap="round"/><ellipse cx="34" cy="59" rx="5" ry="3" fill="#e38f88" opacity=".34"/><ellipse cx="66" cy="59" rx="5" ry="3" fill="#e38f88" opacity=".34"/>
 </g></svg>
}
