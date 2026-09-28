import { MentorVoice, ExplanationLevel, MentorStyle, SearchSource, QuizQuestion, CodeRunResult } from './types';

export interface ChatGenerateOptions {
  prompt: string;
  mentorVoice: MentorVoice;
  explanationLevel: ExplanationLevel;
  mentorStyle?: MentorStyle;
  webSearchEnabled?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
  conversationHistory?: { role: string; content: string }[];
}

export interface ChatGenerateResult {
  content: string;
  sources?: SearchSource[];
  isError?: boolean;
}

export class AIService {
  /**
   * Streams response from Next.js AI chat endpoint with graceful error reporting
   */
  async streamResponse(
    options: ChatGenerateOptions,
    onChunk: (chunk: string) => void
  ): Promise<ChatGenerateResult> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errorMessage = errJson.error || `AI Service returned status ${res.status}`;
        throw new Error(errorMessage);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let sources: SearchSource[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          // Check for metadata delimiter
          if (chunk.includes('__METADATA_START__')) {
            const parts = chunk.split('__METADATA_START__');
            fullText += parts[0];
            onChunk(parts[0]);
            try {
              const metaJson = parts[1].replace('__METADATA_END__', '');
              const parsed = JSON.parse(metaJson);
              if (parsed.sources) sources = parsed.sources;
            } catch (e) {
              // ignore parse errors
            }
          } else {
            fullText += chunk;
            onChunk(chunk);
          }
        }
        return { content: fullText, sources };
      }
    } catch (e: any) {
      console.warn('API route call encountered error:', e);
      throw e;
    }

    return { content: 'No response received from AI service.', isError: true };
  }

  /**
   * Executes code remotely inside an isolated sandbox (Judge0)
   */
  async runRemoteCode(
    language: string,
    code: string,
    stdin: string = '',
    cpuTimeLimit: number = 5,
    memoryLimitKb: number = 128000
  ): Promise<CodeRunResult> {
    const res = await fetch('/api/code/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        stdin,
        cpuTimeLimit,
        memoryLimitKb,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Sandbox execution error' }));
      return {
        output: '',
        error: errorData.error || `Execution failed with HTTP status ${res.status}`,
        executionTimeMs: 0,
      };
    }

    return await res.json();
  }

  /**
   * Code Lab Educational Debugging / Progressive Hints / Explanations
   */
  async getCodeHint(params: {
    code: string;
    language: string;
    error?: string;
    output?: string;
    stdin?: string;
    hintLevel?: number; // 1, 2, 3
    type?: 'hint' | 'explain' | 'solution';
    mentorVoice?: MentorVoice;
  }): Promise<string> {
    try {
      const res = await fetch('/api/ai/code-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        return data.hint;
      }
    } catch (e) {
      console.warn('Backend code assist unavailable:', e);
    }

    // Dynamic fallback
    if (params.error) {
      return `💡 **Mentor Debugging Observation**:\nThe execution reported: \`${params.error.slice(0, 100)}\`.\n\nTake a close look at:\n1. Variable initialization and bounds.\n2. Off-by-one errors in loop conditions.\n3. Defensive null checks before accessing properties.`;
    }
    return `💡 **Mentor Optimization Tip**:\nYour ${params.language} code ran cleanly! Consider:\n- Testing with edge conditions (empty collections or large inputs).\n- Checking algorithmic time complexity.`;
  }

  /**
   * Generate Adaptive Quiz Questions on the fly
   */
  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<QuizQuestion[]> {
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) return data.questions;
      }
    } catch (e) {
      console.warn('Backend quiz generator unavailable, using dynamic fallback:', e);
    }

    // Dynamic fallback questions
    return [
      {
        id: `gen_q_${Date.now()}_1`,
        question: `What is the primary architectural benefit of applying modern patterns in ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Guarantees zero CPU usage at all times',
          'Improves modularity, testability, and reduces decoupling across system layers',
          'Eliminates the need for any database indexing',
          'Automatically doubles network bandwidth',
        ],
        correctAnswer: 'Improves modularity, testability, and reduces decoupling across system layers',
        explanation: `By adhering to standardized architectural patterns in ${topic}, systems become more maintainable and resilient to future breaking changes.`,
        hint: 'Focus on code maintainability and separation of concerns.',
      },
      {
        id: `gen_q_${Date.now()}_2`,
        question: `True or False: In ${topic}, caching layers should always be implemented with explicit TTLs (Time-To-Live) to prevent stale state.`,
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Without TTLs or explicit invalidation strategies, caches can retain obsolete data indefinitely, causing silent state synchronization bugs.',
      },
      {
        id: `gen_q_${Date.now()}_3`,
        question: `Which metric is most critical when measuring the performance bottlenecks of ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Tail Latency (p99 / p99.9)',
          'Total file size of CSS bundles',
          'The number of comments in source code',
          'Monitor screen resolution',
        ],
        correctAnswer: 'Tail Latency (p99 / p99.9)',
        explanation: 'Tail latency captures the worst-case experience encountered by users under peak loads.',
      },
      {
        id: `gen_q_${Date.now()}_4`,
        question: `Name the fundamental design principle that states software entities should be open for extension but closed for modification:`,
        type: 'short_answer',
        correctAnswer: 'Open-Closed Principle',
        explanation: 'The Open-Closed Principle (the "O" in SOLID) encourages writing code that can incorporate new features without altering existing, tested logic.',
        hint: 'It is the second principle in the SOLID acronym.',
      },
    ];
  }
}

export const aiService = new AIService();
