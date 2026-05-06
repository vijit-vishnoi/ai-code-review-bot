import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SplitPane } from './components/SplitPane';
import { EditorPane } from './components/EditorPane';
import { ReviewPane } from './components/ReviewPane';
import { useReviewSocket } from './hooks/useReviewSocket';
import type { ReviewSession } from './types';
import { Activity, Loader2 } from 'lucide-react';

function App() {
  const [code, setCode] = useState('// Write or paste your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  
  const { 
    isConnected, 
    isReviewing, 
    rawStreamText, 
    structuredReview, 
    error, 
    sendReviewRequest,
    setStructuredReview,
    setRawStreamText
  } = useReviewSocket();

  const handleReview = () => {
    sendReviewRequest(code, language);
  };

  const handleNewChat = () => {
    setCode('');
    setStructuredReview(null);
    setRawStreamText('');
  };

  const handleSelectSession = async (session: ReviewSession) => {
    setIsLoadingSession(true);
    
    try {
      // The backend stores the review as a JSON string
      let parsedReview = null;
      // Use any to bypass TS complaining about optional properties not in type if they exist at runtime
      let sessionCode = session.codeSnippet || (session as any).code || '';
      let sessionReview = session.review || (session as any).review_json;

      // If review is missing, try to fetch full session from database
      if (!sessionReview) {
        const res = await fetch(`http://localhost:3000/sessions/${session.id}`);
        if (res.ok) {
          const data = await res.json();
          sessionCode = data.code || data.codeSnippet || '';
          sessionReview = data.review_json || data.review;
          if (data.language) {
            setLanguage(data.language);
          }
        }
      } else if (session.language) {
        setLanguage(session.language);
      }

      if (typeof sessionReview === 'string') {
        parsedReview = JSON.parse(sessionReview);
      } else if (sessionReview) {
        parsedReview = sessionReview;
      }
      
      // Sync code and structured review simultaneously
      setCode(sessionCode);
      setStructuredReview(parsedReview);
      setRawStreamText('');
    } catch (err) {
      console.error('Failed to parse past session review', err);
      // Fallback safe values
      setCode(session.codeSnippet || (session as any).code || '');
      setStructuredReview(null);
    } finally {
      setIsLoadingSession(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-slate-200 overflow-hidden font-sans">
      <Sidebar onSelectSession={handleSelectSession} onNewChat={handleNewChat} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">AI Code Review</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </header>

        {isLoadingSession ? (
          <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-slate-400 font-medium">Loading session...</p>
            </div>
          </div>
        ) : (
          <SplitPane
            left={
              <EditorPane
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onReview={handleReview}
                isReviewing={isReviewing}
                structuredReview={structuredReview}
              />
            }
            right={
              <ReviewPane
                isReviewing={isReviewing}
                rawStreamText={rawStreamText}
                structuredReview={structuredReview}
                error={error}
              />
            }
          />
        )}
      </div>
    </div>
  );
}

export default App;
