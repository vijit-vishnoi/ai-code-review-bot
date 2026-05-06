export interface CodeIssue {
  description: string;
  line?: number;
  suggestion?: string;
}

export interface ReviewCompletePayload {
  bugs: CodeIssue[];
  style: CodeIssue[];
  security: CodeIssue[];
  summary: string;
  score: number;
}

export type ClientMessage = {
  type: 'REVIEW_REQUEST';
  payload: {
    code: string;
    language: string;
  };
};

export type ReviewCompleteMessage = {
  type: 'REVIEW_COMPLETE';
  payload: ReviewCompletePayload;
};

export type ServerMessage =
  | { type: 'CONNECTED'; payload: { sessionId: string } }
  | { type: 'REVIEW_CHUNK'; payload: string }
  | ReviewCompleteMessage
  | { type: 'ERROR'; payload: { message: string } };

export interface ReviewSession {
  id: string;
  codeSnippet: string;
  language?: string;
  review: string;
  timestamp?: string;
  created_at?: string;
}
