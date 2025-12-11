import { CodeReviewSession } from './types';

const STORAGE_KEY = 'code-review-sessions';
const MAX_SESSIONS = 10; // Keep only the 10 most recent sessions

// Save sessions to localStorage
export function saveSessions(sessions: CodeReviewSession[]): void {
  try {
    // Keep only the most recent sessions
    const sessionsToSave = sessions
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, MAX_SESSIONS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old sessions');
      // Try saving with fewer sessions
      const reducedSessions = sessions.slice(0, 5);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedSessions));
      } catch (retryError) {
        console.error('Failed to save even with reduced sessions:', retryError);
      }
    }
  }
}

// Load sessions from localStorage
export function loadSessions(): CodeReviewSession[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
}

// Save a single session
export function saveSession(session: CodeReviewSession): void {
  const sessions = loadSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  
  saveSessions(sessions);
}

// Delete a session
export function deleteSession(sessionId: string): void {
  const sessions = loadSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveSessions(filtered);
}

// Clear all sessions
export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
}
