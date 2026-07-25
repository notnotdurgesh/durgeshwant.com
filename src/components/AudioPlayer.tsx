import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, FastForward } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
}

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      // duration is NaN until metadata loads, and Infinity for live streams.
      // Guarding here stops the bar being written as width: "NaN%".
      const total = audio.duration;
      setProgress(Number.isFinite(total) && total > 0 ? (audio.currentTime / total) * 100 : 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleEnded = () => {
      setProgress(0);
      setCurrentTime(0);
    };

    // Drive the button off the element's real state rather than assuming the
    // toggle succeeded — play() can be rejected by autoplay policy or a
    // decode error, which previously left the UI showing "playing" in silence.
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Auto-pause when leaving page
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch (error) {
      // Autoplay policy, a network failure or an unsupported codec.
      console.error('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) return;

    const time = (Number(e.target.value) / 100) * duration;
    audio.currentTime = time;
    setCurrentTime(time);
    setProgress(Number(e.target.value));
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changeSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-16 h-16 shrink-0 rounded-full bg-primary text-background flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>

        {/* Info & Progress */}
        <div className="flex-grow w-full space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground tracking-tight line-clamp-1">
              Listen: {title}
            </h3>
            <div className="flex items-center gap-4 text-muted font-mono text-xs tracking-widest">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-muted/20 rounded-full overflow-hidden group/slider cursor-pointer">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              aria-label={`Seek within ${title}`}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer
                         focus-visible:opacity-100 focus-visible:outline-none"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={changeSpeed}
            aria-label={`Playback speed: ${playbackRate}x`}
            className="flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-full border border-border hover:border-primary/50"
          >
            <FastForward className="w-3.5 h-3.5" /> {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            className="p-2 text-muted hover:text-primary transition-colors rounded-full hover:bg-primary/10"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
