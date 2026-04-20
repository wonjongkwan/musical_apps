import React, { useEffect, useState } from 'react';

function SongSelection({ songs, onSelect, currentUserEmail }) {
  const [profile, setProfile] = useState({ totalScore: 0, streak: 1, maxUnlockedLevel: 1 });

  useEffect(() => {
    if (currentUserEmail) {
      const saved = localStorage.getItem(`profile_${currentUserEmail}`);
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    }
  }, [currentUserEmail]);

  const maxLevel = profile.maxUnlockedLevel || 1;

  // Group songs by stage
  const stages = [1, 2, 3, 4, 5];

  return (
    <div className="container" style={{ backgroundColor: 'var(--background-color)' }}>
      {/* Duolingo style Top Header */}
      <div className="top-bar">
        <div className="stat stat-gems">
          <span style={{ fontSize: '20px' }}>💎</span> {profile.totalScore}
        </div>
        <div className="stat stat-streak">
          <span style={{ fontSize: '20px' }}>🔥</span> {profile.streak}
        </div>
      </div>

      <div className="path-container" style={{ paddingBottom: '120px' }}>
        {stages.map(stage => {
          const stageSongs = songs.filter(s => s.stage === stage);
          const bgColors = ['transparent', '#e0f7fa', '#fff9c4', '#e8f5e9', '#f3e5f5'];
          const stageColor = bgColors[stage - 1];

          return (
            <div key={`stage-${stage}`} style={{ backgroundColor: stageColor, padding: '20px 0', borderRadius: '24px', marginBottom: '20px' }}>
              <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', color: 'var(--text-main)' }}>
                Stage {stage}
              </h3>
              
              {stageSongs.map((song, index) => {
                const isLocked = song.level > maxLevel;
                const offset = index % 2 === 0 ? '-40px' : '40px';
                
                return (
                  <div 
                    key={song.id} 
                    className="path-node-wrapper"
                    style={{ transform: `translateX(${offset})` }}
                  >
                    <div className="node-label" style={{ color: isLocked ? '#AFAFAF' : 'var(--text-main)' }}>
                      Level {song.level}: {song.title} <br/>
                      <span style={{ fontSize: '10px' }}>Pass: {song.requiredAccuracy}%</span>
                    </div>
                    <div 
                      className={`path-node ${isLocked ? 'locked' : ''}`}
                      onClick={() => !isLocked && onSelect(song)}
                      style={{ 
                        opacity: isLocked ? 0.6 : 1, 
                        boxShadow: isLocked ? 'none' : '0 8px 0 var(--primary-shadow)'
                      }}
                    >
                      {isLocked ? '🔒' : song.icon}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SongSelection;
