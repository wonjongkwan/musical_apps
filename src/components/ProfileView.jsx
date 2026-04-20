import React, { useState, useEffect } from 'react';

function ProfileView({ email, onLogout }) {
  const [profile, setProfile] = useState({ name: '', avatar: '😎', totalScore: 0, streak: 1 });
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`profile_${email}`);
    if (saved) {
      setProfile(JSON.parse(saved));
    } else {
      // Default profile based on email
      const newProfile = { name: email.split('@')[0], avatar: '😎', totalScore: 0, streak: 1 };
      setProfile(newProfile);
      localStorage.setItem(`profile_${email}`, JSON.stringify(newProfile));
    }
  }, [email]);

  const saveProfile = () => {
    const updated = { ...profile, name: editName || profile.name };
    setProfile(updated);
    localStorage.setItem(`profile_${email}`, JSON.stringify(updated));
    setIsEditing(false);
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: updated.name })
    }).catch(console.error);
  };

  const avatars = ['😎', '🦄', '🐶', '🦊', '🐱', '🐸', '🚀', '⭐'];

  const changeAvatar = (a) => {
    const updated = { ...profile, avatar: a };
    setProfile(updated);
    localStorage.setItem(`profile_${email}`, JSON.stringify(updated));
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, avatar: updated.avatar })
    }).catch(console.error);
  };

  return (
    <div className="container" style={{ padding: '20px 20px 100px', overflowY: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>My Profile</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          backgroundColor: 'var(--warning-color)', color: 'white',
          fontSize: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 8px 0 var(--warning-shadow)', margin: '0 auto 20px'
        }}>
          {profile.avatar}
        </div>
        
        {isEditing ? (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                 value={editName} onChange={e=>setEditName(e.target.value)} 
                 placeholder="Your name" autoFocus
                 style={{ padding: '8px', borderRadius: '8px', border: '2px solid var(--border-color)', fontWeight: 'bold' }}
              />
              <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', width: 'auto' }} onClick={saveProfile}>Save</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {avatars.map(a => (
                <button key={a} onClick={() => changeAvatar(a)} style={{ background: 'none', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '24px', padding: '8px', cursor: 'pointer' }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '24px' }}>{profile.name}</h3>
            <button style={{ background: 'var(--bg-light)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setIsEditing(true); setEditName(profile.name); }}>✏️</button>
          </div>
        )}
        <p style={{ color: 'var(--text-light)', marginTop: '8px', fontWeight: 600 }}>{email}</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <div style={{ flex: 1, border: '2px solid var(--border-color)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
           <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
           <div style={{ fontWeight: 800, fontSize: '20px' }}>{profile.streak}</div>
           <div style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 600 }}>Day Streak</div>
        </div>
        <div style={{ flex: 1, border: '2px solid var(--border-color)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
           <div style={{ fontSize: '24px', marginBottom: '8px' }}>💎</div>
           <div style={{ fontWeight: 800, fontSize: '20px' }}>{profile.totalScore}</div>
           <div style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 600 }}>Total XP</div>
        </div>
      </div>

      <button className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--border-color)' }} onClick={onLogout}>
        LOG OUT
      </button>
    </div>
  );
}

export default ProfileView;
