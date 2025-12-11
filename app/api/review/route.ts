import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { ReviewRequest } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { code, language, selectedCode, lineRange, userMessage, conversationHistory }: ReviewRequest =
      await req.json();

    // Validate API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construct context-aware prompt
    const systemPrompt = `You are an expert code reviewer. You're reviewing ${language} code.

Full file context:
\`\`\`${language}
${code}
\`\`\`

The user has selected lines ${lineRange.start}-${lineRange.end}:
\`\`\`${language}
${selectedCode}
\`\`\`

Provide thoughtful, specific feedback on the selected code. Consider:
- Code quality and readability
- Potential bugs or edge cases
- Performance implications
- Best practices for ${language}
- Security concerns

Be concise but thorough. Use markdown for formatting. Focus your feedback specifically on the selected lines, but use the full file context to understand the broader picture.`;

    // Build messages array
    const messages = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey,
    });

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    // Return streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
