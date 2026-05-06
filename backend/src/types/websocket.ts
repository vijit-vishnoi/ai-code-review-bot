export interface CodeIssue {
    description: string;
    line?: number;
}

export interface ReviewRequestMessage {
    type: 'REVIEW_REQUEST';
    payload: {
        code: string;
        language: string;
    };
}

export interface ConnectionEstablishedMessage {
    type: 'CONNECTION_ESTABLISHED';
    payload: {
        sessionId: string;
    };
}

export interface ReviewStreamChunkMessage {
    type: 'REVIEW_CHUNK';
    payload: {
        chunk: string;
    };
}

export interface ReviewCompleteMessage {
    type: 'REVIEW_COMPLETE';
    payload: {
        sessionId: string;
        summary: string;
        score: number;
        bugs: CodeIssue[];
        style: CodeIssue[];
        security: CodeIssue[];
    };
}

export interface ErrorMessage {
    type: 'ERROR';
    payload: {
        message: string;
    };
}

export type ClientMessage = ReviewRequestMessage;
export type ServerMessage = ConnectionEstablishedMessage | ReviewStreamChunkMessage | ReviewCompleteMessage | ErrorMessage;
