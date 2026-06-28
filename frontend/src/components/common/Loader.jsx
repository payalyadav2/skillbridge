import React from 'react';

const SIZES = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
const BORDER_WIDTH = { sm: '2px', md: '3px', lg: '4px' };

const Loader = ({ size = 'md', text = '', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative" style={{ width: SIZES[size].includes('4') ? 16 : SIZES[size].includes('8') ? 32 : 48, height: SIZES[size].includes('4') ? 16 : SIZES[size].includes('8') ? 32 : 48 }}>
        {/* Outer glow ring — static, sets the neon halo */}
        <div
          className={`${SIZES[size]} absolute inset-0 rounded-full`}
          style={{
            borderWidth: BORDER_WIDTH[size],
            borderStyle: 'solid',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        />
        {/* Spinning gradient arc */}
        <div
          className={`${SIZES[size]} absolute inset-0 rounded-full animate-spin`}
          style={{
            borderWidth: BORDER_WIDTH[size],
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderTopColor: '#22d3ee',
            borderRightColor: '#8b5cf6',
            filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.5))',
          }}
        />
      </div>
      {text && (
        <p
          className="text-sm animate-pulse"
          style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {text}
        </p>
      )}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

// Signature element: shimmer sweep travels across the skeleton, echoing the loading bars
// in Dashboard/Achievements rather than a flat pulse — same silhouette as the old skeleton,
// so layout shift on real-content swap-in stays identical.
export const SkeletonCard = () => (
  <div
    className="rounded-2xl p-6 relative overflow-hidden"
    style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
  >
    <style>{`
      @keyframes skeletonShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      .sk-bar {
        background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.06) 75%);
        background-size: 200% 100%;
        animation: skeletonShimmer 1.6s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) { .sk-bar { animation: none !important; } }
    `}</style>
    <div className="flex items-center gap-3 mb-4">
      <div className="sk-bar w-12 h-12 rounded-full" />
      <div className="flex-1">
        <div className="sk-bar h-4 rounded w-32 mb-2" />
        <div className="sk-bar h-3 rounded w-24" />
      </div>
    </div>
    <div className="sk-bar h-3 rounded w-full mb-2" />
    <div className="sk-bar h-3 rounded w-3/4 mb-4" />
    <div className="flex gap-2">
      <div className="sk-bar h-6 rounded-full w-16" />
      <div className="sk-bar h-6 rounded-full w-20" />
    </div>
  </div>
);

export const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center relative overflow-hidden"
    style={{ background: '#020010' }}
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-[100px]"
        style={{ background: 'rgba(217,70,239,0.12)', animation: 'pageLoaderFloat1 8s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px]"
        style={{ background: 'rgba(34,211,238,0.1)', animation: 'pageLoaderFloat2 10s ease-in-out infinite' }}
      />
    </div>
    <style>{`
      @keyframes pageLoaderFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
      @keyframes pageLoaderFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,15px)} }
      @media (prefers-reduced-motion: reduce) {
        [style*="pageLoaderFloat"] { animation: none !important; }
      }
    `}</style>
    <div className="relative z-10">
      <Loader size="lg" text="Loading..." />
    </div>
  </div>
);

export default Loader;