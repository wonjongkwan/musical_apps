import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

function PlayerView({ song, onBack, currentUserEmail }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [score, setScore] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [duration, setDuration] = useState(song.lyrics[song.lyrics.length - 1].time + 4);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  const currentLyricIndex = song.lyrics.findIndex((l, idx) => {
    const nextLyric = song.lyrics[idx + 1];
    return currentTime >= l.time && (!nextLyric || currentTime < nextLyric.time);
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setRecognizedText(prev => prev + " " + currentTranscript.toLowerCase());
      };

      recognition.onerror = (e) => console.log('Speech Recognition Error: ', e);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current && isListening) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, [isListening]);

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      if (isListening && recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
        setIsListening(false);
      }
    } else {
      if (audioRef.current) audioRef.current.play();
      setIsPlaying(true);
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch(e){}
        setIsListening(true);
      }
    }
  };

  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime;
    setCurrentTime(time);

    // Countdown logic
    const firstSingable = song.lyrics.find(l => !l.text.startsWith('('));
    if (firstSingable) {
      const waitTime = firstSingable.time - time;
      if (waitTime > 0 && waitTime <= 3.2) {
        const seconds = Math.ceil(waitTime);
        if (seconds !== countdown) {
          setCountdown(seconds);
        }
      } else if (countdown !== null) {
        setCountdown(null);
      }
    }
  };
  const handleLoadedMetadata = (e) => setDuration(e.target.duration || duration);
  const handleAudioEnded = () => finishSong();

  const finishSong = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e){}
      setIsListening(false);
    }
    
    // Simple scoring logic based on words
    const fullLyrics = song.lyrics.map(l => l.text.toLowerCase()).join(" ");
    const lyricWords = fullLyrics.split(" ");
    const spokenWords = recognizedText.split(" ");
    
    let matches = 0;
    lyricWords.forEach(word => {
      if (spokenWords.some(sw => sw.includes(word))) matches++;
    });
    
    let calculatedScore = Math.round((matches / lyricWords.length) * 100);
    if (spokenWords.length > 3) calculatedScore = Math.max(40, calculatedScore);
    else calculatedScore = Math.max(10, calculatedScore); // Pity score
    // In strict mode (high levels), maybe penalize instead of pity, but for now we rely on requiredAccuracy check
    
    const finalScore = Math.min(100, calculatedScore);
    setScore(finalScore);
    
    // Check if passed based on song.requiredAccuracy
    const required = song.requiredAccuracy || 50;
    let isPassed = finalScore >= required;
    
    // For demo purpose, if they click SKIP, give random score around the requirement
    if (spokenWords.length <= 1) {
       // Mock pass if they didn't speak just to let them test skipping
       isPassed = true;
       setScore(required + Math.floor(Math.random() * 10));
    }

    if (isPassed) {
      setStatusText("LEVEL CLEARED! 🎉");
      // Fire confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ff92', '#1cb0f6', '#ff4b4b']
      });
      // Fire again for big effect if level is a multiple of 10
      if (song.level % 10 === 0) {
        setTimeout(() => confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } }), 500);
      }
    } else {
      setStatusText("NOT QUITE! 😢 Keep practicing.");
    }

    // Update local profile stats
    if (currentUserEmail) {
       const key = `profile_${currentUserEmail}`;
       const profile = JSON.parse(localStorage.getItem(key) || '{}');
       
       let newMaxLevel = profile.maxUnlockedLevel || 1;
       if (isPassed && song.level === newMaxLevel) {
          newMaxLevel = song.level + 1;
       }

       const updatedProfile = { 
         ...profile, 
         totalScore: (profile.totalScore || 0) + finalScore * 10,
         streak: (profile.streak || 1),
         maxUnlockedLevel: newMaxLevel
       };
       localStorage.setItem(key, JSON.stringify(updatedProfile));
       
       // Post to server
       fetch('/api/profile', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: currentUserEmail, xp: updatedProfile.totalScore, streak: updatedProfile.streak })
       }).catch(console.error);
    }
  };

  if (score !== null) {
    return (
      <div className="container" style={{ backgroundColor: 'var(--background-color)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="score-screen">
          <h2 style={{ color: statusText.includes('CLEARED') ? 'var(--primary-color)' : 'var(--danger-color)', fontSize: '32px', marginBottom: '16px' }}>{statusText}</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-light)', fontSize: '18px', fontWeight: 800 }}>Accuracy: {score}% / Required: {song.requiredAccuracy}%</p>
          <div className="score-circle">
            {score}%
          </div>
          <p style={{ color: 'var(--warning-color)', fontWeight: 800, marginTop: '20px' }}>+ {score * 10} XP earned</p>
        </div>
        <div className="bottom-panel">
          <button className="btn btn-warning" onClick={onBack}>
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ backgroundColor: 'white', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }}>
      {song.audioUrl && (
        <audio 
          ref={audioRef} 
          src={song.audioUrl} 
          playsInline 
          webkit-playsinline="true"
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      )}

      {/* Player Top Bar (X and Progress Bar) */}
      <div className="player-top">
        <button className="btn-close" onClick={onBack}>×</button>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="lyrics-container">
        {song.isVocal && currentTime < 5 && (
          <div style={{ color: 'var(--secondary-color)', fontWeight: 800, marginBottom: '10px', fontSize: '14px' }}>
            🎤 VOCAL GUIDE MODE
          </div>
        )}
        <div className="mic-status-container">
           <div className={`mic-button ${isListening ? 'listening' : ''}`}>
             🎙️
           </div>
           <div className="mic-status-text">
             {isListening ? 'Sing now...' : 'Tap to start'}
           </div>
        </div>

        {countdown && (
          <div key={countdown} className="countdown-overlay">
            {countdown}
          </div>
        )}

        {song.lyrics.map((lyric, idx) => {
          const isActive = idx === currentLyricIndex;
          const isPast = idx < currentLyricIndex;
          if (idx < currentLyricIndex - 1 || idx > currentLyricIndex + 1) return null;

          return (
            <div key={idx} className={`lyric-line ${isActive ? 'active' : ''}`} style={{ display: isPast && !isActive ? 'none' : 'block' }}>
              {lyric.text}
            </div>
          );
        })}
      </div>

      <div className="bottom-panel">
        <button className={`btn ${isPlaying ? 'btn-outline' : 'btn-primary'}`} onClick={togglePlay}>
          {isPlaying ? 'PAUSE' : 'START SINGING'}
        </button>
        {isPlaying && (
           <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={finishSong}>
             SKIP TO END
           </button>
        )}
      </div>
    </div>
  );
}

export default PlayerView;
