'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Bot,
  Image as ImageIcon,
  FastForward,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Trash2,
  Send,
  X,
  Volume1,
} from 'lucide-react';
import { MentorVoice } from '@/lib/types';
import { aiService } from '@/lib/aiService';
import { neuralVoice, VoicePlaybackState } from '@/lib/neuralVoice';
import { useToast } from '@/components/Notification/ToastContext';
import MarkdownRenderer from '@/components/Chat/MarkdownRenderer';
import NeuralVoicePlayer from './NeuralVoicePlayer';
import { updateUserProfile } from '@/lib/supabase';

interface VoiceMentorModuleProps {
  preferredMentor: MentorVoice;
  onSelectMentor: (mentor: MentorVoice) => void;
}

export default function VoiceMentorModule({
  preferredMentor,
  onSelectMentor,
}: VoiceMentorModuleProps) {
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [mentorAnswer, setMentorAnswer] = useState(
    `### Welcome to the Voice Mentors Stage! 🎙️\n\nI am **${preferredMentor === 'astra' ? 'Astra' : 'Orion'}**, your neural AI mentor. You can speak to me with your microphone, attach diagrams, or ask any technical question.\n\n- **Natural Intonation**: Neural voices with clear cadence, pauses, and expressive delivery.\n- **Audio Controls**: Adjust volume up to 100%, change playback speeds, seek through explanations, and replay at any time.\n\nWhat would you like to explore today?`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [mentorMode, setMentorMode] = useState<'step_by_step' | 'summarize' | 'code_review'>('step_by_step');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Audio engine state
  const [voiceState, setVoiceState] = useState<VoicePlaybackState>(neuralVoice.getState());

  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsub = neuralVoice.subscribe((s) => setVoiceState({ ...s }));
    return unsub;
  }, []);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setSpokenTranscript(current);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleSelectMentor = (mentor: MentorVoice) => {
    onSelectMentor(mentor);
    updateUserProfile({ preferredMentor: mentor });
    showToast(`Switched active voice mentor to ${mentor === 'astra' ? 'Astra' : 'Orion'}`, 'success');
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition not supported in this browser. Please type your query.', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpokenTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Listening... Speak your question now', 'info');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleAskMentor = async (overridePrompt?: string) => {
    const prompt = overridePrompt || spokenTranscript || typedQuestion;
    if (!prompt.trim() && !attachedImage) return;

    neuralVoice.stop();
    setIsGenerating(true);
    showToast(`${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is synthesizing your explanation...`, 'info');

    let fullPrompt = prompt;
    if (mentorMode === 'step_by_step') {
      fullPrompt = `Please explain step-by-step: ${prompt}`;
    } else if (mentorMode === 'summarize') {
      fullPrompt = `Provide a concise executive summary and key points for: ${prompt}`;
    } else if (mentorMode === 'code_review') {
      fullPrompt = `Conduct a rigorous code and architecture review for: ${prompt}`;
    }

    try {
      let responseAccumulator = '';
      await aiService.streamResponse(
        {
          prompt: fullPrompt,
          mentorVoice: preferredMentor,
          explanationLevel: 'intermediate',
          imageBase64: attachedImage || undefined,
        },
        (chunk) => {
          responseAccumulator += chunk;
          setMentorAnswer(responseAccumulator);
        }
      );

      // Play neural voice audio automatically
      neuralVoice.speak('voice_stage_answer', responseAccumulator, preferredMentor);
      setSpokenTranscript('');
      setTypedQuestion('');
    } catch (e: any) {
      showToast('Error generating mentor reply', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Image Upload for Voice Inspection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        showToast('Image attached. Mentor will describe and inspect it.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>AI Voice Mentors Stage</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Lifelike vocal narration powered by natural neural voices, speech-to-text dialogue, and step-by-step audio walkthroughs.
        </p>
      </div>

      {/* Selectable Mentor Personas with Voice Previews */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Astra Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: preferredMentor === 'astra' ? '2px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
            background: preferredMentor === 'astra' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(17, 26, 46, 0.65)',
            boxShadow: preferredMentor === 'astra' ? '0 0 30px rgba(0, 242, 254, 0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0, 242, 254, 0.4)',
                }}
              >
                <Sparkles size={28} color="#060911" />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Astra</div>
                <div style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 600 }}>
                  Warm Natural Female Voice
                </div>
              </div>
            </div>

            {/* Voice Preview Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                neuralVoice.previewVoice('astra');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(0, 242, 254, 0.15)',
                color: '#00f2fe',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                cursor: 'pointer',
              }}
              title="Preview Astra's voice before selecting"
            >
              <Volume1 size={14} />
              <span>Voice Preview</span>
            </button>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '16px' }}>
            Empathetic, structured, and pedagogical. Excels at breaking down complex algorithms into intuitive mental models with natural pauses and warm delivery.
          </p>

          <button
            onClick={() => handleSelectMentor('astra')}
            className={preferredMentor === 'astra' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
            style={{ width: '100%', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600 }}
          >
            {preferredMentor === 'astra' ? '✓ Selected Active Mentor' : 'Select Astra as Mentor'}
          </button>
        </div>

        {/* Orion Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '16px',
            border: preferredMentor === 'orion' ? '2px solid #9d4edd' : '1px solid rgba(255, 255, 255, 0.08)',
            background: preferredMentor === 'orion' ? 'rgba(157, 78, 221, 0.08)' : 'rgba(17, 26, 46, 0.65)',
            boxShadow: preferredMentor === 'orion' ? '0 0 30px rgba(157, 78, 221, 0.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #9d4edd, #7928ca)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(157, 78, 221, 0.4)',
                }}
              >
                <Bot size={28} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Orion</div>
                <div style={{ fontSize: '12px', color: '#c77dff', fontWeight: 600 }}>
                  Confident Natural Male Voice
                </div>
              </div>
            </div>

            {/* Voice Preview Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                neuralVoice.previewVoice('orion');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(157, 78, 221, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(157, 78, 221, 0.4)',
                cursor: 'pointer',
              }}
              title="Preview Orion's voice before selecting"
            >
              <Volume1 size={14} />
              <span>Voice Preview</span>
            </button>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '16px' }}>
            Confident, pragmatic, and analytical. Veteran software architect focusing on production failure modes, performance trade-offs, and high-throughput systems.
          </p>

          <button
            onClick={() => handleSelectMentor('orion')}
            className={preferredMentor === 'orion' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
            style={{ width: '100%', padding: '9px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600 }}
          >
            {preferredMentor === 'orion' ? '✓ Selected Active Mentor' : 'Select Orion as Mentor'}
          </button>
        </div>
      </div>

      {/* Main Interactive Audio Stage */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
        {/* Animated Sound Waveform Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            height: '60px',
            marginBottom: '20px',
          }}
        >
          {[20, 45, 30, 60, 40, 25, 55, 35, 65, 30, 50, 20].map((h, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: voiceState.isPlaying ? `${h}px` : '8px',
                borderRadius: '999px',
                background: preferredMentor === 'astra'
                  ? 'linear-gradient(180deg, #00f2fe, #4facfe)'
                  : 'linear-gradient(180deg, #c77dff, #7928ca)',
                transition: 'height 0.15s ease',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          {voiceState.isPlaying
            ? `${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is Speaking...`
            : isListening
            ? 'Listening to your voice...'
            : isGenerating
            ? `${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is Reasoning...`
            : `${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is Ready`}
        </div>

        {/* Spoken Transcript display if listening */}
        {spokenTranscript && (
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto 16px auto',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.1)',
              color: '#00f2fe',
              fontSize: '14px',
            }}
          >
            "{spokenTranscript}"
          </div>
        )}

        {/* Neural Voice Player with Seek Bar, Volume Slider, Speed, Replay, and Stop */}
        <div style={{ maxWidth: '640px', margin: '0 auto 24px auto' }}>
          <NeuralVoicePlayer activeMessageId="voice_stage_answer" onSelectMentor={handleSelectMentor} />
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[
            { id: 'step_by_step', label: 'Step-by-Step Breakdown' },
            { id: 'summarize', label: 'Executive Summary' },
            { id: 'code_review', label: 'Architecture & Code Review' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMentorMode(mode.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                background: mentorMode === mode.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: mentorMode === mode.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                color: mentorMode === mode.id ? '#00f2fe' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Input Bar for Voice / Text Query */}
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(10, 15, 28, 0.8)',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* File Upload for Diagrams */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => imageInputRef.current?.click()}
            style={{
              background: 'transparent',
              border: 'none',
              color: attachedImage ? '#00f2fe' : '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
            title="Attach technical diagram or code image"
          >
            <ImageIcon size={18} />
          </button>

          {/* Mic Toggle Button */}
          <button
            onClick={toggleListening}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isListening ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: isListening ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isListening ? '#f43f5e' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isListening ? 'Stop listening' : 'Start microphone speech input'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={typedQuestion}
            onChange={(e) => setTypedQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAskMentor();
              }
            }}
            placeholder={`Ask ${preferredMentor === 'astra' ? 'Astra' : 'Orion'} with voice or text...`}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '13.5px',
              outline: 'none',
            }}
          />

          {/* Submit Button */}
          <button
            onClick={() => handleAskMentor()}
            disabled={isGenerating || (!typedQuestion.trim() && !spokenTranscript.trim() && !attachedImage)}
            className="gradient-btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              opacity: isGenerating || (!typedQuestion.trim() && !spokenTranscript.trim() && !attachedImage) ? 0.5 : 1,
            }}
          >
            <Send size={14} />
            <span>Speak</span>
          </button>
        </div>

        {/* Attached image preview */}
        {attachedImage && (
          <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 242, 254, 0.1)', padding: '6px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#00f2fe' }}>Diagram attached for visual analysis</span>
            <button onClick={() => setAttachedImage(null)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}><X size={13} /></button>
          </div>
        )}
      </div>

      {/* Spoken AI Explanation Card (Rendered with MarkdownRenderer) */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(13, 20, 36, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: preferredMentor === 'astra'
                  ? 'linear-gradient(135deg, #00f2fe, #7928ca)'
                  : 'linear-gradient(135deg, #9d4edd, #4facfe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {preferredMentor === 'astra' ? <Sparkles size={16} color="#060911" /> : <Bot size={16} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                {preferredMentor === 'astra' ? "Astra's Vocal Explanation" : "Orion's Engineering Analysis"}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Mode: {mentorMode.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => neuralVoice.speak('voice_stage_answer', mentorAnswer, preferredMentor)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(0, 242, 254, 0.12)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              color: '#00f2fe',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            <span>Replay Audio</span>
          </button>
        </div>

        {/* Clean Markdown Rendering */}
        <MarkdownRenderer content={mentorAnswer} />
      </div>
    </div>
  );
}
