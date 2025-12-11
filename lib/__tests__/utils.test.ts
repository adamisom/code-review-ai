import {
  generateId,
  getNextThreadColor,
  formatTimestamp,
  detectLanguage,
  truncateText,
  extractSelection,
} from '../utils';
import { CodeThread, THREAD_COLORS } from '../types';

describe('utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('getNextThreadColor', () => {
    it('should return first color when no threads exist', () => {
      const color = getNextThreadColor([]);
      expect(THREAD_COLORS).toContain(color);
      expect(color).toBe(THREAD_COLORS[0]);
    });

    it('should return next available color', () => {
      const threads: CodeThread[] = [
        {
          id: '1',
          startLine: 1,
          endLine: 1,
          startColumn: 1,
          endColumn: 1,
          selectedCode: 'test',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          color: THREAD_COLORS[0],
        },
      ];
      const color = getNextThreadColor(threads);
      expect(color).toBe(THREAD_COLORS[1]);
    });

    it('should cycle through colors when all are used', () => {
      const threads: CodeThread[] = THREAD_COLORS.map((color, idx) => ({
        id: String(idx),
        startLine: 1,
        endLine: 1,
        startColumn: 1,
        endColumn: 1,
        selectedCode: 'test',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        color,
      }));
      const color = getNextThreadColor(threads);
      expect(THREAD_COLORS).toContain(color);
    });
  });

  describe('formatTimestamp', () => {
    it('should format recent timestamps correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000);
      const result = formatTimestamp(oneMinuteAgo.toISOString());
      expect(result).toBe('1m ago');
    });

    it('should format old timestamps as date', () => {
      const oldDate = new Date('2020-01-01');
      const result = formatTimestamp(oldDate.toISOString());
      expect(result).toBeTruthy();
    });
  });

  describe('detectLanguage', () => {
    it('should detect language from file extension', () => {
      expect(detectLanguage('', 'test.ts')).toBe('typescript');
      expect(detectLanguage('', 'test.tsx')).toBe('tsx');
      expect(detectLanguage('', 'test.js')).toBe('javascript');
      expect(detectLanguage('', 'test.jsx')).toBe('jsx');
      expect(detectLanguage('', 'test.py')).toBe('python');
    });

    it('should detect language from code content', () => {
      expect(detectLanguage('def hello():\n    pass\nimport os', '')).toBe('python');
      expect(detectLanguage('function test() {\n  const x = 1;\n}', '')).toBe('javascript');
      expect(detectLanguage('function test(): string {\n  const x: number = 1;\n}', '')).toBe('typescript');
      expect(detectLanguage('const Component = () => {\n  return <div>Hello</div>;\n}', '')).toBe('jsx');
      expect(detectLanguage('const Component: React.FC = () => {\n  return <div>Hello</div>;\n}', '')).toBe('tsx');
    });

    it('should return plaintext for unknown', () => {
      expect(detectLanguage('random text', '')).toBe('plaintext');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'a'.repeat(200);
      const result = truncateText(longText, 100);
      expect(result.length).toBe(103); // 100 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should not truncate short text', () => {
      const shortText = 'short';
      const result = truncateText(shortText, 100);
      expect(result).toBe(shortText);
    });
  });

  describe('extractSelection', () => {
    const code = 'line1\nline2\nline3\nline4';

    it('should extract single line selection', () => {
      const result = extractSelection(code, 2, 1, 2, 6); // line2 has 5 chars, so endColumn 6 includes all
      expect(result).toBe('line2');
    });

    it('should extract multi-line selection', () => {
      const result = extractSelection(code, 1, 1, 3, 6); // line3 has 5 chars
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should handle partial line selection', () => {
      const result = extractSelection(code, 2, 2, 2, 5); // columns 2-5 of "line2" = "ine2"
      expect(result).toBe('ine2');
    });
  });
});

