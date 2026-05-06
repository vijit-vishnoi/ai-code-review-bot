import { useState, useEffect, useRef, useCallback } from 'react';
import type { ClientMessage, ServerMessage, ReviewCompleteMessage } from '../types';

export function useReviewSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rawStreamText, setRawStreamText] = useState("");
  const [structuredReview, setStructuredReview] = useState<ReviewCompleteMessage['payload'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);

        if (message.type === 'CONNECTED') {
          console.log('Connected with Session ID:', message.payload.sessionId);
        } else if (message.type === 'REVIEW_CHUNK') {
          setRawStreamText(prev => prev + message.payload);
        } else if (message.type === 'REVIEW_COMPLETE') {
          setStructuredReview(message.payload);
          setRawStreamText("");
          setIsReviewing(false);
        } else if (message.type === 'ERROR') {
          setError(message.payload.message);
          setIsReviewing(false);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (e) => {

      if (socket.readyState !== WebSocket.CLOSED) {
        console.error("WebSocket error", e);
      }
    };


    return () => {
      socket.close();
    };
  }, []);

  const sendReviewRequest = useCallback((code: string, language: string) => {
    setRawStreamText("");
    setStructuredReview(null);
    setError(null);
    setIsReviewing(true);

    const currentSocket = socketRef.current;


    if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
      const message: ClientMessage = {
        type: 'REVIEW_REQUEST',
        payload: { code, language }
      };
      currentSocket.send(JSON.stringify(message));
    } else {
      setError("Connection lost. Please refresh the page.");
    }
  }, []);

  return { 
    isConnected, 
    isReviewing,
    rawStreamText, 
    structuredReview, 
    error, 
    sendReviewRequest,
    setStructuredReview,
    setRawStreamText
  };
}