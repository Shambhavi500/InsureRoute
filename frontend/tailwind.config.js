/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:       '#0f172a',
        surface:  '#1e293b',
        border:   '#334155',
        primary:  '#3b82f6',
        success:  '#22c55e',
        warning:  '#facc15',
        danger:   '#ef4444',
        muted:    '#64748b',
        text:     '#f1f5f9',
        subtle:   '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gradient-success': 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
        'gradient-danger':  'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)',
        'gradient-warning': 'linear-gradient(135deg, #92400e 0%, #facc15 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)',
        'glow-blue':        'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':    'spin 4s linear infinite',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-blue':   '0 0 20px rgba(59,130,246,0.3)',
        'glow-green':  '0 0 20px rgba(34,197,94,0.3)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
