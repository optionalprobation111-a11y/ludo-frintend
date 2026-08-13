import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NamePromptPage from './pages/NamePromptPage.jsx'
import PlayRandomlyBoard from './pages/PlayRandomlyBoard.jsx'
import PlayWithFriendSetup from './pages/PlayWithFriendSetup.jsx'
import GameBoard from './pages/GameBoard.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<NamePromptPage />} />
      <Route path="/play/random" element={<PlayRandomlyBoard />} />
      <Route path="/play/friends" element={<PlayWithFriendSetup />} />
      <Route path="/room/:roomId" element={<GameBoard mode="multiplayer" />} />
      <Route path="/join/:roomId" element={<LoginPage redirectToRoom />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}
