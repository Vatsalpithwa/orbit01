import { NextRequest, NextResponse } from 'next/server';

interface CodeRunRequest {
  language: 'python' | 'javascript' | 'cpp' | 'sql';
  code: string;
  stdin?: string;
  cpuTimeLimit?: number;
  memoryLimitKb?: number;
}

// Judge0 Language ID Mapping
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 92, // Python (3.11.2)
  py: 92,
  javascript: 97, // JavaScript (Node.js 20.17.0)
  js: 97,
  cpp: 105, // C++ (GCC 14.1.0)
  c: 103, // C (GCC 14.1.0)
  sql: 82, // SQL (SQLite 3.27.2)
};

export async function POST(req: NextRequest) {
  try {
    const body: CodeRunRequest = await req.json();
    const { language, code, stdin = '', cpuTimeLimit = 5, memoryLimitKb = 128000 } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({
        output: '',
        error: 'No code provided for execution.',
        executionTimeMs: 0,
      }, { status: 400 });
    }

    const languageId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
    if (!languageId) {
      return NextResponse.json({
        output: '',
        error: `Language "${language}" is not supported for remote sandbox execution.`,
        executionTimeMs: 0,
      }, { status: 400 });
    }

    const judge0BaseUrl = process.env.JUDGE0_URL || 'https://ce.judge0.com';
    const rapidApiKey = process.env.JUDGE0_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (rapidApiKey) {
      headers['X-RapidAPI-Key'] = rapidApiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const payload = {
      language_id: languageId,
      source_code: code,
      stdin: stdin || '',
      cpu_time_limit: Math.min(Math.max(cpuTimeLimit, 1), 15), // Safe bounds: 1s to 15s
      memory_limit: Math.min(Math.max(memoryLimitKb, 16000), 256000), // Safe bounds: 16MB to 256MB
    };

    const startTime = Date.now();

    const judge0Res = await fetch(`${judge0BaseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const elapsedMs = Date.now() - startTime;

    if (!judge0Res.ok) {
      const errText = await judge0Res.text();
      return NextResponse.json({
        output: '',
        error: `Sandbox execution service error (${judge0Res.status}): ${errText}`,
        executionTimeMs: elapsedMs,
      }, { status: 502 });
    }

    const data = await judge0Res.json();

    const stdout = data.stdout || '';
    const stderr = data.stderr || '';
    const compileOutput = data.compile_output || '';
    const statusId = data.status?.id;
    const statusDesc = data.status?.description || 'Unknown';
    const executionTimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : elapsedMs;
    const memoryKb = data.memory || undefined;

    let userFriendlyError = '';

    // Handle specific Judge0 status codes
    // 3: Accepted
    // 4: Wrong Answer
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7-12: Runtime Error / Signal
    // 13: Internal Error
    // 14: Exec Format Error
    if (statusId === 5) {
      userFriendlyError = `⏱️ Execution Timed Out (Time Limit Exceeded - ${cpuTimeLimit}s limit).\nPossible causes:\n- An infinite loop (e.g. while condition never evaluates to false)\n- Unbounded recursive function calls\n- Waiting on input without sufficient stdin data`;
    } else if (statusId === 4) {
      // Typically used in test-case mode
    } else if (statusId === 6) {
      userFriendlyError = `🔨 Compilation Error:\n${compileOutput || 'Failed to compile program.'}`;
    } else if (statusId >= 7 && statusId <= 12) {
      userFriendlyError = `⚠️ Runtime Error (${statusDesc}):\n${stderr || data.message || 'Process terminated abnormally.'}`;
    }

    // Special formatting for SQL results
    let sqlTable: { columns: string[]; rows: any[][] } | undefined = undefined;
    if (language === 'sql' && stdout && stdout.includes('|')) {
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const rows = lines.map((l: string) => l.split('|'));
        // If query returned rows
        sqlTable = {
          columns: rows[0].map((_: any, i: number) => `Col ${i + 1}`),
          rows: rows,
        };
      }
    }

    return NextResponse.json({
      output: stdout,
      stderr: stderr,
      compilerError: compileOutput,
      error: userFriendlyError || undefined,
      executionTimeMs,
      memoryKb,
      exitStatus: statusDesc,
      sqlTable,
    });
  } catch (error: any) {
    console.error('Code execution endpoint error:', error);
    return NextResponse.json({
      output: '',
      error: `Remote execution failed: ${error.message || 'Network or service timeout'}`,
      executionTimeMs: 0,
    }, { status: 500 });
  }
}
