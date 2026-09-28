import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty } = await req.json();

    const questions = [
      {
        id: `q_${Date.now()}_1`,
        question: `In modern ${topic || 'Computer Science'}, what is considered the primary architectural advantage of state immutability?`,
        type: 'multiple_choice',
        options: [
          'Prevents accidental side-effects and enables predictable time-travel debugging and concurrency',
          'Eliminates the requirement for any network bandwidth',
          'Converts interpreted code into machine bytecode automatically',
          'Removes all database storage constraints',
        ],
        correctAnswer: 'Prevents accidental side-effects and enables predictable time-travel debugging and concurrency',
        explanation: 'Immutability ensures that data cannot be altered unexpectedly by concurrent threads or distant functions, dramatically reducing subtle race conditions.',
        hint: 'Consider what happens when multiple parts of an application share access to the same object.',
      },
      {
        id: `q_${Date.now()}_2`,
        question: `When scaling ${topic || 'Systems'}, horizontal scaling (adding nodes) is typically preferred over vertical scaling (larger machines) for fault tolerance.`,
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'Horizontal scaling provides high availability because if one node crashes, other nodes in the cluster continue serving traffic seamlessly.',
      },
      {
        id: `q_${Date.now()}_3`,
        question: `Which asymptotic time complexity represents logarithmic growth, such as searching a balanced binary search tree?`,
        type: 'multiple_choice',
        options: ['O(N²)', 'O(log N)', 'O(N!)', 'O(2^N)'],
        correctAnswer: 'O(log N)',
        explanation: 'O(log N) indicates that the problem space is halved at each step, characteristic of binary search and balanced tree lookups.',
      },
      {
        id: `q_${Date.now()}_4`,
        question: `What term describes an operation that produces the exact same result whether executed once or multiple times consecutively?`,
        type: 'short_answer',
        correctAnswer: 'Idempotent',
        explanation: 'An idempotent operation (e.g. HTTP PUT/DELETE or deduplicated payment webhooks) guarantees that retries will not duplicate side effects.',
        hint: 'Starts with "Idem...".',
      },
    ];

    return NextResponse.json({ questions });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
