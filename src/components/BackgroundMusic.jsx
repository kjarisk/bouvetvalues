import { useState, useEffect, useRef } from 'react';
import '../styles/background-music.css';

function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('bouvet_music_muted');
    return saved === 'true';
  });
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // 30% volume
      audioRef.current.muted = isMuted;
      
      // Try to play (browsers may block autoplay)
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay prevented:', error);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    localStorage.setItem('bouvet_music_muted', isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // If unmuting and paused, try to play
    if (isMuted && audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(error => {
        console.log('Play prevented:', error);
      });
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src={`${import.meta.env.BASE_URL}music.mp3`} type="audio/mpeg" />
        <source src={`${import.meta.env.BASE_URL}music.ogg`} type="audio/ogg" />
      </audio>
      
      <button 
        className="sound-toggle"
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute music' : 'Mute music'}
        title={isMuted ? 'Turn sound on' : 'Turn sound off'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </>
  );
}

export default BackgroundMusic;

