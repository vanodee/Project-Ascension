'use client';

import { useRef, useState } from 'react';
import styles from './AudioPlayer.module.scss';

interface AudioPlayerProps {
  src: string;
  title: string;
  duration: string;
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Custom HTML5 audio player for homily recordings, styled with the design system. */
export default function AudioPlayer({
  src,
  title,
  duration,
}: AudioPlayerProps): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const togglePlay = (): void => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value: number): void => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (value / 100) * audio.duration;
  };

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className={styles['audio-player']}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setTotalTime(event.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      <button
        type="button"
        className={styles['audio-player__toggle']}
        onClick={togglePlay}
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
      >
        {isPlaying ? '❚❚' : '►'}
      </button>

      <div className={styles['audio-player__track']}>
        <p className={styles['audio-player__title']}>{title}</p>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(event) => handleSeek(Number(event.target.value))}
          className={styles['audio-player__seek']}
          aria-label="Seek within recording"
        />
        <p className={styles['audio-player__time']}>
          {formatSeconds(currentTime)} /{' '}
          {totalTime > 0 ? formatSeconds(totalTime) : duration}
        </p>
      </div>
    </div>
  );
}
