/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design-system tokens — dark space theme
        space: {
          DEFAULT: '#020010',
          900: '#020010',
          800: '#080618',
          700: '#0f0c28',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          glow: 'rgba(34,211,238,0.4)',
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          border: 'rgba(255,255,255,0.08)',
          hover:  'rgba(255,255,255,0.09)',
        },
        // Legacy — kept for any remaining references
        primary: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'fade-up':      'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-d1':   'fadeInUp 0.5s 0.05s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-d2':   'fadeInUp 0.5s 0.10s cubic-bezier(0.16,1,0.3,1) both',
        'fade-up-d3':   'fadeInUp 0.5s 0.15s cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':     'slideUp 0.3s ease-out',
        'pulse-slow':   'pulse 3s infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s linear infinite',
        'spin':         'spin 0.8s linear infinite',
        'page-load':    'pageLoad 0.3s ease',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 },                                   '100%': { opacity: 1 } },
        fadeInUp:  { '0%': { opacity: 0, transform: 'translateY(20px)' },    '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: 0 },    '100%': { transform: 'translateY(0)', opacity: 1 } },
        glowPulse: { '0%,100%': { opacity: 0.5 },                            '50%': { opacity: 1 } },
        shimmer:   { '0%': { backgroundPosition: '-200% center' },           '100%': { backgroundPosition: '200% center' } },
        spin:      { to: { transform: 'rotate(360deg)' } },
        pageLoad:  { from: { opacity: 0 },                                   to: { opacity: 1 } },
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #22d3ee 0%, #818cf8 100%)',
        'gradient-card':   'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'card':        '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
        'card-hover':  '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(34,211,238,0.08)',
        'glow':        '0 0 20px rgba(34,211,238,0.3)',
        'glow-lg':     '0 0 40px rgba(34,211,238,0.4)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.3)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}