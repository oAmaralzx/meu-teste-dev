import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      default: 'ui-button--default',
      outline: 'ui-button--outline',
      ghost: 'ui-button--ghost',
      danger: 'ui-button--danger',
    },
    size: {
      default: 'ui-button--size-default',
      sm: 'ui-button--size-sm',
      lg: 'ui-button--size-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function Button({ className, variant, size, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button };
