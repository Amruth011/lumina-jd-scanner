import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoProps {
  src: string;
  className?: string;
  poster?: string;
  overlayClassName?: string;
  desaturated?: boolean;
}

export const HlsVideo: React.FC<HlsVideoProps> = ({ 
  src, 
  className = "", 
  poster = "", 
  overlayClassName = "",
  desaturated = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("HLS Video play failed", e));
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native support
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Native HLS Video play failed", e));
      });
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${desaturated ? 'saturate-0' : ''}`}
        poster={poster}
        playsInline
        muted
        loop
        autoPlay
      />
      <div className={`absolute inset-0 pointer-events-none ${overlayClassName}`} />
    </div>
  );
};
