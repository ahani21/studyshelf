import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#080705',
        canvas: '#0E0C09',
        surface: {
          DEFAULT: '#141210',
          raised: '#1A1714',
          inset: '#100E0C',
        },
        border: {
          subtle: 'rgba(255,240,200,0.06)',
          default: 'rgba(255,240,200,0.10)',
          strong: 'rgba(255,240,200,0.18)',
        },
        fg: {
          primary: '#F2EDE4',
          secondary: '#8C8070',
          tertiary: '#524840',
        },
        accent: {
          glow: '#D97706',
          highlight: '#F59E0B',
        },
        success: { DEFAULT: '#34D399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.22)' },
        danger:  { DEFAULT: '#FB7185', bg: 'rgba(251,113,133,0.10)', border: 'rgba(251,113,133,0.22)' },
        warning: { DEFAULT: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)' },
        info:    { DEFAULT: '#60A5FA', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.22)' },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        'display-hero': ['4.5rem', { lineHeight: '1.0',  letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display-lg':   ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.018em', fontWeight: '700' }],
        'display-md':   ['2.5rem', { lineHeight: '1.1',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm':   ['2rem',   { lineHeight: '1.15', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'label':   ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.08em', fontWeight: '500' }],
        'micro':   ['0.625rem',  { lineHeight: '1.2', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        'xl':  '1.125rem',
        '2xl': '1.5rem',
      },
      backgroundImage: {
        'shelf-glow':    'radial-gradient(ellipse 700px 250px at 50% 110%, rgba(217,119,6,0.10), rgba(217,119,6,0) 70%)',
        'card-gradient': 'linear-gradient(180deg, rgba(255,245,220,0.015) 0%, rgba(255,245,220,0) 60%)',
        'dot-grid':      'radial-gradient(rgba(255,240,200,0.018) 1px, transparent 1px)',
        'review-glow':   'radial-gradient(ellipse 400px 200px at 50% 50%, rgba(217,119,6,0.08), rgba(217,119,6,0) 70%)',
      },
      backgroundSize: {
        'dot-grid': '28px 28px',
      },
    },
  },
};

export default config;
