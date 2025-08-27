import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoHeroProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  overlayOpacity?: number;
}

// Video playlist - add all your videos here
const videoPlaylist = [
  '/videos/Football-A.webm',
  '/videos/Football-B.webm', 
  '/videos/Football-C.webm'
];

export default function VideoHero({ 
  title, 
  subtitle, 
  ctaText = "Get Started",
  ctaHref = "#tools",
  overlayOpacity = 0.5 
}: VideoHeroProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Video transition timing (in milliseconds)
  const VIDEO_DURATION = 8000; // 8 seconds per video
  const FADE_DURATION = 1000; // 1 second fade transition

  useEffect(() => {
    if (!isPlaying) return;

    // Set up video cycling
    const videoTimer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentVideoIndex((prev) => (prev + 1) % videoPlaylist.length);
          setIsTransitioning(false);
        }, FADE_DURATION);
      }
    }, VIDEO_DURATION);

    return () => clearInterval(videoTimer);
  }, [isPlaying, isTransitioning]);

  useEffect(() => {
    const video = document.querySelector(`video[data-video-index="${currentVideoIndex}"]`) as HTMLVideoElement;
    if (video) {
      video.currentTime = 0;
      video.play().then(() => {
        setIsLoaded(true);
      }).catch(() => {
        console.log('Autoplay prevented');
        setIsLoaded(false);
      });
    }
  }, [currentVideoIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = !isMuted;
    });
    setIsMuted(!isMuted);
  };

  const handleCTAClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = ctaHref.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Backgrounds with Crossfade */}
      <div className="absolute inset-0">
        {videoPlaylist.map((videoSrc, index) => (
          <AnimatePresence key={videoSrc}>
            {index === currentVideoIndex && (
              <motion.video
                data-video-index={index}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: FADE_DURATION / 1000, ease: "easeInOut" }}
                onLoadedData={() => setIsLoaded(true)}
              >
                <source src={videoSrc} type="video/webm" />
                Your browser does not support the video tag.
              </motion.video>
            )}
          </AnimatePresence>
        ))}
      </div>
      
      {/* Overlay for better text readability */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          background: `linear-gradient(135deg, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.7}) 50%, rgba(0,0,0,${overlayOpacity * 0.9}) 100%)`
        }}
      ></div>
      
      {/* Video Controls */}
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button
          onClick={togglePlayPause}
          className="p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all duration-200 hover:scale-110"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={toggleMute}
          className="p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-all duration-200 hover:scale-110"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Video Progress Indicator */}
      <div className="absolute top-6 left-6 z-20">
        <div className="flex gap-2">
          {videoPlaylist.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentVideoIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div 
          className="text-center text-white max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Main Title */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight font-display"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {title}
          </motion.h1>
          
          {/* Subtitle */}
          {subtitle && (
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              {subtitle}
            </motion.p>
          )}
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <a 
              href={ctaHref}
              onClick={handleCTAClick}
              className="btn-primary text-lg px-8 py-4 font-semibold rounded-full hover:scale-105 hover:shadow-2xl transform cursor-pointer"
            >
              {ctaText}
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
