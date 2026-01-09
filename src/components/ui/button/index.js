import { cva } from 'class-variance-authority';

export { default as Button } from './Button.vue';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/30 hover:shadow-xl active:scale-95',
        destructive:
          'bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-destructive/30 hover:shadow-xl active:scale-95',
        outline:
          'border border-primary bg-background shadow-sm hover:bg-primary/10 hover:border-primary/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline',
        neon: 'bg-transparent border border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] active:scale-95',
        glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 rounded-lg px-3 text-sm',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
