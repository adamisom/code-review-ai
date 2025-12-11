import { streamAIResponse, StreamingCallbacks } from '../../api/streaming';
import { ReviewRequest } from '../../types';

// Mock fetch, TextDecoder, and TextEncoder
global.fetch = jest.fn();

// Mock TextDecoder for Node.js environment
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = class {
    decode(input: Uint8Array, options?: { stream?: boolean }): string {
      return Buffer.from(input).toString('utf-8');
    }
  } as typeof TextDecoder;
}

// Mock TextEncoder for Node.js environment
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = class {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf-8'));
    }
  } as typeof TextEncoder;
}

describe('streamAIResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should stream response chunks correctly', async () => {
    const mockChunks = ['Hello', ' World', '!'];
    const mockReader = {
      read: jest.fn(),
    };

    let chunkIndex = 0;
    mockReader.read.mockImplementation(() => {
      if (chunkIndex < mockChunks.length) {
        const chunk = mockChunks[chunkIndex++];
        return Promise.resolve({
          done: false,
          value: new TextEncoder().encode(chunk),
        });
      }
      return Promise.resolve({ done: true, value: undefined });
    });

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request: ReviewRequest = {
      code: 'const x = 1;',
      language: 'typescript',
      selectedCode: 'const x = 1;',
      lineRange: { start: 1, end: 1 },
      userMessage: 'Review this',
      conversationHistory: [],
    };

    const callbacks: StreamingCallbacks = {
      onChunk: jest.fn(),
      onError: jest.fn(),
      onComplete: jest.fn(),
    };

    await streamAIResponse(request, callbacks);

    expect(callbacks.onChunk).toHaveBeenCalledTimes(3);
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(2, 'Hello World');
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(3, 'Hello World!');
    expect(callbacks.onComplete).toHaveBeenCalled();
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const request: ReviewRequest = {
      code: 'const x = 1;',
      language: 'typescript',
      selectedCode: 'const x = 1;',
      lineRange: { start: 1, end: 1 },
      userMessage: 'Review this',
      conversationHistory: [],
    };

    const callbacks: StreamingCallbacks = {
      onChunk: jest.fn(),
      onError: jest.fn(),
      onComplete: jest.fn(),
    };

    await expect(streamAIResponse(request, callbacks)).rejects.toThrow();
    expect(callbacks.onError).toHaveBeenCalled();
    expect(callbacks.onComplete).not.toHaveBeenCalled();
  });
});

