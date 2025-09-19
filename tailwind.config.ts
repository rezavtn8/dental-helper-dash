import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1.5rem', // 24px mobile
				sm: '2.5rem',       // 40px tablet  
				lg: '4rem'          // 64px desktop
			},
			screens: {
				'2xl': '1280px'     // max-width 1280px
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'display': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
				'handwritten': ['Dancing Script', 'cursive'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					light: 'hsl(var(--muted-light))',
					medium: 'hsl(var(--muted-medium))',
					dark: 'hsl(var(--muted-dark))'
				},
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					muted: 'hsl(var(--surface-muted))',
					subtle: 'hsl(var(--surface-subtle))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				blue: {
					50: 'hsl(var(--blue-50))',
					100: 'hsl(var(--blue-100))',
					200: 'hsl(var(--blue-200))',
					300: 'hsl(var(--blue-300))',
					400: 'hsl(var(--blue-400))',
					500: 'hsl(var(--blue-500))',
					600: 'hsl(var(--blue-600))',
					700: 'hsl(var(--blue-700))',
					800: 'hsl(var(--blue-800))',
					900: 'hsl(var(--blue-900))',
					950: 'hsl(var(--blue-950))'
				},
				learning: {
					beginner: 'hsl(var(--learning-beginner))',
					intermediate: 'hsl(var(--learning-intermediate))',
					advanced: 'hsl(var(--learning-advanced))',
					success: 'hsl(var(--learning-success))',
					warning: 'hsl(var(--learning-warning))',
					quiz: 'hsl(var(--learning-quiz))',
					achievement: 'hsl(var(--learning-achievement))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'learning-glow': {
					'0%, 100%': {
						'box-shadow': '0 0 20px hsl(258 90% 66% / 0.3)'
					},
					'50%': {
						'box-shadow': '0 0 30px hsl(258 90% 66% / 0.6)'
					}
				},
				'learning-bounce': {
					'0%, 20%, 53%, 80%, 100%': {
						transform: 'translate3d(0, 0, 0)'
					},
					'40%, 43%': {
						transform: 'translate3d(0, -15px, 0)'
					},
					'70%': {
						transform: 'translate3d(0, -8px, 0)'
					},
					'90%': {
						transform: 'translate3d(0, -3px, 0)'
					}
				},
				'progress-fill': {
					'0%': {
						transform: 'scaleX(0)'
					},
					'100%': {
						transform: 'scaleX(1)'
					}
				},
				'achievement-burst': {
					'0%': {
						transform: 'scale(0) rotate(0deg)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.2) rotate(180deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(1) rotate(360deg)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'learning-glow': 'learning-glow 3s ease-in-out infinite',
				'learning-bounce': 'learning-bounce 2s ease-in-out infinite',
				'progress-fill': 'progress-fill 1s ease-out',
				'achievement-burst': 'achievement-burst 0.6s ease-out'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			addUtilities({
				'.hover-scale': {
					'transition-property': 'transform',
					'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
					'transition-duration': '300ms',
					'&:hover': {
						'transform': 'scale(1.05)'
					}
				}
			});
		}
	],
} satisfies Config;
