import {
  ChatSession,
  ChatMessage,
  TaskItem,
  QuizSet,
  ExamSet,
  CodeProject,
  CareerRoadmap,
  TechNewsArticle,
  GlobeEvent,
  Badge,
  UserStats,
} from './types';

export const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat_1',
    title: 'Welcome to Orbit Mentor AI 🚀',
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    messageCount: 2,
    lastMessageSnippet: 'Welcome! I am Astra, your AI mentor. Explore Code Lab, Voice Mentors, and Quizzes...',
  },
  {
    id: 'chat_2',
    title: 'Full-Stack Performance & Concurrency',
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    messageCount: 4,
    lastMessageSnippet: 'Asynchronous event queues and non-blocking I/O prevent thread contention under high load.',
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  chat_1: [
    {
      id: 'm1_1',
      chatId: 'chat_1',
      role: 'user',
      content: 'Hi Astra, how can you mentor me today and what tools are available here?',
      mentorVoice: 'astra',
      explanationLevel: 'intermediate',
      mentorStyle: 'focused_coach',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'm1_2',
      chatId: 'chat_1',
      role: 'assistant',
      mentorVoice: 'astra',
      explanationLevel: 'intermediate',
      mentorStyle: 'focused_coach',
      content: `### Welcome to Orbit Mentor AI! 🌟

Hello! I am **Astra**, your AI technical mentor. Whether you're debugging tricky algorithms, preparing for high-stakes system design interviews, or mastering modern full-stack development, I am here to guide you with structured, empathetic mentorship.

#### 🚀 What We Can Do Together:
1. **Interactive Coding & Live Remote Sandbox**:
   - Write and run **Python, JavaScript, C++, SQL, and HTML/CSS** in our isolated **Code Lab**.
   - Get up to **3 progressive hints** before revealing complete solutions.
2. **Human-Like Neural Voices**:
   - Listen to explanations with my natural warm voice or switch to **Orion** for direct software architecture insights.
   - Adjust volume, speed, replay, and seek through audio seamlessly.
3. **Daily Productivity & Focus**:
   - Manage your learning sprints with our **Pomodoro Focus Timer** and task tracker.
   - Test your retention with our **Adaptive AI Quiz & Exam Generator**.

| Feature | Capabilities | Best For |
| :--- | :--- | :--- |
| **Code Lab** | Python, C++, JS, SQL, HTML/CSS | Algorithmic practice & remote sandboxing |
| **Voice Mentors** | Natural Neural TTS & Voice Notes | Hands-free audio learning |
| **Career Roadmap** | Phased engineering milestones | Junior to Staff Engineer growth |
| **Quiz & Exams** | Adaptive recall & timed exams | Certification & interview prep |

\`\`\`python
# Quick test in Python: Try running this in Code Lab!
def fibonacci_sequence(n: int) -> list:
    """Generate n terms of the Fibonacci sequence."""
    if n <= 0:
        return []
    if n == 1:
        return [0]
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq

print("First 8 Fibonacci numbers:", fibonacci_sequence(8))
\`\`\`

What would you like to explore first? Type any programming question, attach a diagram, or record a voice note!`,
      searchSources: [
        {
          title: 'Orbit Mentor AI Documentation & Reference Guide',
          url: 'https://developer.mozilla.org/',
          snippet: 'Official architecture specifications, guides, and learning resources.',
          domain: 'developer.mozilla.org',
          date: '2026-09-20',
        },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
  ],
  chat_2: [
    {
      id: 'm2_1',
      chatId: 'chat_2',
      role: 'user',
      content: 'How do JavaScript event loops handle microtasks vs macrotasks?',
      mentorVoice: 'orion',
      explanationLevel: 'expert',
      mentorStyle: 'expert_debugger',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'm2_2',
      chatId: 'chat_2',
      role: 'assistant',
      mentorVoice: 'orion',
      explanationLevel: 'expert',
      mentorStyle: 'expert_debugger',
      content: `### Orion's Architectural Event Loop Breakdown ⚡

Let's dissect the V8 execution pipeline from the engine boundary.

#### 1. Core Mechanics
The JavaScript runtime operates on a single execution thread with a Call Stack and two primary queue structures:
* **Microtask Queue**: Processed immediately after the current call stack clears, before rendering and before the next macrotask. Promises (\`.then()\`, \`async/await\`) and \`queueMicrotask()\` live here.
* **Macrotask Queue (Task Queue)**: Contains \`setTimeout\`, \`setInterval\`, and I/O callbacks. Only **one** macrotask is dequeued per event loop tick.

\`\`\`javascript
// Event Loop Order Demonstration
console.log('1: Synchronous script start');

setTimeout(() => {
    console.log('4: Macrotask (setTimeout)');
}, 0);

Promise.resolve().then(() => {
    console.log('2: Microtask 1');
}).then(() => {
    console.log('3: Microtask 2 (chained)');
});

console.log('1.5: Synchronous script end');
// Output: 1 -> 1.5 -> 2 -> 3 -> 4
\`\`\`

#### 2. Orion's Production Takeaway:
* Infinite microtask chains (e.g. recursive \`queueMicrotask\`) will completely starve the event loop, freezing DOM updates and macrotasks.
* For heavy compute, offload tasks to Web Workers or background threads.`,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
};

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't_1',
    title: 'Implement Async Worker Pool in Go & Python',
    description: 'Build a bounded thread/goroutine worker pool with job channel and graceful shutdown.',
    category: 'Coding',
    priority: 'high',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString().slice(0, 10),
    isRecurring: false,
    estimatedMinutes: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 't_2',
    title: 'Complete System Design Mock: Distributed Cache (Redis-like)',
    description: 'Review LRU cache eviction, write-through vs write-back, and consistent hashing topology.',
    category: 'Study',
    priority: 'urgent',
    status: 'todo',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    isRecurring: true,
    recurrencePattern: 'weekly',
    estimatedMinutes: 60,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 't_3',
    title: 'Solve Daily LeetCode: Trie-based Autocomplete',
    description: 'Construct Prefix Tree with frequency ranking and wildcard search query support.',
    category: 'Coding',
    priority: 'medium',
    status: 'completed',
    dueDate: new Date().toISOString().slice(0, 10),
    isRecurring: true,
    recurrencePattern: 'daily',
    estimatedMinutes: 30,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 't_4',
    title: 'Review System Metrics & Docker Compose Networking',
    description: 'Inspect bridge networks, MTU settings, and container DNS resolution rules.',
    category: 'Project',
    priority: 'low',
    status: 'todo',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString().slice(0, 10),
    isRecurring: false,
    estimatedMinutes: 25,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

export const INITIAL_QUIZZES: QuizSet[] = [
  {
    id: 'q_ts',
    title: 'TypeScript Advanced Type Gymnastics',
    topic: 'TypeScript & Type Systems',
    difficulty: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'What does the TypeScript "infer" keyword accomplish inside conditional types?',
        type: 'multiple_choice',
        options: [
          'It casts any unknown value to a string at runtime',
          'It introduces a type variable within a conditional type branch to deduce a type',
          'It forces the TypeScript compiler to skip type checking',
          'It converts a Promise type into an async generator',
        ],
        correctAnswer: 'It introduces a type variable within a conditional type branch to deduce a type',
        explanation: 'The `infer` keyword allows extracting and deducing a subtype dynamically, such as `type Unpack<T> = T extends Promise<infer U> ? U : T`.',
        hint: 'Think about unpacking the resolved type of a Promise or the return type of a function.',
      },
      {
        id: 'q2',
        question: 'In TypeScript, "never" is the bottom type, meaning no value can ever be assigned to it.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: '`never` represents the type of values that never occur. It is the bottom type in TypeScript type theory.',
      },
      {
        id: 'q3',
        question: 'Which utility type constructs a type consisting of all properties of T set to optional?',
        type: 'multiple_choice',
        options: ['Record<T, any>', 'Partial<T>', 'Required<T>', 'Readonly<T>'],
        correctAnswer: 'Partial<T>',
        explanation: '`Partial<T>` marks all properties in `T` as optional (`?`).',
      },
      {
        id: 'q4',
        question: 'Write or identify the output of keyof { id: number; name: string }:',
        type: 'short_answer',
        correctAnswer: '"id" | "name"',
        explanation: 'The `keyof` operator extracts a union of literal string/number keys belonging to the interface.',
        hint: 'It produces a union of string literals corresponding to the property names.',
      },
    ],
  },
  {
    id: 'q_python',
    title: 'Python Concurrency, Asyncio & GIL',
    topic: 'Python Systems & Concurrency',
    difficulty: 'hard',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    questions: [
      {
        id: 'qp1',
        question: 'Why does Python threading not speed up CPU-bound tasks in CPython?',
        type: 'multiple_choice',
        options: [
          'CPython compiles to bytecode on a single CPU core only',
          'The Global Interpreter Lock (GIL) prevents multiple native threads from executing Python bytecode simultaneously',
          'Asyncio cancels native POSIX threads',
          'Operating system kernel threads are not supported in Linux',
        ],
        correctAnswer: 'The Global Interpreter Lock (GIL) prevents multiple native threads from executing Python bytecode simultaneously',
        explanation: 'The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing CPython bytecode concurrently.',
        hint: 'Think about thread safety around CPython memory reference counting.',
      },
      {
        id: 'qp2',
        question: 'Which module in the Python standard library allows true multi-core parallel CPU execution?',
        type: 'multiple_choice',
        options: ['asyncio', 'threading', 'multiprocessing', 'concurrent.futures.ThreadExecutor'],
        correctAnswer: 'multiprocessing',
        explanation: '`multiprocessing` spawns distinct Python processes, each with its own memory space and individual GIL.',
      },
    ],
  },
];

export const INITIAL_EXAMS: ExamSet[] = [
  {
    id: 'exam_fullstack',
    title: 'Full Stack & AI Systems Certification Exam',
    topic: 'Full Stack, Systems, AI Architecture & SQL',
    difficulty: 'medium',
    timeLimitMinutes: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    questions: [
      {
        id: 'ex_1',
        question: 'In Database Indexing, which index structure is most efficient for range queries (e.g. WHERE age BETWEEN 20 AND 30)?',
        type: 'multiple_choice',
        options: ['Hash Index', 'B-Tree Index', 'Bloom Filter', 'Inverted Index'],
        correctAnswer: 'B-Tree Index',
        explanation: 'B-Trees maintain sorted order across balanced leaf node pages linked sequentially, making range scans O(log N + K).',
        hint: 'Hash indices only offer O(1) equality lookups and cannot do ranges.',
      },
      {
        id: 'ex_2',
        question: 'What is the purpose of Vector Embeddings in Large Language Model (LLM) RAG pipelines?',
        type: 'multiple_choice',
        options: [
          'To compress video files into MP4 format',
          'To convert semantic text into dense mathematical coordinates where cosine similarity represents semantic closeness',
          'To encrypt private user passwords in PostgreSQL',
          'To run garbage collection on GPU VRAM',
        ],
        correctAnswer: 'To convert semantic text into dense mathematical coordinates where cosine similarity represents semantic closeness',
        explanation: 'Vector embeddings map words and documents into a multi-dimensional latent space to enable semantic similarity search.',
        hint: 'Vectors represent semantic meaning in mathematical vector space.',
      },
      {
        id: 'ex_3',
        question: 'HTTP/2 multiplexing allows sending multiple request and response messages concurrently over a single TCP connection.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: 'HTTP/2 uses binary framing layers to interleave concurrent streams over one underlying TCP socket.',
      },
      {
        id: 'ex_4',
        question: 'What React hook or primitive should be used to avoid unnecessary expensive recalculations of a pure derived value between renders?',
        type: 'short_answer',
        correctAnswer: 'useMemo',
        explanation: '`useMemo` caches the calculated result between renders until one of its declared dependencies changes.',
        hint: 'Starts with "use" and ends with "Memo".',
      },
      {
        id: 'ex_5',
        question: 'In SQL, what is the key difference between WHERE and HAVING clauses?',
        type: 'multiple_choice',
        options: [
          'WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY',
          'HAVING only works on primary keys',
          'WHERE cannot be used with SELECT statements',
          'There is no difference; they are interchangeable aliases',
        ],
        correctAnswer: 'WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY',
        explanation: '`WHERE` filters base table records before the `GROUP BY` operation, while `HAVING` filters the resulting aggregate calculations (e.g., `COUNT(*) > 5`).',
      },
    ],
  },
];

export const INITIAL_CODE_PROJECTS: CodeProject[] = [
  {
    id: 'proj_js',
    title: 'Reactive LRU Cache Implementation',
    language: 'javascript',
    code: `// Custom Least Recently Used (LRU) Cache
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    // Refresh position by deleting and re-inserting
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest item (first key in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// Test Run
const lru = new LRUCache(3);
lru.put("user:101", { name: "Alice", role: "Staff AI Engineer" });
lru.put("user:102", { name: "Bob", role: "Systems Architect" });
lru.put("user:103", { name: "Carol", role: "Data Scientist" });

console.log("Cached 102:", lru.get("user:102"));
lru.put("user:104", { name: "Dave", role: "DevOps Lead" }); // Evicts user:101

console.log("Cached 101 (Evicted):", lru.get("user:101")); // Returns -1
console.log("Current Keys:", Array.from(lru.cache.keys()));
`,
    lastRunOutput: `Cached 102: { name: 'Bob', role: 'Systems Architect' }
Cached 101 (Evicted): -1
Current Keys: [ 'user:103', 'user:102', 'user:104' ]`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_py',
    title: 'Vector Cosine Similarity & Semantic Matcher',
    language: 'python',
    code: `# Vector Cosine Similarity Search in Pure Python
import math

def dot_product(v1, v2):
    return sum(a * b for a, b in zip(v1, v2))

def magnitude(v):
    return math.sqrt(sum(a * a for a in v))

def cosine_similarity(v1, v2):
    mag1 = magnitude(v1)
    mag2 = magnitude(v2)
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product(v1, v2) / (mag1 * mag2)

# Simulated embeddings (4-dimensional feature vector: [tech, finance, health, sports])
documents = {
    "PyTorch Deep Learning Guide": [0.95, 0.12, 0.05, 0.02],
    "Global Stock Index Analysis": [0.15, 0.92, 0.20, 0.05],
    "Cardiovascular Health Study": [0.08, 0.10, 0.94, 0.18],
    "Neural Network Architecture Paper": [0.98, 0.05, 0.04, 0.01]
}

query_vector = [0.92, 0.08, 0.06, 0.01] # Query: "artificial intelligence model training"

print("--- Query Semantic Matches ---")
results = []
for title, emb in documents.items():
    sim = cosine_similarity(query_vector, emb)
    results.append((title, sim))

results.sort(key=lambda x: x[1], reverse=True)
for title, score in results:
    print(f"[{score * 100:.1f}% match] -> {title}")
`,
    lastRunOutput: `--- Query Semantic Matches ---
[99.9% match] -> Neural Network Architecture Paper
[99.6% match] -> PyTorch Deep Learning Guide
[22.8% match] -> Global Stock Index Analysis
[14.9% match] -> Cardiovascular Health Study`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_sql',
    title: 'High-Volume E-Commerce Analytics Query',
    language: 'sql',
    code: `-- Analytical SQL: Top Performing Course Categories & Mentors
SELECT 
    m.name AS mentor_name,
    c.category,
    COUNT(e.id) AS total_enrollments,
    ROUND(AVG(e.rating), 2) AS average_rating,
    SUM(c.price) AS total_revenue
FROM mentors m
JOIN courses c ON m.id = c.mentor_id
JOIN enrollments e ON c.id = e.course_id
GROUP BY m.id, c.category
HAVING COUNT(e.id) >= 1
ORDER BY total_revenue DESC;
`,
    lastRunOutput: `Executed successfully. (3 rows returned)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_html',
    title: 'Futuristic Cyberpunk Glow Card',
    language: 'html',
    code: `<div class="cyber-container">
  <div class="cyber-card">
    <div class="glow-orb"></div>
    <div class="card-content">
      <span class="badge">ORBIT SYSTEM v2.4</span>
      <h2>Autonomous AI Core</h2>
      <p>Synchronizing neural layers with distributed real-time telemetry.</p>
      <div class="stats-row">
        <div><span class="num">99.8%</span><span class="lbl">ACCURACY</span></div>
        <div><span class="num">12ms</span><span class="lbl">LATENCY</span></div>
      </div>
      <button class="action-btn">INITIALIZE</button>
    </div>
  </div>
</div>`,
    cssCode: `body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #090d16;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #fff;
}
.cyber-card {
  position: relative;
  width: 320px;
  background: rgba(18, 24, 38, 0.7);
  border: 1px solid rgba(0, 242, 254, 0.3);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.15);
  overflow: hidden;
}
.glow-orb {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #00f2fe, transparent 70%);
  opacity: 0.5;
}
.badge {
  font-size: 10px;
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 700;
  letter-spacing: 1px;
}
h2 {
  margin: 14px 0 8px 0;
  font-size: 20px;
  color: #f1f5f9;
}
p {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}
.stats-row {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}
.num {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #00f2fe;
}
.lbl {
  font-size: 9px;
  color: #64748b;
  letter-spacing: 0.5px;
}
.action-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  color: #090d16;
  letter-spacing: 1px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 242, 254, 0.4);
}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_ROADMAPS: CareerRoadmap[] = [
  {
    id: 'rd_ai',
    careerRole: 'Senior AI & LLM Systems Engineer',
    targetDate: '2026-12-31',
    progressPercent: 62,
    updatedAt: new Date().toISOString(),
    phases: [
      {
        id: 'p1',
        name: 'Phase 1: Deep Learning Foundations & Transformers',
        description: 'Master PyTorch, backpropagation mechanics, attention layers, and tokenization algorithms.',
        milestones: [
          {
            id: 'm1_1',
            title: 'Implement Multi-Head Self-Attention from scratch in PyTorch',
            description: 'Derive Query, Key, Value tensor projections, scaled dot-product, and causal masking.',
            completed: true,
            resources: [
              { name: 'Attention Is All You Need (Vaswani et al.)', url: 'https://arxiv.org/abs/1706.03762', type: 'doc' },
              { name: 'Andrej Karpathy: Neural Networks Zero to Hero', url: 'https://karpathy.ai/zero-to-hero.html', type: 'video' },
            ],
            interviewQuestions: [
              'Why do we divide by sqrt(d_k) in scaled dot-product attention?',
              'What is the computational complexity of standard self-attention relative to sequence length?',
            ],
          },
          {
            id: 'm1_2',
            title: 'Understand Positional Encodings: Sinusoidal vs RoPE',
            description: 'Analyze Rotary Position Embeddings (RoPE) used in modern LLMs like Llama and Mistral.',
            completed: true,
            resources: [
              { name: 'RoFormer: Enhanced Transformer with Rotary Position Embedding', url: 'https://arxiv.org/abs/2104.09864', type: 'doc' },
            ],
            interviewQuestions: [
              'What are the advantages of RoPE over absolute sinusoidal positional embeddings for context length extrapolation?',
            ],
          },
        ],
      },
      {
        id: 'p2',
        name: 'Phase 2: Modern LLM Fine-Tuning & Quantization',
        description: 'Parameter-Efficient Fine-Tuning (PEFT, LoRA, QLoRA) and low-bit weight quantization.',
        milestones: [
          {
            id: 'm2_1',
            title: 'Fine-tune an Open-Source LLM with LoRA & Unsloth',
            description: 'Apply low-rank decomposition matrices to attention projection layers with gradient checkpointing.',
            completed: true,
            resources: [
              { name: 'LoRA: Low-Rank Adaptation of Large Language Models', url: 'https://arxiv.org/abs/2106.09685', type: 'doc' },
            ],
            interviewQuestions: [
              'How does LoRA dramatically reduce VRAM requirements during model training?',
            ],
          },
          {
            id: 'm2_2',
            title: 'Quantization Techniques: AWQ, GPTQ, and GGUF',
            description: 'Explore 4-bit and 8-bit weight-only and activation quantization pipelines.',
            completed: false,
            resources: [
              { name: 'Hugging Face Quantization Guide', url: 'https://huggingface.co/docs/transformers/main/en/quantization', type: 'doc' },
            ],
            interviewQuestions: [
              'What is the difference between post-training quantization (PTQ) and quantization-aware training (QAT)?',
            ],
          },
        ],
      },
      {
        id: 'p3',
        name: 'Phase 3: High-Throughput Serving & RAG Architecture',
        description: 'Production inference engines (vLLM, TensorRT-LLM) and advanced retrieval augmentation.',
        milestones: [
          {
            id: 'm3_1',
            title: 'Deploy Production Inference with vLLM & PagedAttention',
            description: 'Benchmark continuous batching and virtual memory allocation for KV caches.',
            completed: false,
            resources: [
              { name: 'vLLM Architecture Paper (PagedAttention)', url: 'https://arxiv.org/abs/2309.06180', type: 'doc' },
            ],
            interviewQuestions: [
              'How does PagedAttention eliminate memory fragmentation in multi-user concurrent LLM serving?',
            ],
          },
          {
            id: 'm3_2',
            title: 'Build Hybrid RAG with Vector Search & Cross-Encoder Reranking',
            description: 'Integrate dense vector retrieval (pgvector/Pinecone) with BM25 keyword matching and Cohere reranker.',
            completed: false,
            resources: [
              { name: 'Pinecone RAG Architecture Handbook', url: 'https://www.pinecone.io/learn/retrieval-augmented-generation/', type: 'doc' },
            ],
            interviewQuestions: [
              'How do you prevent hallucinations in high-stakes domain RAG systems?',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'rd_fs',
    careerRole: 'Principal Full Stack Architect',
    targetDate: '2026-10-15',
    progressPercent: 78,
    updatedAt: new Date().toISOString(),
    phases: [
      {
        id: 'pfs_1',
        name: 'Phase 1: Scalable Frontend Systems & Performance',
        description: 'Master React Server Components, Streaming SSR, Micro-frontends, and Core Web Vitals.',
        milestones: [
          {
            id: 'mfs1_1',
            title: 'Architect Next.js App Router with Selective Hydration',
            description: 'Implement Suspense boundaries, streaming SSR, and server action mutations.',
            completed: true,
            resources: [{ name: 'Next.js Official Docs', url: 'https://nextjs.org/docs', type: 'doc' }],
            interviewQuestions: ['How does React 18 selective hydration improve Time to Interactive (TTI)?'],
          },
        ],
      },
    ],
  },
];

export const INITIAL_TECH_NEWS: TechNewsArticle[] = [
  {
    id: 'news_1',
    title: 'DeepSeek-V3 and Next-Gen Open Weight Mixture-of-Experts Architecture',
    summary: 'A comprehensive technical deep dive into auxiliary-loss-free load balancing and multi-token prediction heads achieving state-of-the-art efficiency in open AI.',
    source: 'ArXiv AI Research',
    url: 'https://arxiv.org/abs/2412.19437',
    category: 'AI',
    publishedAt: '2026-09-27',
    readTime: '4 min read',
    bookmarked: true,
  },
  {
    id: 'news_2',
    title: 'Rust 1.84 Released with Const Evaluation & Native Parallel Compilation',
    summary: 'The new Rust toolchain release improves incremental build speeds by 34% and stabilizes async closures for zero-cost distributed services.',
    source: 'Rust Official Blog',
    url: 'https://blog.rust-lang.org/',
    category: 'Software',
    publishedAt: '2026-09-26',
    readTime: '3 min read',
    bookmarked: false,
  },
  {
    id: 'news_3',
    title: 'Next-Generation Quantum Processor Demonstrates 10,000 Logical Qubits',
    summary: 'Breakthrough quantum error correction using surface codes enables fault-tolerant quantum algorithms for molecular drug discovery.',
    source: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/',
    category: 'Science',
    publishedAt: '2026-09-25',
    readTime: '5 min read',
    bookmarked: false,
  },
  {
    id: 'news_4',
    title: 'Zero-Day Flaw in Cloud Hypervisor Architecture Patched Globally',
    summary: 'Security researchers uncover boundary escalation vulnerabilities in shared memory hypervisors; major cloud providers issue live kernel hotpatches.',
    source: 'Wired Security',
    url: 'https://www.wired.com/category/security/',
    category: 'Cybersecurity',
    publishedAt: '2026-09-24',
    readTime: '4 min read',
    bookmarked: false,
  },
  {
    id: 'news_5',
    title: 'Anthropic Unveils Breakthrough Computer-Use Agents for Developer Workflows',
    summary: 'New autonomous developer sidecars can execute terminal commands, test web applications, and debug multi-file repositories with strict sandbox guarantees.',
    source: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/',
    category: 'AI',
    publishedAt: '2026-09-23',
    readTime: '3 min read',
    bookmarked: true,
  },
  {
    id: 'news_6',
    title: 'PostgreSQL 18 Advances Distributed Query Sharding & Native Vector Indexing',
    summary: 'Native disk-backed HNSW indexing in core PostgreSQL eliminates the need for standalone vector database clusters for millions of embeddings.',
    source: 'PostgreSQL News',
    url: 'https://www.postgresql.org/',
    category: 'Open Source',
    publishedAt: '2026-09-22',
    readTime: '4 min read',
    bookmarked: false,
  },
];

export const INITIAL_GLOBE_EVENTS: GlobeEvent[] = [
  {
    id: 'g_sf',
    title: 'Silicon Valley Frontier AI Summit',
    city: 'San Francisco',
    country: 'USA',
    lat: 37.7749,
    lng: -122.4194,
    date: 'Sep 2026',
    summary: 'Global engineers gather to announce multimodal reasoning agents, neuromorphic hardware chips, and AI safety protocols.',
    source: 'TechCrunch Global',
    url: 'https://techcrunch.com',
    category: 'AI Breakthrough',
  },
  {
    id: 'g_tokyo',
    title: 'Autonomous Robotics & Humanoid Innovation Lab',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    date: 'Sep 2026',
    summary: 'Unveiling zero-latency tactile feedback manipulators and real-time vision-language-action (VLA) navigation models.',
    source: 'Nikkei Asian Review',
    url: 'https://asia.nikkei.com',
    category: 'Space/Robotics',
  },
  {
    id: 'g_bengaluru',
    title: 'Global Developer Tech Conclave & SaaS Scale',
    city: 'Bengaluru',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    date: 'Sep 2026',
    summary: 'Over 40,000 developers meet to build open-source distributed cloud systems, digital public infrastructure, and edge AI.',
    source: 'The Economic Times Tech',
    url: 'https://economictimes.indiatimes.com/tech',
    category: 'Tech Summit',
  },
  {
    id: 'g_zurich',
    title: 'ETH Quantum Information & Cryptography Hub',
    city: 'Zurich',
    country: 'Switzerland',
    lat: 47.3769,
    lng: 8.5417,
    date: 'Sep 2026',
    summary: 'Researchers demonstrate lattice-based post-quantum cryptography resistance against 5,000-qubit Shor factorization simulations.',
    source: 'ETH Zurich Research',
    url: 'https://ethz.ch',
    category: 'Quantum Lab',
  },
  {
    id: 'g_london',
    title: 'European AI Safety & Frontier Models Institute',
    city: 'London',
    country: 'UK',
    lat: 51.5074,
    lng: -0.1278,
    date: 'Sep 2026',
    summary: 'Establishing international benchmark suites for auditing autonomous agent cyber capabilities and critical infrastructure safeguards.',
    source: 'Financial Times Tech',
    url: 'https://ft.com/technology',
    category: 'AI Breakthrough',
  },
  {
    id: 'g_singapore',
    title: 'Asia-Pacific FinTech & Decentralized Systems Summit',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    date: 'Sep 2026',
    summary: 'Central bank digital currency interoperability and zero-knowledge proof privacy standards adopted for cross-border settlements.',
    source: 'Straits Times Tech',
    url: 'https://straitstimes.com/tech',
    category: 'Tech Summit',
  },
  {
    id: 'g_toronto',
    title: 'Vector Institute Neural Representation Conference',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    date: 'Sep 2026',
    summary: 'Pioneers in deep learning present energy-efficient spiking neural networks for low-power edge wearables.',
    source: 'Vector Institute',
    url: 'https://vectorinstitute.ai',
    category: 'AI Breakthrough',
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    title: 'Focus Pioneer',
    description: 'Logged over 500 minutes in deep Pomodoro focus',
    icon: '⚡',
    unlockedAt: '2026-09-20',
    progress: 100,
  },
  {
    id: 'b2',
    title: 'Code Alchemist',
    description: 'Executed 50+ sandboxed scripts across 3 languages',
    icon: '🧪',
    unlockedAt: '2026-09-24',
    progress: 100,
  },
  {
    id: 'b3',
    title: 'Quiz Grandmaster',
    description: 'Maintained 90%+ accuracy on 10 consecutive quizzes',
    icon: '👑',
    unlockedAt: '2026-09-26',
    progress: 100,
  },
  {
    id: 'b4',
    title: 'Roadmap Conqueror',
    description: 'Complete all milestones in a Career Phase',
    icon: '🗺️',
    progress: 75,
  },
  {
    id: 'b5',
    title: 'Polyglot Hacker',
    description: 'Execute JavaScript, Python, C++, and SQL projects',
    icon: '🚀',
    progress: 60,
  },
  {
    id: 'b6',
    title: '7-Day Streak',
    description: 'Active learning every consecutive day for a week',
    icon: '🔥',
    unlockedAt: '2026-09-27',
    progress: 100,
  },
];

// Activity heatmap for the past 6 months
const generateHeatmap = () => {
  const data: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 120; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // Pseudo random activity weighted by weekend/weekday
    const dayOfWeek = d.getDay();
    const count = dayOfWeek === 0 || dayOfWeek === 6 
      ? Math.floor(Math.random() * 4) + 1 
      : Math.floor(Math.random() * 8) + 2;
    data.push({ date: dateStr, count });
  }
  return data;
};

export const INITIAL_USER_STATS: UserStats = {
  totalStudyMinutes: 1420,
  focusMinutesToday: 65,
  streakDays: 8,
  completedTasksCount: 38,
  quizzesTakenCount: 16,
  averageQuizScore: 92.4,
  codeRunsCount: 74,
  strongestTopic: 'Distributed Systems & TypeScript',
  areaToImprove: 'SQL Window Functions & Index Tuning',
  weeklyActivity: [
    { day: 'Mon', minutes: 75 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 110 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 85 },
    { day: 'Sat', minutes: 130 },
    { day: 'Sun', minutes: 95 },
  ],
  heatMapData: generateHeatmap(),
};
