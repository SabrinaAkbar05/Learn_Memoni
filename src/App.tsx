import {Navigate,Route,Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import Home from './pages/Home';
import Learn,{Lesson} from './pages/Learn';
import Dictionary from './pages/Dictionary';
import Practice from './pages/Practice';
import Saved from './pages/Saved';
import Progress from './pages/Progress';
import Media from './pages/Media';
import Community from './pages/Community';
import Talk from './pages/Talk';
import Challenges from './pages/Challenges';
import Heritage from './pages/Heritage';
import Profile from './pages/Profile';
import Studio from './pages/Studio';
export default function App(){return <Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="learn" element={<Learn/>}/><Route path="learn/:category/:part" element={<Lesson/>}/><Route path="dictionary" element={<Dictionary/>}/><Route path="practice" element={<Practice/>}/><Route path="saved" element={<Saved/>}/><Route path="progress" element={<Progress/>}/><Route path="media" element={<Media/>}/><Route path="community" element={<Community/>}/><Route path="talk" element={<Talk/>}/><Route path="challenges" element={<Challenges/>}/><Route path="heritage" element={<Heritage/>}/><Route path="profile" element={<Profile/>}/><Route path="studio" element={<Studio/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>}
