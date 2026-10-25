import type {ReactNode} from 'react';
export function Empty({icon='🌷',title,description,action}:{icon?:string;title:string;description:string;action?:ReactNode}){return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{action}</div>}
