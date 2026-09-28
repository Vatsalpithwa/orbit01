export type MentorVoice = 'astra' | 'orion';
export type ExplanationLevel = 'beginner' | 'intermediate' | 'expert';
export type MentorStyle = 'focused_coach' | 'friendly_partner' | 'expert_debugger';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  preferredMentor: MentorVoice;
  mentorStyle?: MentorStyle;
  careerGoal: string;
  skillLevel: ExplanationLevel;
  dailyFocusTargetMinutes: number;
  studyPreferences: {
    dailyReminder: boolean;
    audioChimes: boolean;
    darkTheme: boolean;
    preferredLanguage?: string;
  };
  createdAt?: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  date?: string;
  domain?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mentorVoice?: MentorVoice;
  explanationLevel?: ExplanationLevel;
  mentorStyle?: MentorStyle;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  searchSources?: SearchSource[];
  isError?: boolean;
  retryPrompt?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessageSnippet?: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'Coding' | 'Study' | 'Career' | 'Project' | 'Personal';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly';
  estimatedMinutes: number;
  createdAt: string;
  completedAt?: string;
}

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface FocusSession {
  id: string;
  durationSeconds: number;
  mode: TimerMode;
  completed: boolean;
  taskId?: string;
  createdAt: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'coding';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  codeSnippet?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  timeTakenSeconds: number;
  userAnswers: Record<string, string>;
  createdAt: string;
}

export interface ExamSet {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTakenSeconds: number;
  detailedResults: Record<string, {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  revisionRecommendations: string[];
  createdAt: string;
}

export type CodeLanguage = 'javascript' | 'python' | 'cpp' | 'html' | 'css' | 'sql';

export interface CodeProject {
  id: string;
  title: string;
  language: CodeLanguage;
  code: string;
  cssCode?: string;
  stdin?: string;
  lastRunOutput?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeRunResult {
  output: string;
  error?: string;
  compilerError?: string;
  stderr?: string;
  executionTimeMs: number;
  memoryKb?: number;
  exitStatus?: string;
  sqlTable?: { columns: string[]; rows: any[][] };
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  resources: { name: string; url: string; type: 'doc' | 'video' | 'practice' }[];
  interviewQuestions: string[];
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  milestones: RoadmapMilestone[];
}

export interface CareerRoadmap {
  id: string;
  careerRole: string;
  targetDate?: string;
  progressPercent: number;
  phases: RoadmapPhase[];
  updatedAt: string;
}

export interface TechNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: 'AI' | 'Software' | 'Startups' | 'Cybersecurity' | 'Science' | 'Open Source';
  publishedAt: string;
  readTime: string;
  bookmarked?: boolean;
}

export interface GlobeEvent {
  id: string;
  title: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  summary: string;
  source: string;
  url: string;
  category: 'AI Breakthrough' | 'Tech Summit' | 'Quantum Lab' | 'Space/Robotics' | 'Open Source Hub';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface UserStats {
  totalStudyMinutes: number;
  focusMinutesToday: number;
  streakDays: number;
  completedTasksCount: number;
  quizzesTakenCount: number;
  averageQuizScore: number;
  codeRunsCount: number;
  strongestTopic: string;
  areaToImprove: string;
  weeklyActivity: { day: string; minutes: number }[];
  heatMapData: { date: string; count: number }[];
}
