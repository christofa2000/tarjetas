import { ButtonHTMLAttributes } from 'react';

const baseClasses = [
  'inline-flex items-center justify-center gap-2',
  'rounded-xl border border-transparent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide',
  'bg-carmine text-white shadow-lg shadow-carmine/30 transition-colors',
  'hover:bg-burnt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal',
].join(' ');

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, className = '', ...props }: ButtonProps) => {
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <button type='button' className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
