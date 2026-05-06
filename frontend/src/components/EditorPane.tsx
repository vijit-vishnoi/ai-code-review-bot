import Editor, { type OnMount } from '@monaco-editor/react';
import { Play, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ReviewCompletePayload } from '../types';

interface EditorPaneProps {
  code: string;
  setCode: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  onReview: () => void;
  isReviewing: boolean;
  structuredReview: ReviewCompletePayload | null;
}

const LANGUAGES = ['javascript', 'typescript', 'python', 'go', 'java'];

export const EditorPane = ({
  code,
  setCode,
  language,
  setLanguage,
  onReview,
  isReviewing,
  structuredReview,
}: EditorPaneProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    // Completely clear existing decorations first
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);

    if (!structuredReview) {
      return;
    }

    const newDecorations: any[] = [];
    const m = monacoRef.current;

    const addDecorations = (
      issues: any[],
      className: string,
      glyphClassName: string,
      overviewColor: string
    ) => {
      if (!issues) return;
      issues.forEach((issue) => {
        if (issue.line) {
          newDecorations.push({
            range: new m.Range(issue.line, 1, issue.line, 1),
            options: {
              isWholeLine: true,
              className,
              glyphMarginClassName: glyphClassName,
              overviewRuler: {
                color: overviewColor,
                position: m.editor.OverviewRulerLane.Right,
              },
              hoverMessage: {
                value: `**${issue.description}**\n\n*Suggestion: ${issue.suggestion || 'None'}*`,
              },
            },
          });
        }
      });
    };

    addDecorations(
      structuredReview.bugs,
      'bg-red-500/20',
      'bg-red-500 rounded-full w-2 h-2 ml-1 mt-1.5',
      '#ef4444' // red-500
    );
    addDecorations(
      structuredReview.security,
      'bg-yellow-500/20',
      'bg-yellow-500 rounded-full w-2 h-2 ml-1 mt-1.5',
      '#eab308' // yellow-500
    );
    addDecorations(
      structuredReview.style,
      'underline decoration-blue-400 decoration-wavy',
      'bg-blue-400 rounded-full w-2 h-2 ml-1 mt-1.5',
      '#60a5fa' // blue-400
    );

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [structuredReview]);

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-3 flex items-center justify-between border-b border-border">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-background text-slate-300 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <button
          onClick={onReview}
          disabled={isReviewing || !code?.trim()}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          {isReviewing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reviewing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Review Code
            </>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            glyphMargin: true,
          }}
        />
      </div>
    </div>
  );
};
