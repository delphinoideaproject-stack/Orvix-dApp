import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story, Token } from '../types';

interface StoryViewerModalProps {
  token: Token;
  stories: Story[];
  onClose: () => void;
}

const STORY_DURATION_MS = 5000; // 5 seconds per story

export function StoryViewerModal({ token, stories, onClose }: StoryViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(Date.now());
  const pausedTime = useRef<number>(0);

  useEffect(() => {
    if (stories.length === 0) {
      onClose();
      return;
    }
    
    startTime.current = Date.now();
    setProgress(0);

    const updateProgress = () => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTime.current;
      const newProgress = (elapsed / STORY_DURATION_MS) * 100;
      
      if (newProgress >= 100) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
          startTime.current = Date.now();
          setProgress(0);
        } else {
          onClose(); // Auto close at the end
        }
      } else {
        setProgress(newProgress);
      }
    };

    progressInterval.current = setInterval(updateProgress, 16); // ~60fps

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, stories.length, onClose, isPaused]);

  useEffect(() => {
    if (isPaused) {
      pausedTime.current = Date.now();
    } else if (pausedTime.current) {
      // Adjust start time to account for the pause
      startTime.current += (Date.now() - pausedTime.current);
      pausedTime.current = 0;
    }
  }, [isPaused]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      startTime.current = Date.now();
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      startTime.current = Date.now();
      setProgress(0);
    }
  };

  if (!stories.length || currentIndex >= stories.length) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          key="story-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm h-[80vh] max-h-[800px] bg-zinc-900 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Progress Bars */}
          <div className="absolute top-0 inset-x-0 z-20 flex gap-1.5 p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white transition-all duration-[16ms] ease-linear"
                  style={{
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-10 inset-x-0 z-20 flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <img src={token.logo} alt={token.name} className="w-9 h-9 rounded-full border-2 border-blue-500 bg-white" />
              <div>
                <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md">{token.name}</h3>
                <p className="text-white/80 text-xs font-mono drop-shadow-md">
                  {Math.round((Date.now() - currentStory.timestamp) / 3600000)}h ago
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Story Content */}
          <div className="flex-1 relative bg-zinc-800 flex items-center justify-center">
            <img 
              src={currentStory.imageUrl} 
              alt="Story" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
            {currentStory.text && (
              <div className="absolute bottom-16 inset-x-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-white text-sm whitespace-pre-wrap">{currentStory.text}</p>
              </div>
            )}
          </div>

          {/* Tap Zones */}
          <div 
            className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
            onClick={handlePrev}
          />
          <div 
            className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer"
            onClick={handleNext}
          />

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
