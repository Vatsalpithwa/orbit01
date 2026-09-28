'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Compass,
  ArrowRight,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { UserProfile, MentorVoice, ExplanationLevel } from '@/lib/types';
import { updateUserProfile } from '@/lib/supabase';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
  currentUser,
}: OnboardingModalProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState<MentorVoice>(currentUser.preferredMentor || 'astra');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'AI & LLM Architecture',
    'Full Stack Systems',
  ]);
  const [skillLevel, setSkillLevel] = useState<ExplanationLevel>('intermediate');
  const [careerGoal, setCareerGoal] = useState(currentUser.careerGoal || 'Senior AI Systems Architect');
  const [dailyMinutes, setDailyMinutes] = useState(60);

  if (!isOpen) return null;

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFinish = async () => {
    try {
      const updated = await updateUserProfile({
        preferredMentor: selectedMentor,
        careerGoal,
        skillLevel,
        dailyFocusTargetMinutes: dailyMinutes,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('orbit_onboarding_completed', 'true');
      }

      soundManager.playAchievementChime();
      showToast('Onboarding complete! Welcome to Orbit Mentor AI.', 'success');
      onComplete(updated);
    } catch (e) {
      showToast('Setup completed', 'info');
      onComplete(currentUser);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '36px',
        borderRadius: '24px',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 242, 254, 0.2)',
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#00f2fe' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 2 ? '#00f2fe' : 'rgba(255,255,255,0.1)' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= 3 ? '#00f2fe' : 'rgba(255,255,255,0.1)' }} />
        </div>

        {step === 1 && (
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00f2fe, #7928ca)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Sparkles size={26} color="#060911" />
            </div>

            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Select Your AI Voice Mentor</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Your mentor provides real-time voice guidance, code reviews, and exam insights.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
              <div
                onClick={() => setSelectedMentor('astra')}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: selectedMentor === 'astra' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedMentor === 'astra' ? '2px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                }}>
                  <Sparkles size={20} color="#060911" />
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>Astra</div>
                <div style={{ fontSize: '12px', color: '#00f2fe', marginTop: '2px' }}>Female Voice</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Inspiring & Structured</div>
              </div>

              <div
                onClick={() => setSelectedMentor('orion')}
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: selectedMentor === 'orion' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: selectedMentor === 'orion' ? '2px solid #9d4edd' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9d4edd, #7928ca)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#fff' }}>Orion</div>
                <div style={{ fontSize: '12px', color: '#c77dff', marginTop: '2px' }}>Male Voice</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Systems Architect</div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="gradient-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
            >
              <span>Next: Focus Domains</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Select Core Subjects</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              We will customize your daily quizzes, exams, and Code Lab suggestions based on your domains.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
              {[
                'AI & LLM Architecture',
                'Full Stack Systems',
                'Distributed Algorithms',
                'Cloud & Kubernetes',
                'Database & SQL Tuning',
                'Cybersecurity Hardening',
              ].map((item) => {
                const isChecked = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isChecked ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isChecked ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isChecked ? '#00f2fe' : '#cbd5e1',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{item}</span>
                    {isChecked && <Check size={14} color="#00f2fe" />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="gradient-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="gradient-btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <span>Next: Goals</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Set Career Target & Daily Pace</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              Establish your target role and daily Pomodoro focus commitment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Daily Study Goal (Minutes)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: '8px',
                        background: dailyMinutes === mins ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: dailyMinutes === mins ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: dailyMinutes === mins ? '#00f2fe' : '#cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="gradient-btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="gradient-btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <span>Launch Orbit Studio</span>
                <Sparkles size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
