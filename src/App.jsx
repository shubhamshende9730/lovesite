import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Sparkles
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import coupleBikeImg from './assets/couple_bike.png';
import podareshwarImg from './assets/podareshwar.jpg';
import isconImg from './assets/iscon.jpg';
import isconRealImg from './assets/iscon_real.jpg';
import kharbiImg from './assets/kharbi.jpg';
import coupleBoatImg from './assets/couple_boat.jpg';
import boyHeartsImg from './assets/boy_hearts.jpg';
import pahuncharImg from './assets/pahunchar.jpg';
import chaisuttaImg from './assets/chaisuttabar.jpg';

// ============================================================================
// AUDIO TRACK SETUP
// Replace this with your direct .mp3 file link.
// ============================================================================
const SONG_URL = `${import.meta.env.BASE_URL}chale_hi_jana_hai.m4a`;

// Long Drive Route Points: Chhatrapati Square to Bhande Plot Square (straight line)
const LONG_DRIVE_ROUTE = [
  [21.1095, 79.0628], // Chhatrapati Square
  [21.1222, 79.1195]  // Bhande Plot Square
];

// Pinned memory locations data
const MEMORY_LOCATIONS = [
  {
    id: 1,
    coords: [20.7936, 76.6923],
    title: "A Beautiful Day Trip to Shegaon",
    description: "Our special getaway trip out of the city. Traveling with you makes any destination feel perfect.",
    date: "A Magical Weekend",
    tag: "Day Trip",
    image: podareshwarImg
  },
  {
    id: 2,
    coords: [21.1415, 79.1171],
    title: "Chai Sutta Bar Cafe, Nandanvan",
    description: "Sharing hot cups of tea and endless conversations here. Our favorite casual hangout spot.",
    date: "Evening Tea Date",
    tag: "Chai & Chats",
    image: chaisuttaImg
  },
  {
    id: 3,
    coords: [21.1402, 79.1158],
    title: "Pahunchar Resto, Nagpur",
    description: "The dinner date where we laughed until our stomachs hurt over incredible food.",
    date: "Dinner Date",
    tag: "Food & Laughter",
    image: pahuncharImg
  },
  {
    id: 4,
    coords: [21.1610, 78.9660],
    title: "Surabardi, Nagpur",
    description: "Escaping the city rush to just enjoy the sunset, gentle breeze, and peace next to you.",
    date: "Our Peaceful Escape",
    tag: "Nature & Sunset",
    image: coupleBoatImg
  },
  {
    id: 5,
    coords: [21.1102, 79.0885],
    title: "The Long Drive",
    description: "Cruising from Chhatrapati Square all the way to Bhande Plot Square with the windows down and our favorite tracks playing.",
    date: "Late Night Drive",
    tag: "Midnight Drive",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 6,
    coords: [21.1540, 79.0915],
    title: "Poddareshwar Ram Temple",
    description: "A beautiful, serene visit to the historic Ram Mandir. Standing before the deities, wishing for our endless future together.",
    date: "Temple Visit",
    tag: "Temple Blessings",
    image: isconImg
  },
  {
    id: 7,
    coords: [21.1448, 79.0945],
    title: "ISKCON Temple, Cotton Market",
    description: "Listening to the beautiful chants of Hare Krishna, feeling peaceful, and seeking divine blessings for our love.",
    date: "Peaceful Evening",
    tag: "Divine Blessings",
    image: isconRealImg
  },
  {
    id: 8,
    coords: [21.1348, 79.1401],
    title: "Kharbi Chowk, Nagpur",
    description: "Craving late-night street food, having sweet chats, and sharing cups of ice cream/kulfi here.",
    date: "Late Night Date",
    tag: "Sweet Chats",
    image: kharbiImg
  }
];

// Helper to create custom Snapchat-like circular photo markers
const createPhotoIcon = (mem, isActive) => {
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center">
        ${isActive ? '<div class="marker-pulse-ring !w-[50px] !h-[50px] -mt-[3px]"></div>' : ''}
        <div class="w-12 h-12 rounded-full border-[3px] border-white shadow-xl overflow-hidden transform transition-all duration-300 ${
          isActive 
            ? 'scale-125 border-rose-500 ring-4 ring-rose-200' 
            : 'hover:scale-115 hover:border-rose-300'
        }">
          <img src="${mem.image}" class="w-full h-full object-cover" alt="" />
        </div>
        <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 border border-white rounded-full flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-2.5 h-2.5">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <div class="w-2.5 h-2.5 bg-white transform rotate-45 -mt-1 shadow-sm border-r border-b border-gray-200"></div>
      </div>
    `,
    className: 'custom-photo-marker',
    iconSize: [48, 52],
    iconAnchor: [24, 52]
  });
};

// Helper to create the moving couple vehicle marker icon (no circle border, custom PNG)
const createBikeIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center justify-center pointer-events-none" style="transform: translate(-50%, -50%);">
        <!-- Pulse ring -->
        <div class="absolute w-12 h-12 rounded-full bg-rose-400/30 animate-ping"></div>
        <!-- Small pulsing heart on top of the couple -->
        <span class="text-xl animate-pulse absolute -top-8 z-10">❤️</span>
        <!-- Couple and scooter PNG image flipped horizontally -->
        <div class="w-20 h-20 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
          <img src="${coupleBikeImg}" class="w-full h-full object-contain" style="transform: scaleX(-1);" alt="" />
        </div>
      </div>
    `,
    className: 'custom-bike-marker',
    iconSize: [80, 80],
    iconAnchor: [40, 40]
  });
};

// Component to handle map centering and panning smoothly
const MapController = ({ activeMemory }) => {
  const map = useMap();
  
  useEffect(() => {
    if (activeMemory) {
      if (activeMemory.id === 5) {
        // For the long drive, fit the bounds of the entire path
        map.fitBounds(LONG_DRIVE_ROUTE, {
          padding: [50, 50],
          animate: true,
          duration: 1.5
        });
      } else {
        map.setView(activeMemory.coords, 14, {
          animate: true,
          duration: 1.5
        });
      }
    }
  }, [activeMemory, map]);
  
  return null;
};

// Floating 3D Hearts generator for ambient background styling
const Floating3DHearts = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Instantly populate the screen with 12 hearts at various heights using negative animation delays (mid-flight start)
    const initialHearts = Array.from({ length: 12 }, () => {
      const uniqueId = 'h-' + Math.floor(Math.random() * 1000000) + '-' + Math.floor(Math.random() * 1000000);
      const left = Math.random() * 100;
      const size = Math.random() * 35 + 25; // Larger hearts (25px to 60px) like Instagram theme
      const duration = Math.random() * 10 + 8; // Slower, gentler float (8s to 18s)
      const delay = -Math.random() * duration; // Negative delay to start mid-animation
      return { id: uniqueId, left, size, duration, delay };
    });
    setHearts(initialHearts);

    // Periodically spawn new hearts from the bottom
    const interval = setInterval(() => {
      const uniqueId = 'h-' + Math.floor(Math.random() * 1000000) + '-' + Math.floor(Math.random() * 1000000);
      const left = Math.random() * 100;
      const size = Math.random() * 35 + 25;
      const duration = Math.random() * 10 + 8;
      const delay = Math.random() * 2; // Positive delay for new spawns
      setHearts((prev) => [...prev, { id: uniqueId, left, size, duration, delay }]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== uniqueId));
      }, (duration + delay) * 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="floating-3d-heart"
          style={{
            left: `${h.left}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <radialGradient id={h.id} cx="35%" cy="30%" r="65%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#ffccd5" /> {/* shiny highlight reflection */}
                <stop offset="35%" stopColor="#ff758f" /> {/* bright pink */}
                <stop offset="80%" stopColor="#e91e63" /> {/* deep magenta red */}
                <stop offset="100%" stopColor="#8c002f" /> {/* base shadow */}
              </radialGradient>
              <filter id={`shadow-${h.id}`}>
                <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#e91e63" floodOpacity="0.25" />
              </filter>
            </defs>
            <path
              d="M 50,30 A 20,20 0,0,0 15,30 C 15,50 35,70 50,85 C 65,70 85,50 85,30 A 20,20 0,0,0 50,30 Z"
              fill={`url(#${h.id})`}
              filter={`url(#shadow-${h.id})`}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

// Helper function to interpolate coords along a polyline segment
const getPointAlongPath = (path, t) => {
  if (path.length === 0) return null;
  if (path.length === 1) return path[0];
  
  const totalSegments = path.length - 1;
  const scaledT = t * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaledT), totalSegments - 1);
  const segmentT = scaledT - segmentIndex;
  
  const start = path[segmentIndex];
  const end = path[segmentIndex + 1];
  
  const lat = start[0] + (end[0] - start[0]) * segmentT;
  const lng = start[1] + (end[1] - start[1]) * segmentT;
  
  return [lat, lng];
};

export default function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'map'
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMemory, setActiveMemory] = useState(null);
  const [mapStyle, setMapStyle] = useState('light'); // 'light' | 'terrain'
  const [bikeCoords, setBikeCoords] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  const audioRef = useRef(null);

  // Sync play state with HTML5 audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay block or audio issue:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Animate bike driving along the Chhatrapati to Bhande Plot route
  useEffect(() => {
    if (activeMemory?.id === 5) {
      let start = null;
      const duration = 10000; // 10 seconds drive duration
      let animationId;

      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = (elapsed / duration) % 1.0; // Loops between 0 and 1
        
        const currentPos = getPointAlongPath(LONG_DRIVE_ROUTE, progress);
        setBikeCoords(currentPos);

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    } else {
      setBikeCoords(null);
    }
  }, [activeMemory]);

  // Navigate forward in the memory sequence
  const handleNextMemory = () => {
    if (!activeMemory) {
      setActiveMemory(MEMORY_LOCATIONS[0]);
      return;
    }
    const currentIndex = MEMORY_LOCATIONS.findIndex(m => m.id === activeMemory.id);
    const nextIndex = (currentIndex + 1) % MEMORY_LOCATIONS.length;
    setActiveMemory(MEMORY_LOCATIONS[nextIndex]);
  };

  // Launch experience: start music and switch screens
  const handleLaunchExperience = () => {
    setScreen('map');
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden flex flex-col bg-rose-50 text-gray-800 select-none">
      {/* Hidden HTML5 Audio Element */}
      <audio 
        ref={audioRef}
        src={SONG_URL}
        loop 
        preload="auto"
      />

      {/* Cinematic Vignette Overlay (Warm/Moody gradient borders) */}
      <div className="pointer-events-none absolute inset-0 z-[1500] shadow-[inset_0_0_90px_rgba(0,0,0,0.38)] md:shadow-[inset_0_0_130px_rgba(0,0,0,0.48)]" />

      {/* Screen 1: Welcome Apology */}
      {screen === 'welcome' && (
        <div className="relative w-full h-full flex flex-col justify-center items-center px-6 pb-12 bg-gradient-to-tr from-[#ffe4e6] via-[#fbc5c5] to-[#f5d0fe] z-10">
          <Floating3DHearts />
          <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-2xl text-center animate-fade-in-scale z-10 flex flex-col items-center max-h-[80vh] overflow-y-auto">
            {/* Pulsing Emoji */}
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 animate-heart-beat">
              <span className="text-5xl">🥺</span>
            </div>
            
            <h1 className="font-serif-romantic text-3xl font-bold text-rose-600 mb-4 tracking-tight">
              I am so sorry...
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-8 font-medium">
              I never mean to upset you, and I hate when things aren't right between us. 
              You mean the absolute world to me. To remind you of all the beautiful 
              moments we've built together, I created a little something for you.
            </p>
            
            <button
              onClick={handleLaunchExperience}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg shadow-rose-200 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <span>Forgive Me & See Our Journey ❤️</span>
            </button>
          </div>
          
          {/* Ambient footer */}
          <div className="absolute bottom-6 text-xs text-rose-400 font-semibold z-10 flex items-center gap-1.5 drop-shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Made with all my love for you</span>
          </div>
        </div>
      )}

      {/* Screen 2: Interactive Memory Map */}
      {screen === 'map' && (
        <div className="relative w-full h-full flex flex-col">
          {/* 1. Header Card */}
          <header className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto bg-white/95 backdrop-blur-md border border-rose-100 rounded-2xl shadow-xl p-4 flex flex-col items-center justify-center text-center">
            <h1 className="font-romantic text-rose-600 text-3xl font-bold leading-tight">
              Our Roadmap of Memories ❤️
            </h1>
            <p className="text-gray-500 text-[10px] tracking-wide uppercase font-bold mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
              Click on the map markers to revisit our chapters
            </p>
          </header>

          {/* 2. Floating Map Style Toggle (Terrain View) */}
          <button
            onClick={() => setMapStyle(mapStyle === 'light' ? 'terrain' : 'light')}
            className="absolute top-[106px] right-4 z-[1000] flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-rose-100 text-rose-600 font-bold text-xs transition-all duration-200 active:scale-95 hover:bg-rose-50"
            aria-label="Toggle Map Style"
          >
            {mapStyle === 'light' ? (
              <span>🌳 Terrain View</span>
            ) : (
              <span>🗺️ Streets View</span>
            )}
          </button>

          {/* 3. OpenStreetMap Canvas */}
          <div className="w-full h-full z-0">
            <MapContainer 
              center={[21.1458, 79.0882]} 
              zoom={11} 
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              boxZoom={false}
              keyboard={false}
              className="w-full h-full"
            >
              {mapStyle === 'light' ? (
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
              ) : (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri &mdash; Sources: Esri, USGS, NPS'
                />
              )}
              
              {/* If "The Long Drive" is selected, render the decorated road path */}
              {activeMemory?.id === 5 && (
                <>
                  {/* Glowing background shadow line */}
                  <Polyline 
                    positions={LONG_DRIVE_ROUTE} 
                    color="#f43f5e" 
                    weight={10} 
                    opacity={0.3} 
                  />
                  {/* Decorated Dashed Road Line */}
                  <Polyline 
                    positions={LONG_DRIVE_ROUTE} 
                    color="#ec4899" 
                    weight={5} 
                    opacity={0.95}
                    dashArray="8, 12" 
                  />
                </>
              )}

              {/* Animated scooter marker driving along the route */}
              {bikeCoords && (
                <Marker 
                  position={bikeCoords} 
                  icon={createBikeIcon()} 
                />
              )}
              
              {/* Markers for each location using Snapchat-like picture frames */}
              {MEMORY_LOCATIONS.map((mem) => {
                const isActive = activeMemory?.id === mem.id;
                return (
                  <Marker
                    key={mem.id}
                    position={mem.coords}
                    icon={createPhotoIcon(mem, isActive)}
                    eventHandlers={{
                      click: () => {
                        setActiveMemory(mem);
                      },
                    }}
                  />
                );
              })}

              <MapController activeMemory={activeMemory} />
            </MapContainer>
          </div>

          {/* 4. Floating Snapchat-style Details Card (Solves Mobile Cutting Issue) */}
          <div 
            className={`absolute bottom-12 left-4 right-4 z-[1000] max-w-md mx-auto transition-all duration-500 ease-in-out transform ${
              activeMemory ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
            }`}
          >
            {/* Fully floating card that does not touch bottom boundaries - immune to browser navbar cutting */}
            <div className="bg-white/95 backdrop-blur-md border border-rose-100 rounded-3xl shadow-2xl p-5 flex flex-col max-h-[50vh] overflow-y-auto">
              {activeMemory && (
                <div className="animate-fade-in-scale">
                  
                  {/* Snapchat-Style Photo Snapshot Card */}
                  <div 
                    onClick={() => setFullscreenImage(activeMemory.image)}
                    className="relative w-full h-32 rounded-2xl overflow-hidden shadow-md mb-3 border-2 border-white cursor-pointer group"
                  >
                    <img 
                      src={activeMemory.image} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={activeMemory.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Visual Hint Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg tracking-wider">
                        🔍 Tap to View Full Screen
                      </span>
                    </div>

                    <span className="absolute bottom-2 left-3 text-white text-[9px] font-bold bg-rose-500/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider pointer-events-none">
                      {activeMemory.tag}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Chapter {activeMemory.id}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeMemory.date}
                    </span>
                  </div>

                  <h2 className="font-serif-romantic text-lg font-bold text-gray-800 mt-2">
                    {activeMemory.title}
                  </h2>

                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-medium">
                    {activeMemory.description}
                  </p>

                  <div className="flex items-center gap-3 mt-4">
                    {/* Navigation Shortcut */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${activeMemory.coords[0]},${activeMemory.coords[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-100"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    {/* Next Button */}
                    <button
                      onClick={handleNextMemory}
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md hover:shadow-rose-300 transition-all duration-200"
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. Floating Start Onboarding Button (shows only when no memory is active) */}
          {!activeMemory && (
            <div className="absolute bottom-12 left-4 right-4 z-[1000] max-w-md mx-auto animate-fade-in-scale">
              <div className="bg-white/95 backdrop-blur-md border border-rose-100 rounded-3xl shadow-xl p-5 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center mb-2 animate-heart-beat">
                  <Heart className="w-5 h-5 text-rose-500 fill-current" />
                </div>
                <h3 className="text-xs font-bold text-gray-800">
                  Ready to remember, my love?
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5 max-w-[280px] font-medium">
                  Tap a snapshot on the map to begin, or click start below.
                </p>
                <button
                  onClick={handleNextMemory}
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-full shadow-md text-xs transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>Start Memory Lane</span>
                  <Sparkles className="w-3.5 h-3.5 text-white animate-spin" />
                </button>
              </div>
            </div>
          )}

          {/* 6. Fullscreen Lightbox Modal (Dark backdrop, snapchat/instagram view style) */}
          {fullscreenImage && (
            <div 
              onClick={() => setFullscreenImage(null)}
              className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 cursor-zoom-out animate-fade-in duration-300"
            >
              <button 
                onClick={() => setFullscreenImage(null)}
                className="absolute top-6 right-6 text-white text-3xl font-bold bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                &times;
              </button>
              <img 
                src={fullscreenImage} 
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10 animate-fade-in-scale" 
                alt="Full screen preview" 
              />
              
              {/* Prominent bottom close button requested by user */}
              <button 
                onClick={() => setFullscreenImage(null)}
                className="mt-6 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full border border-rose-400 shadow-xl transition-all duration-200 transform active:scale-95 text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>Close Preview</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
