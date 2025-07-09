'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/button'

interface PodcastAudioPlayerProps {
  url: string
  title: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function PodcastAudioPlayer({ 
  url, 
  title, 
  onPlay, 
  onPause, 
  onEnded 
}: PodcastAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      audio.play()
      setIsPlaying(true)
      onPlay?.()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <audio ref={audioRef} src={url} preload="metadata" />
      
      {/* Título */}
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      
      {/* Controles principais */}
      <div className="flex items-center justify-center mb-4">
        <Button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center text-2xl"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </Button>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controle de volume */}
      <div className="flex items-center gap-2">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span className="text-sm text-gray-500">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  )
}
