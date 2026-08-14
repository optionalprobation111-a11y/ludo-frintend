/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F0F17',
        surface: '#191924',
        raised: '#22222F',
        hairline: '#33333F',
        cream: '#F3EFE6',
        muted: '#A7A3B3',
        brass: {
          DEFAULT: '#C6A15B',
          bright: '#E0C384',
          dim: '#8A6F3F'
        },
        token: {
          red: '#E1483F',
          green: '#2FA66A',
          yellow: '#F0B23D',
          blue: '#3E7CD6'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        panel: '0 20px 60px -20px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(198,161,91,0.25), 0 8px 30px -8px rgba(198,161,91,0.35)'
      },
      backgroundImage: {
        'board-grid':
          'linear-gradient(rgba(243,239,230,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(243,239,230,0.035) 1px, transparent 1px)'
      },
      backgroundSize: {
        'board-cell': '48px 48px'
      },
      keyframes: {
        'dice-tumble': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '30%': { transform: 'rotate(140deg) scale(1.08)' },
          '60%': { transform: 'rotate(250deg) scale(0.96)' },
          '100%': { transform: 'rotate(360deg) scale(1)' }
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(198,161,91,0.45)' },
          '100%': { boxShadow: '0 0 0 14px rgba(198,161,91,0)' }
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '75%, 100%': { transform: 'scale(1.5)', opacity: '0' }
        }
      },
      animation: {
        'dice-tumble': 'dice-tumble 0.6s cubic-bezier(.2,.8,.3,1)',
        'rise-in': 'rise-in 0.5s cubic-bezier(.2,.8,.3,1) both',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0,0,0.2,1) infinite',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0,0,0.2,1) infinite'
      }
    }
  },
  plugins: []
}