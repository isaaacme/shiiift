import React from 'react';

interface ToolShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
  time: string;
  timeLabel: string;
}

export default function ToolShell({ children, title, description, time, timeLabel }: ToolShellProps) {
  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-xs tracking-widest uppercase text-shift-accent">Tool</span>
            <span className="font-mono text-xs text-shift-muted border border-shift-line px-2 py-0.5 rounded-md">
              {time} {timeLabel}
            </span>
          </div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-shift-text leading-tight mb-3">
            {title}
          </h1>
          <p className="text-shift-muted leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
