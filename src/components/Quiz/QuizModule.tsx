'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Check,
} from 'lucide-react';
import { QuizSet, QuizQuestion, QuizAttempt } from '@/lib/types';
import { INITIAL_QUIZZES } from '@/lib/sampleData';
import { aiService } from '@/lib/aiService';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

export default function QuizModule() {
  const { showToast } = useToast();

  // Generator form state
  const [topic, setTopic] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(INITIAL_QUIZZES[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [quizTimeTaken, setQuizTimeTaken] = useState<number>(0);

  // Quiz history
  const [attempts, setAttempts] = useState<QuizAttempt[]>([
    {
      id: 'att_1',
      quizId: 'q_ts',
      quizTitle: 'TypeScript Advanced Type Gymnastics',
      topic: 'TypeScript & Type Systems',
      difficulty: 'medium',
      score: 4,
      totalQuestions: 4,
      accuracyPercent: 100,
      timeTakenSeconds: 78,
      userAnswers: {},
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ]);

  // Handle Generate Quiz
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = topic.trim() || 'Software Architecture & System Design';
    setIsGenerating(true);
    showToast(`Generating custom ${difficulty} quiz on "${finalTopic}"...`, 'info');

    try {
      const generatedQuestions = await aiService.generateQuiz(finalTopic, difficulty);
      const newQuiz: QuizSet = {
        id: `quiz_${Date.now()}`,
        title: `${finalTopic} Mastery Challenge`,
        topic: finalTopic,
        difficulty,
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
      };

      setActiveQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setRevealedHints({});
      setIsSubmitted(false);
      setQuizStartTime(Date.now());
      showToast('New AI Quiz generated! Good luck.', 'success');
    } catch (e: any) {
      showToast('Failed to generate quiz. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Answer selection
  const handleSelectOption = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const timeSpent = Math.max(Math.floor((Date.now() - quizStartTime) / 1000), 10);
    setQuizTimeTaken(timeSpent);

    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      const ans = (userAnswers[q.id] || '').trim().toLowerCase();
      const correct = q.correctAnswer.trim().toLowerCase();
      if (ans === correct || (ans && correct.includes(ans))) {
        correctCount++;
      }
    });

    const accuracy = Math.round((correctCount / activeQuiz.questions.length) * 100);
    setIsSubmitted(true);

    if (accuracy >= 75) {
      soundManager.playAchievementChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`Outstanding! Score: ${correctCount}/${activeQuiz.questions.length} (${accuracy}%)`, 'success');
    } else {
      showToast(`Quiz completed: ${correctCount}/${activeQuiz.questions.length}. Check explanations below to revise!`, 'info');
    }

    const newAttempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quizId: activeQuiz.id,
      quizTitle: activeQuiz.title,
      topic: activeQuiz.topic,
      difficulty: activeQuiz.difficulty,
      score: correctCount,
      totalQuestions: activeQuiz.questions.length,
      accuracyPercent: accuracy,
      timeTakenSeconds: timeSpent,
      userAnswers,
      createdAt: new Date().toISOString(),
    };
    setAttempts([newAttempt, ...attempts]);
  };

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];
  const allAnswered = activeQuiz?.questions.every((q) => !!userAnswers[q.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Quick Topics */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>AI Adaptive Quiz Generator</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Generate multiple-choice, true/false, short answer, and coding quizzes from any topic or your study notes.
          </p>
        </div>

        {/* Quick topic chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['TypeScript Generics', 'Python GIL', 'System Design', 'SQL Indexing', 'Kafka Streaming'].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              style={{
                fontSize: '12px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Generator Input Card */}
      <form onSubmit={handleGenerate} className="glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Quiz Topic or Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Consensus & Raft, Docker Networking, PyTorch"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Difficulty Level
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: difficulty === d ? 700 : 500,
                    textTransform: 'capitalize',
                    background: difficulty === d ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: difficulty === d ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: difficulty === d ? '#00f2fe' : '#94a3b8',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Paste Custom Notes or Chat Context (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Paste your lecture notes, article summary, or snippet to generate targeted questions..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            style={{ width: '100%', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button
            type="submit"
            disabled={isGenerating}
            className="gradient-btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            <Sparkles size={16} />
            <span>{isGenerating ? 'Synthesizing Questions...' : 'Generate AI Quiz'}</span>
          </button>
        </div>
      </form>

      {/* Active Quiz Card */}
      {activeQuiz && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
          {/* Active Quiz Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px',
          }}>
            <div>
              <span className="badge-pill badge-cyan" style={{ marginBottom: '6px' }}>
                {activeQuiz.difficulty.toUpperCase()} • {activeQuiz.topic}
              </span>
              <h3 style={{ fontSize: '20px', marginTop: '4px' }}>{activeQuiz.title}</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
            </div>
          </div>

          {!isSubmitted && currentQuestion ? (
            /* Question Runner View */
            <div>
              {/* Question Text */}
              <div style={{
                fontSize: '17px',
                fontWeight: 600,
                color: '#f8fafc',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}>
                {currentQuestion.question}
              </div>

              {/* Multiple Choice & True/False Options */}
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = userAnswers[currentQuestion.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQuestion.id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 18px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#00f2fe' : '#e2e8f0',
                          textAlign: 'left',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: isSelected ? '2px solid #00f2fe' : '2px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span style={{ flex: 1 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Short answer / Coding input */
                <div style={{ marginBottom: '24px' }}>
                  <input
                    type="text"
                    placeholder="Type your exact technical answer here..."
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleSelectOption(currentQuestion.id, e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', fontSize: '15px' }}
                  />
                </div>
              )}

              {/* Progressive Hint Reveal */}
              {currentQuestion.hint && (
                <div style={{ marginBottom: '24px' }}>
                  {revealedHints[currentQuestion.id] ? (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <HelpCircle size={16} />
                      <span><strong>Mentor Hint:</strong> {currentQuestion.hint}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRevealedHints((prev) => ({ ...prev, [currentQuestion.id]: true }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#f59e0b',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <HelpCircle size={15} />
                      <span>Need a hint? (Click to reveal progressive guidance)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Navigation & Submit Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '20px',
              }}>
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="gradient-btn-secondary"
                  style={{ opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
                >
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="gradient-btn-secondary"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      className="gradient-btn-primary"
                    >
                      Submit Quiz & View Solutions
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Post-Submission Solutions & Explanations Screen */
            <div>
              <div style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(121, 40, 202, 0.1))',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h4 style={{ fontSize: '20px', color: '#fff', marginBottom: '4px' }}>
                    Quiz Attempt Analysis Complete!
                  </h4>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                    Completed in {quizTimeTaken} seconds. Review explanations below:
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserAnswers({});
                      setCurrentQuestionIndex(0);
                      setQuizStartTime(Date.now());
                    }}
                    className="gradient-btn-secondary"
                  >
                    <RotateCcw size={15} />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    onClick={() => {
                      setTopic('');
                      setCustomNotes('');
                      setActiveQuiz(null);
                    }}
                    className="gradient-btn-primary"
                  >
                    <BrainCircuit size={15} />
                    <span>Create New Quiz</span>
                  </button>
                </div>
              </div>

              {/* Detailed Question Review List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeQuiz.questions.map((q, idx) => {
                  const userAns = (userAnswers[q.id] || '').trim();
                  const isCorrect = userAns.toLowerCase() === q.correctAnswer.toLowerCase() || (userAns && q.correctAnswer.toLowerCase().includes(userAns.toLowerCase()));

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                        {isCorrect ? <CheckCircle2 size={20} color="#10b981" /> : <XCircle size={20} color="#f43f5e" />}
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', flex: 1 }}>
                          {idx + 1}. {q.question}
                        </div>
                      </div>

                      <div style={{ fontSize: '13px', marginLeft: '30px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Your Answer: </span>
                          <span style={{ color: isCorrect ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                            {userAns || '(No Answer Provided)'}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Correct Solution: </span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{q.correctAnswer}</span>
                        </div>
                        <div style={{
                          marginTop: '8px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#cbd5e1',
                          lineHeight: 1.5,
                        }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz History Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Past Quiz Performance & Improvement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {attempts.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                  {att.quizTitle}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {new Date(att.createdAt).toLocaleDateString()} • {att.topic} ({att.difficulty})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{att.timeTakenSeconds}s duration</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: att.accuracyPercent >= 80 ? '#10b981' : '#f59e0b',
                  background: att.accuracyPercent >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}>
                  {att.score}/{att.totalQuestions} ({att.accuracyPercent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
