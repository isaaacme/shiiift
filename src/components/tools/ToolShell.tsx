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
            <span className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A]">Tool</span>
            <span className="font-mono text-xs text-[#A7AFBA] border border-[rgba(244,241,234,0.14)] px-2 py-0.5 rounded-md">
              {time} {timeLabel}
            </span>
          </div>
          <h1 className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-3xl sm:text-4xl text-[#F4F1EA] leading-tight mb-3">
            {title}
          </h1>
          <p className="text-[#A7AFBA] leading-relaxed">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
