import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  improveWriting,
  summarizeContent,
  generateOutline,
  fixGrammarAndSpelling,
  translateText,
  generateIdeas,
  answerQuestion,
  generateCode,
  extractActionItems,
} from '@/lib/ai';
import { withRateLimit, rateLimitPresets } from '@/lib/rate-limit';

async function handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    let result: any;

    switch (action) {
      case 'improve':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }
        result = await improveWriting(data.text);
        break;

      case 'summarize':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }
        result = await summarizeContent(data.text, data.maxLength);
        break;

      case 'outline':
        if (!data.topic) {
          return NextResponse.json(
            { error: 'Topic is required' },
            { status: 400 }
          );
        }
        result = await generateOutline(data.topic);
        break;

      case 'fix-grammar':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }
        result = await fixGrammarAndSpelling(data.text);
        break;

      case 'translate':
        if (!data.text || !data.targetLanguage) {
          return NextResponse.json(
            { error: 'Text and target language are required' },
            { status: 400 }
          );
        }
        result = await translateText(data.text, data.targetLanguage);
        break;

      case 'generate-ideas':
        if (!data.topic) {
          return NextResponse.json(
            { error: 'Topic is required' },
            { status: 400 }
          );
        }
        result = await generateIdeas(data.topic, data.count || 5);
        break;

      case 'answer-question':
        if (!data.question || !data.context) {
          return NextResponse.json(
            { error: 'Question and context are required' },
            { status: 400 }
          );
        }
        result = await answerQuestion(data.question, data.context);
        break;

      case 'generate-code':
        if (!data.description) {
          return NextResponse.json(
            { error: 'Description is required' },
            { status: 400 }
          );
        }
        result = await generateCode(data.description, data.language);
        break;

      case 'extract-tasks':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }
        result = await extractActionItems(data.text);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply rate limiting (10 AI requests per 5 minutes)
export const POST = withRateLimit(handler, {
  interval: 300,
  maxRequests: 10,
});
