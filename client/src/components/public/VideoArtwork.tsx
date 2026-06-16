import React, { useRef, useState } from "react";

interface VideoArtworkProps {
  src?: string;
  poster?: string;
  className?: string;
}

const VideoArtwork: React.FC<VideoArtworkProps> = ({
  src = "/Pinterest.mp4",
  poster = "/gallarybelowimage.png",
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
    } catch (_) { }
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleEnded = () => setIsPlaying(false);

  return (
    <div>
      <div className="relative bg-white">
        {/* inline sculpture image — responsive and does not cause horizontal scroll */}
        <div className="absolute -top-24 sm:-top-48 left-0 transform -translate-x-1/3 w-28 sm:w-48 lg:w-auto -z-10 opacity-30 lg:opacity-100 pointer-events-none overflow-hidden">
          <img src="/videosectionpng.png" alt="clay figures" className="w-full h-auto" />
        </div>
      </div>
      <div className={`relative rounded-xl overflow-hidden  ${className}`}>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-72 md:h-96 lg:h-[600px] object-cover"
          muted
          loop
          playsInline
          onEnded={handleEnded}
        />

        {/* Permanent vignette — always frames the video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Text overlay — fades out while playing */}
        <div
          className="absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-500 pointer-events-none"
          style={{ opacity: isPlaying ? 0 : 1 }}
          aria-hidden={isPlaying}
        >
          <div className="max-w-lg mx-auto text-center space-y-3">
            <p className="font-tangerine text-xl sm:text-2xl text-white/85 tracking-widest font-normal">
              Art Work
            </p>
            <h2 className="text-3xl sm:text-4xl font-fraunces font-semibold text-white leading-snug">
              Bringing Clay to Life
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-sm mx-auto">
              The journey of raw clay transforming into breathtaking sculptures
              through creativity, craftsmanship, and artistic passion.
            </p>
          </div>
        </div>

        {/* Center play button — visible when paused */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-400"
          style={{
            opacity: isPlaying ? 0 : 1,
            pointerEvents: isPlaying ? "none" : "auto",
          }}
        >
          <button
            onClick={handlePlay}
            aria-label="Play video"
            className="w-[72px] h-[72px] rounded-full bg-white/90 hover:bg-white flex items-center justify-center animate-pulse-ring"
          >
            <svg
              className="w-7 h-7 text-gray-900"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Corner pause button — visible while playing */}
        <div
          className="absolute bottom-3 right-3 transition-opacity duration-400"
          style={{
            opacity: isPlaying ? 1 : 0,
            pointerEvents: isPlaying ? "auto" : "none",
          }}
        >
          <button
            onClick={handlePause}
            aria-label="Pause video"
            className="w-9 h-9 rounded-full bg-white/75 hover:bg-white/95 flex items-center justify-center backdrop-blur-sm"
          >
            <svg
              className="w-4 h-4 text-gray-900"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        </div>
      </div>
      {/* Three-feature UI below the video */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-[#267C87] flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01L12 2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-lg text-black font-fraunces">
              Unique in Every way
            </h4>
            <p className="text-sm text-slate-600 max-w-[220px] nt-instrument-sans">
              One-of-a-kind design and finishes
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-[#267C87] flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 2C8 6 4 7 4 11c0 4.97 6 9 8 11 2-2 8-6.03 8-11 0-4-4-5-8-9z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-lg text-black font-fraunces">
              Sustainable Materials
            </h4>
            <p className="text-sm text-slate-600 max-w-[220px] nt-instrument-sans">
              Earth-friendly and locally sourced
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-[#267C87] flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M12 21s-6-4.35-8-7c-1.6-1.98.1-5 3-5 1.72 0 3 1 3 1s1.28-1 3-1c2.9 0 4.6 3.02 3 5-2 2.65-8 7-8 7z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-lg text-black font-fraunces">
              Handmade with love
            </h4>
            <p className="text-sm text-slate-600 max-w-[220px] nt-instrument-sans">
              Crafted by skilled artisans
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoArtwork;
