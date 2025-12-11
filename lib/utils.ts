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
  // Try file extension first (most reliable)
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'tsx', // Distinguish TSX from TS
      'js': 'javascript',
      'jsx': 'jsx', // Distinguish JSX from JS
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'h': 'c',
      'cs': 'csharp',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'sql': 'sql',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
    };
    
    if (ext && extensionMap[ext]) {
      return extensionMap[ext];
    }
  }

  // Improved heuristic detection based on code content
  const trimmedCode = code.trim();
  if (!trimmedCode) return 'plaintext';

  // Check for JSX/TSX patterns first (most specific)
  const hasJSX = /<[A-Z]\w+/.test(code) || 
                 /<[a-z]+\.[A-Z]/.test(code) ||
                 code.includes('</') ||
                 /return\s*\(?\s*</.test(code);
  
  // TypeScript detection (check for type annotations, interfaces, etc.)
  const hasTypeScript = /:\s*\w+(\s*[=,;\)\]\}])/.test(code) || 
                        code.includes('interface ') || 
                        code.includes('type ') ||
                        code.includes('enum ') ||
                        /as\s+\w+/.test(code) ||
                        /React\.FC|React\.Component/.test(code);
  
  // Check TSX first (TypeScript + JSX)
  if (hasTypeScript && hasJSX) return 'tsx';
  // Then check JSX alone
  if (hasJSX) return 'jsx';
  // Then check TypeScript alone
  if (hasTypeScript) return 'typescript';

  // JavaScript detection
  if ((code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('var ')) &&
      (code.includes('=>') || code.includes('()') || code.includes('{}'))) {
    return 'javascript';
  }

  // Python detection (more specific)
  if ((code.includes('def ') || code.includes('class ')) && 
      (code.includes('import ') || code.includes('from ') || /:\s*$/.test(code))) {
    return 'python';
  }

  // Go detection
  if (code.includes('func ') && code.includes('package ')) return 'go';
  if (code.includes('package ') && code.includes('import (')) return 'go';

  // Rust detection
  if (code.includes('fn ') && (code.includes('let ') || code.includes('mut '))) return 'rust';
  if (code.includes('use ') && code.includes('::')) return 'rust';

  // Java detection
  if (code.includes('public class') || (code.includes('class ') && code.includes('public '))) return 'java';
  if (code.includes('@') && code.includes('class ')) return 'java'; // Annotations

  // PHP detection
  if (code.includes('<?php') || code.includes('<?=')) return 'php';

  // HTML detection
  if (code.includes('<!DOCTYPE') || code.includes('<html') || code.includes('<body')) return 'html';
  if (/<[a-z]+[^>]*>/.test(code) && code.includes('</')) return 'html';

  // CSS detection
  if (code.includes('{') && code.includes('}') && /[a-z-]+:\s*[^;]+;/.test(code)) return 'css';

  // JSON detection
  if ((code.trim().startsWith('{') || code.trim().startsWith('[')) && 
      code.includes('"') && code.includes(':')) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue
    }
  }

  // Shell script detection
  if (code.startsWith('#!/bin/') || code.startsWith('#!/usr/bin/')) return 'shell';
  if (/^\$\w+\s*=/.test(code) || code.includes('if [') || code.includes('then')) return 'shell';

  // SQL detection
  if (/SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP/i.test(code) && 
      /FROM|INTO|SET|WHERE/i.test(code)) {
    return 'sql';
  }

  // Ruby detection
  if (code.includes('def ') && code.includes('end') && !code.includes('import ')) return 'ruby';
  if (code.includes('class ') && code.includes('end') && !code.includes('{')) return 'ruby';

  // C/C++ detection
  if (code.includes('#include') && (code.includes('int main') || code.includes('void main'))) {
    return code.includes('iostream') || code.includes('namespace') ? 'cpp' : 'c';
  }

  return 'plaintext';
}

// Truncate text for preview
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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

// Parse code suggestions from markdown content
// Looks for code blocks that might contain suggested code changes
export function parseCodeSuggestions(
  markdownContent: string,
  originalCode: string,
  language?: string
): Array<{ originalCode: string; suggestedCode: string; description?: string }> {
  const suggestions: Array<{ originalCode: string; suggestedCode: string; description?: string }> = [];
  
  // Match code blocks in markdown (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const matches = Array.from(markdownContent.matchAll(codeBlockRegex));
  
  if (matches.length === 0) return suggestions;
  
  // Look for patterns that suggest code changes:
  // 1. Code blocks with language matching the original
  // 2. Code blocks that are similar in structure to the original
  // 3. Code blocks preceded by text like "Here's a better version" or "Suggested change"
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const blockLanguage = match[1]?.toLowerCase() || '';
    const codeContent = match[2].trim();
    
    // Check if this looks like a suggestion
    const beforeText = markdownContent.substring(0, match.index || 0);
    const isSuggestion = 
      /suggest|better|improved|refactor|alternative|here'?s|try this/i.test(beforeText.slice(-200)) ||
      blockLanguage === language?.toLowerCase() ||
      codeContent.length > 20; // Reasonable code length
    
    if (isSuggestion && codeContent !== originalCode.trim()) {
      // Try to find context description
      const contextMatch = beforeText.match(/(?:here'?s|suggest|better|improved|alternative)[^`]*$/i);
      const description = contextMatch?.[0]?.trim() || undefined;
      
      suggestions.push({
        originalCode: originalCode,
        suggestedCode: codeContent,
        description: description,
      });
    }
  }
  
  return suggestions;
}

// Simple diff algorithm to highlight changes
export function computeDiff(original: string, suggested: string): Array<{ type: 'equal' | 'delete' | 'insert'; text: string }> {
  const originalLines = original.split('\n');
  const suggestedLines = suggested.split('\n');
  const diff: Array<{ type: 'equal' | 'delete' | 'insert'; text: string }> = [];
  
  let i = 0;
  let j = 0;
  
  while (i < originalLines.length || j < suggestedLines.length) {
    if (i >= originalLines.length) {
      // Only suggested lines left
      diff.push({ type: 'insert', text: suggestedLines[j] });
      j++;
    } else if (j >= suggestedLines.length) {
      // Only original lines left
      diff.push({ type: 'delete', text: originalLines[i] });
      i++;
    } else if (originalLines[i] === suggestedLines[j]) {
      // Lines match
      diff.push({ type: 'equal', text: originalLines[i] });
      i++;
      j++;
    } else {
      // Lines differ - check if it's a simple modification
      const nextOriginal = i + 1 < originalLines.length ? originalLines[i + 1] : null;
      const nextSuggested = j + 1 < suggestedLines.length ? suggestedLines[j + 1] : null;
      
      if (nextOriginal === suggestedLines[j]) {
        // Original line was deleted
        diff.push({ type: 'delete', text: originalLines[i] });
        i++;
      } else if (nextSuggested === originalLines[i]) {
        // Suggested line was inserted
        diff.push({ type: 'insert', text: suggestedLines[j] });
        j++;
      } else {
        // Both lines changed
        diff.push({ type: 'delete', text: originalLines[i] });
        diff.push({ type: 'insert', text: suggestedLines[j] });
        i++;
        j++;
      }
    }
  }
  
  return diff;
}
