import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AICompletionOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AICompletionResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Generate AI completion using OpenAI
 */
export async function generateCompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const {
    prompt,
    maxTokens = 1000,
    temperature = 0.7,
    model = 'gpt-4-turbo-preview',
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });

    return {
      text: completion.choices[0].message.content || '',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI completion');
  }
}

/**
 * Improve writing with AI suggestions
 */
export async function improveWriting(text: string): Promise<string> {
  const prompt = `Improve the following text by making it clearer, more concise, and more professional. Maintain the original meaning and tone.

Original text:
${text}

Improved version:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });

  return result.text;
}

/**
 * Summarize content
 */
export async function summarizeContent(
  text: string,
  maxLength: number = 200
): Promise<string> {
  const prompt = `Summarize the following text in approximately ${maxLength} words. Keep the key points and main ideas.

Text to summarize:
${text}

Summary:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.5,
    maxTokens: Math.ceil(maxLength * 1.5),
  });

  return result.text;
}

/**
 * Generate content outline
 */
export async function generateOutline(topic: string): Promise<string> {
  const prompt = `Create a detailed outline for content about: "${topic}"

Include:
- Main sections with clear headings
- Sub-sections under each main section
- Key points to cover
- Suggested flow and structure

Outline:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.8,
    maxTokens: 1500,
  });

  return result.text;
}

/**
 * Fix grammar and spelling
 */
export async function fixGrammarAndSpelling(text: string): Promise<string> {
  const prompt = `Fix all grammar and spelling errors in the following text. Keep the original meaning and style.

Text:
${text}

Corrected version:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.3,
    maxTokens: 2000,
  });

  return result.text;
}

/**
 * Translate text
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}. Maintain the original tone and meaning.

Text to translate:
${text}

Translation:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.3,
    maxTokens: 2000,
  });

  return result.text;
}

/**
 * Generate ideas based on topic
 */
export async function generateIdeas(
  topic: string,
  count: number = 5
): Promise<string[]> {
  const prompt = `Generate ${count} creative and unique ideas related to: "${topic}"

For each idea, provide:
- A clear title
- A brief description

Ideas:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.9,
    maxTokens: 1500,
  });

  // Parse the result into an array of ideas
  const ideas = result.text
    .split('\n\n')
    .filter(idea => idea.trim().length > 0)
    .slice(0, count);

  return ideas;
}

/**
 * Answer questions based on context
 */
export async function answerQuestion(
  question: string,
  context: string
): Promise<string> {
  const prompt = `Based on the following context, answer the question.

Context:
${context}

Question: ${question}

Answer:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.5,
    maxTokens: 1000,
  });

  return result.text;
}

/**
 * Generate code snippets
 */
export async function generateCode(
  description: string,
  language: string = 'typescript'
): Promise<string> {
  const prompt = `Generate ${language} code for the following requirement:

${description}

Provide clean, well-commented, production-ready code.

Code:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.4,
    maxTokens: 2000,
    model: 'gpt-4-turbo-preview',
  });

  return result.text;
}

/**
 * Extract action items from text
 */
export async function extractActionItems(text: string): Promise<string[]> {
  const prompt = `Extract all action items and tasks from the following text. List them as clear, actionable items.

Text:
${text}

Action Items:`;

  const result = await generateCompletion({
    prompt,
    temperature: 0.3,
    maxTokens: 1000,
  });

  const actionItems = result.text
    .split('\n')
    .filter(item => item.trim().length > 0 && /^[\d-•*]/.test(item.trim()))
    .map(item => item.replace(/^[\d-•*]\s*/, '').trim());

  return actionItems;
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Moderate content for safety
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];

    return {
      flagged: result.flagged,
      categories: result.categories as Record<string, boolean>,
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    throw new Error('Failed to moderate content');
  }
}
