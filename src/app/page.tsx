'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  Code2,
  CheckSquare,
  Award,
  Globe2,
  TrendingUp,
  Newspaper,
  Mic,
  ShieldCheck,
  ArrowRight,
  Flame,
  Terminal,
  Zap,
  Play,
} from 'lucide-react';
import { signInWithGoogleOAuth } from '@/lib/supabase';
import { useToast } from '@/components/Notification/ToastContext';

export default function LandingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    showToast('Connecting with Google OAuth securely...', 'info');
    try {
      const res = await signInWithGoogleOAuth();
      if (res.url) {
        if (res.url.startsWith('http')) {
          window.location.href = res.url;
        } else {
          router.push(res.url);
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Authentication error', 'error');
      setIsAuthenticating(false);
    }
  };

  return (
    <div style={{
      background: 'radial-gradient(ellipse at 50% 10%, rgba(0, 242, 254, 0.08) 0%, rgba(121, 40, 202, 0.05) 50%, #060911 100%)',
      minHeight: '100vh',
      color: '#f8fafc',
    }}>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #7928ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)',
          }}>
            <Sparkles size={22} color="#060911" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Orbit Mentor <span style={{ color: '#00f2fe' }}>AI</span>
            </span>
            <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.05em' }}>
              AUTONOMOUS LEARNING & CODE STUDIO
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link href="#features" style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            Features
          </Link>
          <Link href="#mentors" style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            Voice Mentors
          </Link>
          <Link href="#codelab" style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            Code Lab
          </Link>
          <Link href="#security" style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
            Security
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            className="gradient-btn-secondary"
            style={{ fontSize: '14px', padding: '9px 18px' }}
          >
            Explore Platform
          </button>
          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="gradient-btn-primary"
            style={{ fontSize: '14px', padding: '9px 18px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#060911" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#060911" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#060911" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#060911" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {isAuthenticating ? 'Authorizing...' : 'Sign in with Google'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '90px 24px 70px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(0, 242, 254, 0.1)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '999px',
          marginBottom: '28px',
          fontSize: '13px',
          color: '#00f2fe',
          fontWeight: 600,
        }}>
          <Sparkles size={15} />
          <span>ORBIT MENTOR AI PLATFORM 2026 EDITION</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 68px)',
          fontWeight: 800,
          lineHeight: 1.12,
          marginBottom: '24px',
          letterSpacing: '-0.03em',
        }}>
          Master Any Skill with Your <br />
          <span className="gradient-text">Personal Autonomous AI Mentor</span>
        </h1>

        <p style={{
          fontSize: '19px',
          color: '#94a3b8',
          maxWidth: '820px',
          margin: '0 auto 40px auto',
          lineHeight: 1.6,
        }}>
          An all-in-one dark-themed ecosystem combining real-time streaming AI mentorship, 
          speech & voice interaction, multi-language sandboxed Code Lab, timed exams, Pomodoro focus manager, 
          interactive 3D tech globe, and step-by-step career roadmaps.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={handleGoogleSignIn}
            className="gradient-btn-primary"
            style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#060911" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#060911" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#060911" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#060911" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="gradient-btn-secondary"
            style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '12px' }}
          >
            Explore All Features (Live Demo)
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Security badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          color: '#64748b',
          fontSize: '13px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Google OAuth 2.0 Secure Session</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#00f2fe" />
            <span>Supabase Row-Level Security (RLS)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#9d4edd" />
            <span>Sandboxed Client-Safe Execution</span>
          </div>
        </div>
      </section>

      {/* Live Interactive Hero Showcase */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 254, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f43f5e' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '12px', fontFamily: 'var(--font-mono)' }}>
                orbit-mentor-workspace // active-session
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge-pill badge-cyan">ASTRA (FEMALE MENTOR)</span>
              <span className="badge-pill badge-purple">ORION (MALE MENTOR)</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {/* Chatbox Simulation */}
            <div style={{
              background: '#0a0e1a',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Bot size={18} color="#00f2fe" />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Astra AI Response (Real-time Streaming)</span>
              </div>
              <div style={{
                fontSize: '13.5px',
                color: '#cbd5e1',
                lineHeight: 1.6,
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '14px',
                borderRadius: '10px',
                borderLeft: '3px solid #00f2fe',
              }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Astra:</strong> &quot;To prevent race conditions in your async worker queue, 
                  let&apos;s apply an asynchronous semaphore with a bounded channel! Here is how you structure it:&quot;
                </p>
                <div style={{
                  background: '#05070d',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: '#38bdf8',
                }}>
                  const sem = new Semaphore(10);<br />
                  await sem.acquire(); // guarded critical section
                </div>
              </div>
            </div>

            {/* Code Lab Simulation */}
            <div style={{
              background: '#0a0e1a',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={18} color="#10b981" />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Code Lab Sandboxed Output</span>
                </div>
                <span style={{ fontSize: '12px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Python 3 (WebAssembly)
                </span>
              </div>
              <div style={{
                background: '#05070d',
                padding: '14px',
                borderRadius: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                color: '#10b981',
              }}>
                <div>&gt; pyodide.runPython(&quot;embeddings_similarity.py&quot;)</div>
                <div style={{ color: '#94a3b8', marginTop: '6px' }}>[99.9% match] -&gt; Neural Network Architecture</div>
                <div style={{ color: '#94a3b8' }}>[99.6% match] -&gt; PyTorch Deep Learning Guide</div>
                <div style={{ color: '#00f2fe', marginTop: '6px' }}>Execution finished in 18ms (0 memory leaks)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto 100px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '12px', color: '#00f2fe', letterSpacing: '0.1em', fontWeight: 700 }}>
            INTEGRATED CAPABILITIES
          </span>
          <h2 style={{ fontSize: '38px', marginTop: '8px' }}>
            Ten Supercharged Modules in One Seamless App
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              icon: <Bot size={26} color="#00f2fe" />,
              title: 'AI Chatbot & Vision Analysis',
              desc: 'Streaming real-time answers, code formatting, image file inspection, and beginner-to-expert explanations.',
            },
            {
              icon: <Mic size={26} color="#9d4edd" />,
              title: 'Dual Voice Mentors (Astra & Orion)',
              desc: 'Speech-to-text questions and lifelike audio narration with speed, pitch, and step-by-step guidance.',
            },
            {
              icon: <Code2 size={26} color="#10b981" />,
              title: 'Multi-Language Sandboxed Code Lab',
              desc: 'Execute JavaScript, Python, C++, HTML/CSS live preview, and safe SQL queries with in-app AI hints.',
            },
            {
              icon: <CheckSquare size={26} color="#f59e0b" />,
              title: 'Tasks & Pomodoro Focus Timer',
              desc: 'Prioritize daily goals, track focus streaks, and hear synthesized Web Audio chimes when timers conclude.',
            },
            {
              icon: <Award size={26} color="#38bdf8" />,
              title: 'Adaptive Quiz & Timed Exams',
              desc: 'AI-generated tests based on your search history with 3-hint tokens, scorecards, and revision advice.',
            },
            {
              icon: <Globe2 size={26} color="#00f2fe" />,
              title: 'Interactive 3D Tech Globe',
              desc: 'Inspect global AI breakthroughs, tech summits, and research labs mapped on a rotating 3D Earth.',
            },
            {
              icon: <TrendingUp size={26} color="#c77dff" />,
              title: 'Career Roadmaps & Milestones',
              desc: 'Personalized engineering roadmaps from Junior to Principal with curated docs, videos, and interview prep.',
            },
            {
              icon: <Newspaper size={26} color="#10b981" />,
              title: 'Curated Daily Tech News',
              desc: 'Fresh global developments across AI, systems, and quantum research with cited sources and AI summaries.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover"
              style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '19px' }}>{item.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <section style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 242, 254, 0.05) 50%, #060911 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '70px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>Ready to Elevate Your Learning?</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '32px' }}>
            Join Orbit Mentor AI today. Experience persistent sessions, secure Google login, and continuous progress tracking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={handleGoogleSignIn}
              className="gradient-btn-primary"
              style={{ fontSize: '15px', padding: '12px 28px', borderRadius: '10px' }}
            >
              Start Free with Google
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="gradient-btn-secondary"
              style={{ fontSize: '15px', padding: '12px 28px', borderRadius: '10px' }}
            >
              Launch Live App
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '60px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '30px',
          color: '#64748b',
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '60px auto 0 auto',
        }}>
          <div>Orbit Mentor AI © 2026. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </section>
    </div>
  );
}
