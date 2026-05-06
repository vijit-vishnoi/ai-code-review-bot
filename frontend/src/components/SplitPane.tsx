import type { ReactNode } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
}

export const SplitPane = ({ left, right }: SplitPaneProps) => {
  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-border">
        {left}
      </div>
      <div className="w-1/2 flex flex-col bg-background overflow-y-auto">
        {right}
      </div>
    </div>
  );
};
