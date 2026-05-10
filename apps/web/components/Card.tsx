import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn(
        'border bg-bgCard p-6',
        accent ? 'border-gold' : 'border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>{children}</div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-textMuted text-xs tracking-[0.25em] uppercase">{children}</p>
  );
}
