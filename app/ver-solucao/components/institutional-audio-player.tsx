"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function InstitutionalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }

    // Add event listeners
    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = Number(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-l-4 border-l-primary bg-gradient-to-r from-slate-50 to-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            
            {/* Copy Section */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  Resumo em áudio
                </Badge>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Conteúdo Institucional
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                🎧 Resumo Institucional Mastprod
              </h3>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Ouça um resumo objetivo sobre como a Mastprod atua na gestão de segurança do trabalho, 
                agregando controle, agilidade e valor técnico para empresas e engenheiros.
              </p>
            </div>

            {/* Player Section */}
            <div className={cn(
              "flex items-center gap-4 w-full md:w-auto bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all duration-300",
              isPlaying ? "ring-2 ring-primary/10 shadow-md" : ""
            )}>
              <audio 
                ref={audioRef} 
                src="/audio/mastprod.m4a" 
                preload="metadata"
              />

              <Button
                onClick={togglePlay}
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shrink-0 transition-all duration-300 shadow-lg",
                  isPlaying 
                    ? "bg-primary text-white hover:bg-primary/90 hover:scale-105" 
                    : "bg-slate-900 text-white hover:bg-slate-800 hover:scale-105"
                )}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-1" />
                )}
              </Button>

              <div className="flex-1 md:w-64 space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span className={isPlaying ? "text-primary" : ""}>
                    {formatTime(currentTime)}
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-slate-400 hover:text-slate-600 hidden sm:flex"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
