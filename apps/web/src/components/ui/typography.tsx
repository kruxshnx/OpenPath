import type { ComponentProps } from 'react';

// shadcn/ui typography styles
// (https://ui.shadcn.com/docs/components/radix/typography), as reusable
// components. Each merges its base classes with an optional `className`.
// Note: H1 omits the docs' `text-center` (a layout choice, not a type style)
// so it works on left-aligned pages; center via the parent where needed.

function cx(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function TypographyH1({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cx(
        'scroll-m-20 text-4xl font-extrabold tracking-tight text-balance',
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH2({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cx(
        'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        className,
      )}
      {...props}
    />
  );
}

export function TypographyH3({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      className={cx('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function TypographyH4({ className, ...props }: ComponentProps<'h4'>) {
  return (
    <h4
      className={cx('scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function TypographyP({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cx('leading-7 [&:not(:first-child)]:mt-6', className)}
      {...props}
    />
  );
}

export function TypographyBlockquote({
  className,
  ...props
}: ComponentProps<'blockquote'>) {
  return (
    <blockquote
      className={cx('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  );
}

export function TypographyList({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cx('my-6 ml-6 list-disc [&>li]:mt-2', className)}
      {...props}
    />
  );
}

export function TypographyInlineCode({
  className,
  ...props
}: ComponentProps<'code'>) {
  return (
    <code
      className={cx(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}

export function TypographyLead({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cx('text-xl text-muted-foreground', className)} {...props} />
  );
}

export function TypographyLarge({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cx('text-lg font-semibold', className)} {...props} />;
}

export function TypographySmall({ className, ...props }: ComponentProps<'small'>) {
  return (
    <small
      className={cx('text-sm font-medium leading-none', className)}
      {...props}
    />
  );
}

export function TypographyMuted({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cx('text-sm text-muted-foreground', className)} {...props} />
  );
}
