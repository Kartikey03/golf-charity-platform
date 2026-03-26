/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        accent: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        dark: {
          800: '#1a1a2e',
          900: '#0f0f1a',
          950: '#07070f',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        rose: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        yellow: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        purple: {
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out both',
        'slide-up':   'slideUp 0.4s ease-out both',
        'slide-down': 'slideDown 0.4s ease-out both',
        'slide-left': 'slideLeft 0.4s ease-out both',
        'scale-in':   'scaleIn 0.35s ease-out both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'glow':       'glow 3s ease-in-out infinite',
        'bounce-x':   'bounceX 1.5s ease-in-out infinite',
        'number-roll':'numberRoll 0.5s ease-out both',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)',  opacity: 1 } },
        slideDown:{ from: { transform: 'translateY(-20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        slideLeft:{ from: { transform: 'translateX(20px)', opacity: 0 },  to: { transform: 'translateX(0)', opacity: 1 } },
        scaleIn:  { from: { transform: 'scale(0.94)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,197,94,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(34,197,94,0.6)' },
        },
        bounceX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%':      { transform: 'translateX(5px)' },
        },
        numberRoll: {
          from: { transform: 'translateY(-20px)', opacity: 0 },
          to:   { transform: 'translateY(0)',     opacity: 1 },
        },
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(135deg, #07070f 0%, #0f0f1a 50%, #0a1a0d 100%)',
        'card-gradient':  'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'green-glow':     'radial-gradient(circle at center, rgba(34,197,94,0.12) 0%, transparent 70%)',
        'accent-glow':    'radial-gradient(circle at center, rgba(139,92,246,0.12) 0%, transparent 70%)',
        'mesh-gradient':  'radial-gradient(at 40% 20%, rgba(34,197,94,0.05) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.05) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(34,197,94,0.03) 0px, transparent 50%)',
      },
      boxShadow: {
        'glow-brand':  '0 0 30px rgba(34, 197, 94, 0.25)',
        'glow-accent': '0 0 30px rgba(139, 92, 246, 0.25)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      transitionTimingFunction: {
        'spring':      'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-soft': 'cubic-bezier(0.68, -0.3, 0.32, 1.3)',
      },
    },
  },
  plugins: [],
}
