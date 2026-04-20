import React, { useState, useEffect } from 'react';

const mockUsers = [
  { id: 1, name: 'Jessie', xp: 4500, avatar: '🦊' },
  { id: 2, name: 'Alex', xp: 4200, avatar: '🐯' },
  { id: 3, name: 'Taylor', xp: 3800, avatar: '🐶' },
  { id: 4, name: 'Sam', xp: 3100, avatar: '🐼' },
  { id: 5, name: 'Jordan', xp: 2900, avatar: '🦁' },
];

function LeaderboardView({ currentUserEmail }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(realUsers => {
        let allUsers = [...mockUsers];
        
        // Add real users
        realUsers.forEach(u => {
          allUsers.push({
            id: u.email,
            name: u.name || u.email.split('@')[0],
            xp: u.xp || 0,
            avatar: u.avatar || '😎',
            isMe: u.email === currentUserEmail,
            isReal: true
          });
        });

        // Filter out duplicate mock user if the current user was already inserted
        if (!realUsers.some(u => u.email === currentUserEmail)) {
           const saved = localStorage.getItem(`profile_${currentUserEmail}`);
           let currentUserProfile = { name: currentUserEmail.split('@')[0], totalScore: 0, avatar: '😎' };
           if (saved) {
             currentUserProfile = JSON.parse(saved);
           }
           allUsers.push({ id: 'me', name: currentUserProfile.name, xp: currentUserProfile.totalScore, avatar: currentUserProfile.avatar, isMe: true, isReal: true });
        }

        allUsers.sort((a, b) => b.xp - a.xp);
        setLeaderboard(allUsers);
      })
      .catch(e => console.error(e));
  }, [currentUserEmail]);

  return (
    <div className="container" style={{ padding: '20px 20px 100px', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Leaderboard</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {leaderboard.map((user, index) => (
          <div key={user.id} style={{
            display: 'flex', alignItems: 'center', padding: '16px',
            border: '2px solid',
            borderColor: user.isMe ? 'var(--primary-color)' : 'var(--border-color)',
            backgroundColor: user.isMe ? '#F4FCE3' : 'white',
            borderRadius: '16px'
          }}>
            <div style={{ width: '30px', fontWeight: 800, color: 'var(--text-light)', fontSize: '18px' }}>
              {index + 1}
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--bg-light)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', marginRight: '16px' }}>
              {user.avatar}
            </div>
            <div style={{ flex: 1, fontWeight: 800, fontSize: '18px', color: user.isMe ? 'var(--primary-color)' : 'var(--text-main)' }}>
              {user.name} {user.isMe && '(You)'} {(user.isReal && !user.isMe) && <span style={{fontSize: '12px', color: '#1cb0f6', marginLeft: '4px'}}>(Real Player)</span>}
            </div>
            <div style={{ fontWeight: 800, color: 'var(--secondary-color)' }}>
              {user.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardView;
