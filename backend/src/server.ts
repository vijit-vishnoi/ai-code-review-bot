import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { dbHelpers } from './db';
import { ClientMessage, ServerMessage, ReviewCompleteMessage } from './types/websocket';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// REST Endpoints
app.get('/sessions', (req, res) => {
    try {
        const sessions = dbHelpers.getAllSessions();
        res.json(sessions);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/sessions/:id', (req, res) => {
    try {
        const session = dbHelpers.getSessionById(req.params.id);
        if (session) {
            res.json(session);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (err) {
        console.error('Error fetching session:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sendMessage = (ws: WebSocket, message: ServerMessage) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
};

wss.on('connection', (ws) => {
    const sessionId = uuidv4();
    console.log(`New WS connection established: ${sessionId}`);

    // Immediately send ConnectionEstablishedMessage
    sendMessage(ws, {
        type: 'CONNECTION_ESTABLISHED',
        payload: { sessionId }
    });

    // We keep track of the abort controller for this session to cancel the fetch if needed
    let fetchAbortController: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    ws.on('message', async (data) => {
        let parsedData: any;
        
        try {
            parsedData = JSON.parse(data.toString());
        } catch (error) {
            console.error(`Invalid JSON received from client ${sessionId}`, error);
            sendMessage(ws, {
                type: 'ERROR',
                payload: { message: 'Invalid JSON payload' }
            });
            return;
        }

        const message = parsedData as ClientMessage;

        if (message.type === 'REVIEW_REQUEST') {
            const { code, language } = message.payload;
            console.log(`Review request for session ${sessionId} (${language})`);
            
            // Save initial session state to DB
            try {
                dbHelpers.createSession(sessionId, code, language);
            } catch (err) {
                console.error(`Error saving initial session to DB ${sessionId}`, err);
            }

            fetchAbortController = new AbortController();
            
            // Set 30 seconds timeout
            timeoutId = setTimeout(() => {
                if (fetchAbortController) {
                    console.log(`LLM Request timeout for session ${sessionId}`);
                    fetchAbortController.abort('Timeout');
                    sendMessage(ws, {
                        type: 'ERROR',
                        payload: { message: 'AI Review service timeout (>30s)' }
                    });
                }
            }, 30000);

            try {
                const response = await fetch(`${pythonServiceUrl}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, language }),
                    signal: fetchAbortController.signal
                });

                if (!response.ok) {
                    throw new Error(`Python service responded with status: ${response.status}`);
                }

                if (!response.body) {
                    throw new Error('No response body from Python service');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let done = false;
                let fullReviewJson = '';

                // SSE buffering
                let buffer = '';

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        buffer += decoder.decode(value, { stream: !done });
                        
                        // Parse SSE format: data: {...}\n\n
                        let boundary = buffer.indexOf('\n\n');
                        while (boundary !== -1) {
                            const chunk = buffer.slice(0, boundary);
                            buffer = buffer.slice(boundary + 2); // remove processed chunk + \n\n
                            
                            if (chunk.startsWith('data: ')) {
                                const dataPayload = chunk.slice(6).trim(); // remove 'data: ' prefix
                                
                                if (dataPayload === '[DONE]') {
                                    continue;
                                }
                                
                                if (dataPayload) {
                                    sendMessage(ws, {
                                        type: 'REVIEW_CHUNK',
                                        payload: { chunk: dataPayload }
                                    });
                                    fullReviewJson += dataPayload;
                                }
                            }
                            boundary = buffer.indexOf('\n\n');
                        }
                    }
                }

                // Stream ended, parse final aggregated JSON
                clearTimeout(timeoutId);
                
                try {
                    const reviewData = JSON.parse(fullReviewJson);
                    
                    if (reviewData.error) {
                        sendMessage(ws, {
                            type: 'ERROR',
                            payload: { message: reviewData.error }
                        });
                        return;
                    }
                    
                    // Save to DB
                    dbHelpers.saveReview(sessionId, fullReviewJson);
                    
                    // Send REVIEW_COMPLETE
                    sendMessage(ws, {
                        type: 'REVIEW_COMPLETE',
                        payload: {
                            sessionId,
                            summary: reviewData.summary || '',
                            score: reviewData.score || 0,
                            bugs: reviewData.bugs || [],
                            style: reviewData.style || [],
                            security: reviewData.security || []
                        }
                    });
                    
                } catch (parseError) {
                    console.error(`Error parsing final review JSON for session ${sessionId}:`, parseError, "Full text:", fullReviewJson);
                    sendMessage(ws, {
                        type: 'ERROR',
                        payload: { message: 'Failed to parse final AI review data' }
                    });
                }

            } catch (error: any) {
                if (error.name === 'AbortError' || error === 'Timeout') {
                    // Handled above in timeout or disconnect
                } else {
                    console.error(`Error communicating with Python service for session ${sessionId}:`, error);
                    sendMessage(ws, {
                        type: 'ERROR',
                        payload: { message: 'Error communicating with AI Review service' }
                    });
                }
                if (timeoutId) clearTimeout(timeoutId);
            }
        }
    });

    ws.on('close', () => {
        console.log(`WS client disconnected: ${sessionId}`);
        if (timeoutId) clearTimeout(timeoutId);
        if (fetchAbortController) {
            console.log(`Aborting ongoing fetch for session ${sessionId}`);
            fetchAbortController.abort();
        }
    });
});

server.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});
