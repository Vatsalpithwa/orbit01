'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  RotateCcw,
  AlertTriangle,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { ExamSet, QuizQuestion, ExamAttempt, MentorVoice } from '@/lib/types';
import { INITIAL_EXAMS } from '@/lib/sampleData';
import { aiService } from '@/lib/aiService';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

interface ExamModuleProps {
  preferredMentor: MentorVoice;
}

export default function ExamModule({ preferredMentor }: ExamModuleProps) {
  const { showToast } = useToast();

  const [activeExam, setActiveExam] = useState<ExamSet | null>(INITIAL_EXAMS[0]);
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Countdown timer in seconds
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResults, setExamResults] = useState<ExamAttempt | null>(null);

  // Custom Exam Generator state
  const [customTopic, setCustomTopic] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [customDuration, setCustomDuration] = useState(15);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  // Exam History
  const [pastExams, setPastExams] = useState<ExamAttempt[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (examStarted && !examSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examStarted && !examSubmitted) {
      handleSubmitExam();
    }
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted, timeLeft]);

  // Start exam
  const handleStartExam = () => {
    if (!activeExam) return;
    setExamStarted(true);
    setExamSubmitted(false);
    setTimeLeft(activeExam.timeLimitMinutes * 60);
    setUserAnswers({});
    setFlaggedQuestions({});
    setHintsUsedCount(0);
    setRevealedHints({});
    setCurrentIdx(0);
    showToast(`Exam Started! You have ${activeExam.timeLimitMinutes} minutes.`, 'info');
  };

  // Submit Exam
  const handleSubmitExam = () => {
    if (!activeExam) return;
    setExamSubmitted(true);
    setExamStarted(false);

    let score = 0;
    const detailed: Record<string, any> = {};

    activeExam.questions.forEach((q) => {
      const uAns = (userAnswers[q.id] || '').trim().toLowerCase();
      const cAns = q.correctAnswer.trim().toLowerCase();
      const isCorrect = uAns === cAns || (uAns && cAns.includes(uAns));
      if (isCorrect) score++;

      detailed[q.id] = {
        question: q.question,
        userAnswer: userAnswers[q.id] || 'Not answered',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const percent = Math.round((score / activeExam.questions.length) * 100);
    const timeSpent = activeExam.timeLimitMinutes * 60 - timeLeft;

    const recommendations = [
      'Focus on B-Tree range query index mechanics and composite prefix lookups.',
      'Review vector embedding distance metrics: Cosine Similarity vs Euclidean Distance in RAG pipelines.',
      'Solidify React 18 Suspense streaming and selective hydration boundaries.',
    ];

    const result: ExamAttempt = {
      id: `attempt_${Date.now()}`,
      examId: activeExam.id,
      examTitle: activeExam.title,
      topic: activeExam.topic,
      score,
      totalQuestions: activeExam.questions.length,
      timeTakenSeconds: timeSpent,
      detailedResults: detailed,
      revisionRecommendations: recommendations,
      createdAt: new Date().toISOString(),
    };

    setExamResults(result);
    setPastExams([result, ...pastExams]);

    soundManager.playAchievementChime();
    if (percent >= 70) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      showToast(`Exam Passed! Score: ${score}/${activeExam.questions.length} (${percent}%)`, 'success');
    } else {
      showToast(`Exam submitted. Score: ${score}/${activeExam.questions.length}. Check revision recommendations!`, 'info');
    }
  };

  // Use a hint (up to 3 total allowed)
  const handleUseHint = (qId: string) => {
    if (hintsUsedCount >= 3) {
      showToast('You have used all 3 available hints for this test session.', 'warning');
      return;
    }
    if (revealedHints[qId]) return;

    setRevealedHints((prev) => ({ ...prev, [qId]: true }));
    setHintsUsedCount((prev) => prev + 1);
    showToast(`Hint used! ${2 - hintsUsedCount} hint tokens remaining.`, 'info');
  };

  // Generate Custom Exam
  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingExam(true);
    showToast(`Synthesizing custom exam on "${customTopic || 'Full Stack Systems'}"...`, 'info');

    try {
      const questions = await aiService.generateQuiz(customTopic || 'Full Stack Systems', customDifficulty);
      const newExam: ExamSet = {
        id: `exam_${Date.now()}`,
        title: `${customTopic || 'Systems'} Certification Exam`,
        topic: customTopic || 'Full Stack & AI Systems',
        difficulty: customDifficulty,
        timeLimitMinutes: customDuration,
        questions,
        createdAt: new Date().toISOString(),
      };
      setActiveExam(newExam);
      setExamStarted(false);
      setExamSubmitted(false);
      showToast('Custom Exam ready! Click "Begin Timed Exam" when ready.', 'success');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const currentQ = activeExam?.questions[currentIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px' }}>Timed Technical Certification Exams</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Simulated timed examinations with progressive hints, detailed solutions, and personalized revision plans.
        </p>
      </div>

      {!examStarted && !examSubmitted ? (
        /* Pre-Exam Lobby / Custom Exam Creator */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Daily Personalized Exam Card */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <span className="badge-pill badge-cyan" style={{ marginBottom: '10px' }}>
              DAILY PERSONALIZED RECOMMENDATION
            </span>
            <h3 style={{ fontSize: '22px', marginTop: '6px', marginBottom: '12px' }}>
              {activeExam?.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Synthesized from your recent study on distributed architectures, vector embeddings, and SQL query tuning.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', color: '#cbd5e1', fontSize: '13px' }}>
              <div>⏱️ <strong>{activeExam?.timeLimitMinutes} mins</strong></div>
              <div>❓ <strong>{activeExam?.questions.length} questions</strong></div>
              <div>💡 <strong>3 Hint Tokens</strong></div>
            </div>

            <button
              onClick={handleStartExam}
              className="gradient-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              <GraduationCap size={18} />
              <span>Begin Timed Exam</span>
            </button>
          </div>

          {/* Custom Exam Creator Card */}
          <form onSubmit={handleGenerateCustom} className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Generate Custom Exam</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Target Topic / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kubernetes, React Server Actions, GraphQL"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Difficulty
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard (Staff Level)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                    Duration (Minutes)
                  </label>
                  <select
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingExam}
                className="gradient-btn-secondary"
                style={{ marginTop: '12px', justifyContent: 'center' }}
              >
                <Sparkles size={16} />
                <span>{isGeneratingExam ? 'Generating Exam...' : 'Build Custom Test'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : examStarted && !examSubmitted && currentQ ? (
        /* Live Exam Taking Screen */
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
          {/* Question Navigator Sidebar */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Timer Banner */}
            <div style={{
              background: timeLeft < 120 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 242, 254, 0.1)',
              border: `1px solid ${timeLeft < 120 ? '#f43f5e' : '#00f2fe'}`,
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em' }}>TIME REMAINING</div>
              <div style={{
                fontSize: '28px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: timeLeft < 120 ? '#f43f5e' : '#00f2fe',
              }}>
                {minutes}:{seconds}
              </div>
            </div>

            {/* Hint Tokens Left */}
            <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={15} color="#f59e0b" />
              <span>Hint Tokens: <strong>{3 - hintsUsedCount}/3 left</strong></span>
            </div>

            {/* Question Numbers Grid */}
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Question Palette:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {activeExam?.questions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = !!userAnswers[q.id];
                  const isFlagged = !!flaggedQuestions[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        padding: '8px 0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: isCurrent
                          ? '#00f2fe'
                          : isFlagged
                          ? 'rgba(245, 158, 11, 0.3)'
                          : isAnswered
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isCurrent ? '#060911' : isFlagged ? '#f59e0b' : isAnswered ? '#10b981' : '#94a3b8',
                        border: isFlagged ? '1px solid #f59e0b' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Finish & Submit Button */}
            <button
              onClick={handleSubmitExam}
              className="gradient-btn-primary"
              style={{ marginTop: 'auto', justifyContent: 'center', padding: '10px' }}
            >
              Submit Exam
            </button>
          </div>

          {/* Main Question View */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge-pill badge-cyan">QUESTION {currentIdx + 1} OF {activeExam?.questions.length}</span>
              <button
                onClick={() => setFlaggedQuestions((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: flaggedQuestions[currentQ.id] ? '#f59e0b' : '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <Flag size={14} />
                <span>{flaggedQuestions[currentQ.id] ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '24px', lineHeight: 1.5 }}>
              {currentQ.question}
            </div>

            {/* Multiple Choice Options */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => setUserAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
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
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #00f2fe' : '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}>
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Enter your exact answer..."
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => setUserAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px' }}
                />
              </div>
            )}

            {/* Hint Button / Revealed Hint Box */}
            <div style={{ marginBottom: '24px' }}>
              {revealedHints[currentQ.id] ? (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: '13px',
                }}>
                  💡 <strong>Exam Hint:</strong> {currentQ.hint || 'Carefully examine the architectural trade-offs mentioned in the question prompt.'}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUseHint(currentQ.id)}
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
                  <span>Use 1 Hint Token ({3 - hintsUsedCount} remaining)</span>
                </button>
              )}
            </div>

            {/* Prev / Next controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((p) => p - 1)}
                className="gradient-btn-secondary"
                style={{ opacity: currentIdx === 0 ? 0.4 : 1 }}
              >
                Previous
              </button>
              <button
                disabled={currentIdx === (activeExam?.questions.length || 1) - 1}
                onClick={() => setCurrentIdx((p) => p + 1)}
                className="gradient-btn-secondary"
                style={{ opacity: currentIdx === (activeExam?.questions.length || 1) - 1 ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results, Score Breakdown, and Revision Recommendations */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Score Header */}
          <div className="glass-panel" style={{
            padding: '32px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(121, 40, 202, 0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}>
            <div>
              <span className="badge-pill badge-emerald">OFFICIAL EXAM SCORECARD</span>
              <h3 style={{ fontSize: '26px', marginTop: '8px' }}>
                Score: {examResults?.score} / {examResults?.totalQuestions} ({Math.round(((examResults?.score || 0) / (examResults?.totalQuestions || 1)) * 100)}%)
              </h3>
              <div style={{ color: '#94a3b8', fontSize: '13.5px', marginTop: '4px' }}>
                Time taken: {examResults?.timeTakenSeconds} seconds • Assessment: {examResults?.examTitle}
              </div>
            </div>

            <button
              onClick={() => {
                setExamStarted(false);
                setExamSubmitted(false);
              }}
              className="gradient-btn-primary"
            >
              <RotateCcw size={16} />
              <span>Return to Exam Center</span>
            </button>
          </div>

          {/* AI Revision Recommendations */}
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '17px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BookOpen size={18} />
              <span>{preferredMentor === 'astra' ? "Astra's" : "Orion's"} Post-Exam Revision Directives</span>
            </h3>
            <ul style={{ marginLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7 }}>
              {examResults?.revisionRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Question by question solutions */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Detailed Solutions & Explanations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {examResults && Object.entries(examResults.detailedResults).map(([qId, item], i) => (
                <div
                  key={qId}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: item.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {item.isCorrect ? <CheckCircle2 size={18} color="#10b981" /> : <XCircle size={18} color="#f43f5e" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                        {i + 1}. {item.question}
                      </div>
                      <div style={{ fontSize: '12.5px', marginTop: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>Your Answer: </span>
                        <span style={{ color: item.isCorrect ? '#10b981' : '#f43f5e' }}>{item.userAnswer}</span>
                        {' • '}
                        <span style={{ color: '#94a3b8' }}>Solution: </span>
                        <span style={{ color: '#10b981' }}>{item.correctAnswer}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px' }}>
                        {item.explanation}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
