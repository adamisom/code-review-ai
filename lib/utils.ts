import { v4 as uuidv4 } from 'uuid';
import { CodeThread, Message, THREAD_COLORS, ThreadColor } from './types';

// Generate a unique ID
export function generateId(): string {
  return uuidv4();
}

// Get the next available thread color
export function getNextThreadColor(existingThreads: CodeThread[]): ThreadColor {
  const usedColors = new Set(existingThreads.map(t => t.color));
  const availableColor = THREAD_COLORS.find(color => !usedColors.has(color));
  return availableColor || THREAD_COLORS[existingThreads.length % THREAD_COLORS.length];
}

// Format timestamp for display
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Detect programming language from code content or filename
export function detectLanguage(code: string, fileName?: string): string {
  // Try file extension first
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sh': 'shell',
      'bash': 'shell',
    };
    
    if (ext && extensionMap[ext]) {
      return extensionMap[ext];
    }
  }

  // Heuristic detection based on code content
  if (code.includes('def ') && code.includes('import ')) return 'python';
  if (code.includes('function') && code.includes('const')) return 'typescript';
  if (code.includes('func ') && code.includes('package ')) return 'go';
  if (code.includes('fn ') && code.includes('let ')) return 'rust';
  if (code.includes('class ') && code.includes('public')) return 'java';
  if (code.includes('<?php')) return 'php';
  if (code.includes('<!DOCTYPE html>')) return 'html';
  
  return 'plaintext';
}

// Truncate text for preview
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Check if two line ranges overlap
export function rangesOverlap(
  range1: { start: number; end: number },
  range2: { start: number; end: number }
): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}

// Get line count from code
export function getLineCount(code: string): number {
  return code.split('\n').length;
}

// Extract selected text from code given line/column range
// CodeMirror uses 1-indexed positions, endColumn is inclusive
export function extractSelection(
  code: string,
  startLine: number,
  startColumn: number,
  endLine: number,
  endColumn: number
): string {
  const lines = code.split('\n');
  
  if (startLine === endLine) {
    // For single line, endColumn is inclusive
    return lines[startLine - 1].substring(startColumn - 1, endColumn);
  }
  
  const selectedLines: string[] = [];
  for (let i = startLine - 1; i <= endLine - 1; i++) {
    if (i === startLine - 1) {
      selectedLines.push(lines[i].substring(startColumn - 1));
    } else if (i === endLine - 1) {
      // endColumn is inclusive
      selectedLines.push(lines[i].substring(0, endColumn));
    } else {
      selectedLines.push(lines[i]);
    }
  }
  
  return selectedLines.join('\n');
}

// Tailwind CSS utility for merging class names
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
