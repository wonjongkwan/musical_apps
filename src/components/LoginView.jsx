import React, { useState } from 'react';

function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // Always login on frontend even if API is missing (Vercel deployment)
      onLogin(email);
    } catch(err) {
      console.log('API not found, using local mode');
      onLogin(email); 
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ justifyContent: 'center', backgroundColor: 'var(--background-color)' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '40px', marginBottom: '16px' }}>Musical Lingo</h1>
        <p style={{ color: 'var(--text-light)', fontWeight: 700 }}>Learn English through songs!</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px' }}>
        <input 
          type="email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          style={{
            padding: '16px',
            borderRadius: '16px',
            border: '2px solid var(--border-color)',
            fontSize: '16px',
            fontFamily: 'var(--font-main)',
            fontWeight: 700,
            color: 'var(--text-main)',
            outline: 'none'
          }}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'LOADING...' : 'START LEARNING'}
        </button>
      </form>
    </div>
  );
}

export default LoginView;
