/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hermes-orange': '#F37021',
        'hermes-burnt': '#C35817',
        'hermes-light': '#FF8C42',
        'hermes-cream': '#FFF5EE',
        'hermes-sand': '#FAEBD7',
        'old-money-navy': '#1B2951',
        'old-money-gold': '#D4AF37',
        'old-money-gray': '#6B7280',
        'old-money-sage': '#87936F',
      },
      backgroundImage: {
        'hermes-gradient': 'linear-gradient(135deg, #F37021 0%, #FF8C42 100%)',
        'premium-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F37021 100%)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}