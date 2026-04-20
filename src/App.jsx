import React, { useState, useEffect } from 'react';
import SongSelection from './components/SongSelection';
import PlayerView from './components/PlayerView';
import LoginView from './components/LoginView';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import { songs } from './data/songs';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('learn'); // learn, rank, profile
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('logged_in_email');
    if (savedEmail) {
      setCurrentUser(savedEmail);
    }
  }, []);

  const handleLogin = (email) => {
    localStorage.setItem('logged_in_email', email);
    setCurrentUser(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('logged_in_email');
    setCurrentUser(null);
    setCurrentTab('learn');
  };

  const handleSelectSong = (song) => {
    setCurrentSong(song);
  };

  const handleBack = () => {
    setCurrentSong(null);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // If playing a song, cover the entire screen
  if (currentSong) {
    return <PlayerView song={currentSong} onBack={handleBack} currentUserEmail={currentUser} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', flex: 1, position: 'relative' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {currentTab === 'learn' && <SongSelection songs={songs} onSelect={handleSelectSong} currentUserEmail={currentUser} />}
        {currentTab === 'rank' && <LeaderboardView currentUserEmail={currentUser} />}
        {currentTab === 'profile' && <ProfileView email={currentUser} onLogout={handleLogout} />}
      </div>
      
      {/* Bottom Tab Bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        height: '80px', background: 'white', borderTop: '2px solid var(--border-color)',
        display: 'flex', justifyItems: 'stretch', alignItems: 'center'
      }}>
        <button onClick={() => setCurrentTab('learn')} style={tabStyle(currentTab === 'learn')}>
          <div style={{ fontSize: '24px' }}>🏠</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Learn</div>
        </button>
        <button onClick={() => setCurrentTab('rank')} style={tabStyle(currentTab === 'rank')}>
          <div style={{ fontSize: '24px' }}>🛡️</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Rank</div>
        </button>
        <button onClick={() => setCurrentTab('profile')} style={tabStyle(currentTab === 'profile')}>
          <div style={{ fontSize: '24px' }}>👧</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Profile</div>
        </button>
      </div>
    </div>
  );
}

const tabStyle = (isActive) => ({
  flex: 1,
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%',
  color: isActive ? 'var(--primary-color)' : 'var(--text-light)',
  fontWeight: 800,
  opacity: isActive ? 1 : 0.5,
  transition: 'all 0.2s',
  outline: 'none'
});

export default App;
