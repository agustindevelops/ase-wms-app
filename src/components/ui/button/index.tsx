'use client';
import React from 'react';
import { createButton } from '@gluestack-ui/core/button/creator';
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { withUniwind } from 'uniwind';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { UIIcon as _UIIcon } from '@gluestack-ui/core/icon/creator';

const UIIcon = withUniwind(_UIIcon);
const SCOPE = 'BUTTON';
const Root = withStyleContext(Pressable, SCOPE);
const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});
const buttonStyle = tva({
  base: 'rounded-md flex-row items-center justify-center data-[focus-visible=true]:web:outline-none data-[focus-visible=true]:web:ring-2 data-[disabled=true]:opacity-40 gap-2 min-h-11',
  variants: {
    variant: {
      default:
        'bg-green-500 data-[hover=true]:bg-green-700 data-[active=true]:bg-green-700',
      destructive:
        'bg-peach-500 data-[hover=true]:bg-peach-600 data-[active=true]:bg-peach-600',
      outline:
        'border border-brown-200 bg-cream data-[hover=true]:bg-brown-50 data-[active=true]:bg-brown-50',
      secondary:
        'bg-brown-100 data-[hover=true]:bg-brown-200 data-[active=true]:bg-brown-200',
      ghost: 'data-[hover=true]:bg-brown-50 data-[active=true]:bg-brown-50',
      link: 'underline-offset-4 data-[hover=true]:underline data-[active=true]:underline',
    },
    size: {
      default: 'px-4 py-3',
      sm: 'min-h-8 rounded-md px-3',
      lg: 'min-h-12 rounded-md px-8',
      icon: 'min-h-9 min-w-9',
    },
  },
});
const buttonTextStyle = tva({
  // Use palette utilities (not theme CSS vars) so labels stay visible on UniWind.
  // Do not set text-white on the base: UniWind will not reliably override it for outline/secondary.
  base: 'web:select-none font-inter-semibold text-base',
  parentVariants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-brown-800',
      secondary: 'text-brown-800',
      ghost: 'text-brown-800',
      link: 'text-green-700',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-sm',
      icon: 'text-sm',
    },
  },
});

const buttonSpinnerStyle = tva({
  base: '',
  parentVariants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-4 w-4',
      lg: 'h-4 w-4',
      icon: 'h-4 w-4',
    },
  },
});

const buttonIconStyle = tva({
  base: 'fill-none pointer-events-none shrink-0',
  parentVariants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-white',
      outline:
        'text-brown-800 data-[hover=true]:text-accent-foreground data-[active=true]:text-accent-foreground',
      secondary: 'text-secondary-foreground',
      ghost:
        'text-brown-800 data-[hover=true]:text-accent-foreground data-[active=true]:text-accent-foreground',
      link: 'text-primary',
    },
    size: {
      default: 'h-4 w-4',
      sm: 'h-4 w-4',
      lg: 'h-4 w-4',
      icon: 'h-4 w-4',
    },
  },
});
const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      'xs': 'gap-1',
      'sm': 'gap-2',
      'md': 'gap-3',
      'lg': 'gap-4',
      'xl': 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      'row': 'flex-row',
      'column': 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});
type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  'context'
> &
  VariantProps<typeof buttonStyle> & { className?: string };
const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <UIButton
      ref={ref}
      {...props}
      className={buttonStyle({ variant, size, class: className })}
      context={{ variant, size }}
    />
  );
});
type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string };
const ButtonText = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, size, ...props }, ref) => {
  const styleCtx = useStyleContext(SCOPE) ?? {};
  const parentSize = styleCtx.size;
  const parentVariant = styleCtx.variant ?? 'default';
  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
        },
        size,
        class: className,
      })}
    />
  );
});
const ButtonSpinner = React.forwardRef<
  React.ElementRef<typeof UIButton.Spinner>,
  React.ComponentPropsWithoutRef<typeof UIButton.Spinner>
>(({ className, size, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE);
  const variantSize =
    typeof size === 'string' ? size : undefined;
  return (
    <UIButton.Spinner
      ref={ref}
      {...props}
      size={size}
      className={buttonSpinnerStyle({
        parentVariants: { size: parentSize },
        class: className,
        size: variantSize as 'default' | 'sm' | 'lg' | 'icon' | undefined,
      })}
    />
  );
});
type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined;
    as?: React.ElementType;
    height?: number;
    width?: number;
  };
const ButtonIcon = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, ...props }, ref) => {
  const { size: parentSize, variant: parentVariant } = useStyleContext(SCOPE);
  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIButton.Icon
      {...props}
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
        },
        size,
        class: className,
      })}
      ref={ref}
    />
  );
});
type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>;
const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(
  (
    {
      className,
      space = 'md',
      isAttached = false,
      flexDirection = 'column',
      ...props
    },
    ref
  ) => {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
        ref={ref}
      />
    );
  }
);
Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';
export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup };
