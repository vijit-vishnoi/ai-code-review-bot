import type { ReviewCompletePayload, CodeIssue } from '../types';
import { AlertCircle, CheckCircle, ShieldAlert, FileText, Check } from 'lucide-react';

interface ReviewPaneProps {
  isReviewing: boolean;
  rawStreamText: string;
  structuredReview: ReviewCompletePayload | null;
  error: string | null;
}

import type { ReactNode } from 'react';

const IssueList = ({ issues, title, icon, color }: { issues: CodeIssue[], title: string, icon: ReactNode, color: string }) => {
  if (!issues || issues.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="space-y-3">
        {issues.map((issue, idx) => (
          <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="flex justify-between items-start gap-4 mb-2">
              <p className="text-slate-300 text-sm">{issue.description}</p>
              {issue.line && (
                <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400 shrink-0">
                  Line {issue.line}
                </span>
              )}
            </div>
            {issue.suggestion && (
              <div className="mt-2 text-sm text-slate-400 bg-slate-900/50 p-2 rounded italic">
                Suggestion: {issue.suggestion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewPane = ({
  isReviewing,
  rawStreamText,
  structuredReview,
  error
}: ReviewPaneProps) => {
  if (error) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-red-400 text-center">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (isReviewing && !structuredReview) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-primary font-medium text-sm">AI is analyzing your code...</span>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 flex-1 overflow-y-auto border border-slate-800">
          <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {rawStreamText || 'Connecting to model...'}
          </pre>
        </div>
      </div>
    );
  }

  if (structuredReview) {
    const isPerfectScore = structuredReview.score === 100;
    
    return (
      <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 bg-slate-800/80 rounded-xl p-6 border border-slate-700 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Review Summary
            </h2>
            <p className="text-slate-300 leading-relaxed">{structuredReview.summary}</p>
          </div>
          <div className="shrink-0 flex flex-col items-center justify-center bg-slate-900 rounded-full w-24 h-24 border-4 border-primary/20">
            <span className={`text-2xl font-bold ${structuredReview.score > 80 ? 'text-green-400' : structuredReview.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {structuredReview.score}
            </span>
            <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Score</span>
          </div>
        </div>

        {isPerfectScore ? (
          <div className="flex flex-col items-center justify-center py-12 text-green-400/80">
            <Check className="w-16 h-16 mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2 text-green-400">Excellent Code!</h3>
            <p className="text-slate-400 text-center max-w-md">No bugs, style issues, or security vulnerabilities were detected.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <IssueList 
              title="Bugs" 
              issues={structuredReview.bugs} 
              icon={<AlertCircle className="w-5 h-5" />} 
              color="text-red-400" 
            />
            <IssueList 
              title="Security Vulnerabilities" 
              issues={structuredReview.security} 
              icon={<ShieldAlert className="w-5 h-5" />} 
              color="text-yellow-400" 
            />
            <IssueList 
              title="Style & Best Practices" 
              issues={structuredReview.style} 
              icon={<CheckCircle className="w-5 h-5" />} 
              color="text-blue-400" 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-slate-500">
      <FileText className="w-16 h-16 mb-4 opacity-20" />
      <p className="text-lg font-medium">Ready for review</p>
      <p className="text-sm mt-2 text-slate-600 max-w-sm text-center">
        Write or paste your code on the left, then click "Review Code" to get AI-powered feedback.
      </p>
    </div>
  );
};
