'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

const VideoEmbed = ({ url, title = 'Watch Video', className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!url) return null;

  // Extract video ID and platform from URL
  const getVideoInfo = (url) => {
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        platform: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
      };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`
      };
    }

    // Direct video URL
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        platform: 'direct',
        id: null,
        embedUrl: url,
        thumbnailUrl: null
      };
    }

    return null;
  };

  const videoInfo = getVideoInfo(url);

  if (!videoInfo) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Invalid video URL format. Please use YouTube, Vimeo, or direct video links.
        </p>
      </div>
    );
  }

  const openModal = () => {
    setIsModalOpen(true);
    setIsLoading(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(true);
  };

  return (
    <>
      {/* Video Thumbnail/Preview */}
      <div className={`relative group cursor-pointer ${className}`}>
        <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden shadow-lg">
          {videoInfo.thumbnailUrl ? (
            <img
              src={videoInfo.thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback for when thumbnail fails to load */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center" style={{ display: videoInfo.thumbnailUrl ? 'none' : 'flex' }}>
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-2 opacity-80" />
              <p className="text-lg font-medium">{title}</p>
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 dark:bg-neutral-900/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="currentColor" />
            </div>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-medium text-lg">{title}</h3>
          </div>
        </div>
        
        {/* Click handler */}
        <div className="absolute inset-0" onClick={openModal}></div>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            )}
            
            {/* Video Iframe */}
            {videoInfo.platform === 'direct' ? (
              <video
                src={videoInfo.embedUrl}
                controls
                autoPlay
                className="w-full h-full"
                onLoadStart={() => setIsLoading(false)}
              />
            ) : (
              <iframe
                src={videoInfo.embedUrl}
                title={title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>
          
          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeModal}></div>
        </div>
      )}
    </>
  );
};

export default VideoEmbed;