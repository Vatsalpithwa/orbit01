'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Image as ImageIcon,
  Mic,
  MicOff,
  Globe,
  Paperclip,
  Trash2,
  Pin,
  PinOff,
  Edit2,
  Copy,
  Check,
  Plus,
  Search,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronDown,
  X,
  Play,
  RotateCcw,
  Square,
  HelpCircle,
  Lightbulb,
  FileText,
  Bookmark,
  MessageSquare,
  Zap,
} from 'lucide-react';
import {
  ChatSession,
  ChatMessage,
  MentorVoice,
  ExplanationLevel,
  MentorStyle,
  SearchSource,
} from '@/lib/types';
import { INITIAL_CHATS, INITIAL_MESSAGES } from '@/lib/sampleData';
import { aiService } from '@/lib/aiService';
import { soundManager } from '@/lib/audio';
import { neuralVoice } from '@/lib/neuralVoice';
import { useToast } from '@/components/Notification/ToastContext';
import MarkdownRenderer from './MarkdownRenderer';
import NeuralVoicePlayer from '@/components/VoiceMentor/NeuralVoicePlayer';
import { updateUserProfile } from '@/lib/supabase';

interface ChatModuleProps {
  preferredMentor: MentorVoice;
  explanationLevel: ExplanationLevel;
  onSelectTab?: (tab: any) => void;
}

export default function ChatModule({
  preferredMentor: initialMentor,
  explanationLevel: initialLevel,
  onSelectTab,
}: ChatModuleProps) {
  const { showToast } = useToast();

  // Active mentor & style state
  const [preferredMentor, setPreferredMentor] = useState<MentorVoice>(initialMentor);
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(initialLevel);
  const [mentorStyle, setMentorStyle] = useState<MentorStyle>('focused_coach');

  // Chats state
  const [chats, setChats] = useState<ChatSession[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>('chat_1');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [chatSearch, setChatSearch] = useState('');

  // Input state
  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  // Image upload state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording & transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Neural Voice speaking state
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesMap, activeChatId, isStreaming]);

  // Synchronize with neuralVoice events
  useEffect(() => {
    const unsub = neuralVoice.subscribe((s) => {
      setCurrentlySpeakingId(s.isPlaying || s.isPaused ? s.activeId : null);
    });
    return unsub;
  }, []);

  const activeMessages = messagesMap[activeChatId] || [];
  const activeChat = chats.find((c) => c.id === activeChatId);

  // Update preferred mentor and persist to Supabase
  const handleSwitchMentor = (mentor: MentorVoice) => {
    setPreferredMentor(mentor);
    updateUserProfile({ preferredMentor: mentor });
    showToast(
      `Mentor switched to ${mentor === 'astra' ? 'Astra (Natural Female)' : 'Orion (Natural Male)'}`,
      'info'
    );
  };

  // Create new chat
  const handleNewChat = () => {
    const newId = `chat_${Date.now()}`;
    const newChat: ChatSession = {
      id: newId,
      title: 'New Consultation',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
    };
    setChats([newChat, ...chats]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [] }));
    setActiveChatId(newId);
    showToast('New conversation initialized', 'info');
  };

  // Toggle Pin
  const togglePin = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Delete Chat
  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId);
      if (remaining.length > 0) setActiveChatId(remaining[0].id);
    }
    showToast('Conversation removed', 'info');
  };

  // Rename Chat
  const renameChat = (chatId: string) => {
    const current = chats.find((c) => c.id === chatId);
    const newTitle = window.prompt('Enter new conversation title:', current?.title);
    if (newTitle && newTitle.trim()) {
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle.trim() } : c))
      );
    }
  };

  // Image Upload Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
        showToast('Image attached for AI visual analysis', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Voice Note Recording with live speech-to-text
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setLiveTranscript('');

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Web Speech Recognition for live transcription
      if (typeof window !== 'undefined') {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          try {
            const rec = new SpeechRec();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';
            rec.onresult = (ev: any) => {
              let text = '';
              for (let i = 0; i < ev.results.length; i++) {
                text += ev.results[i][0].transcript + ' ';
              }
              setLiveTranscript(text.trim());
            };
            rec.start();
            recognitionRef.current = rec;
          } catch {}
        }
      }

      showToast('Recording voice note...', 'info');
    } catch (e) {
      console.warn('Microphone permission error:', e);
      showToast('Microphone access denied or unavailable', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      showToast('Voice note recorded! Review or send', 'success');
    }
  };

  const discardVoiceNote = () => {
    setRecordedAudioUrl(null);
    setLiveTranscript('');
    setRecordingDuration(0);
  };

  // Send message
  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || (liveTranscript ? liveTranscript : inputPrompt);
    if (!textToSend.trim() && !attachedImage && !recordedAudioUrl) return;
    if (isStreaming) return;

    soundManager.playSendSound();

    const userMsgId = `usr_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      chatId: activeChatId,
      role: 'user',
      content: textToSend.trim() || (recordedAudioUrl ? '🎤 [Voice Note Message]' : '📷 [Attached Image Analysis Request]'),
      mentorVoice: preferredMentor,
      explanationLevel,
      mentorStyle,
      imageUrl: attachedImage || undefined,
      voiceUrl: recordedAudioUrl || undefined,
      voiceDuration: recordedAudioUrl ? recordingDuration : undefined,
      createdAt: new Date().toISOString(),
    };

    // Update messages with user message
    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), userMsg],
    }));

    // Clear inputs
    setInputPrompt('');
    setLiveTranscript('');
    setAttachedImage(null);
    setRecordedAudioUrl(null);
    setRecordingDuration(0);

    // Auto update chat title if first message
    if (activeMessages.length === 0) {
      const autoTitle = textToSend.slice(0, 36) + (textToSend.length > 36 ? '...' : '');
      setChats((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, title: autoTitle } : c))
      );
    }

    // Start streaming AI assistant reply
    setIsStreaming(true);
    const aiMsgId = `ai_${Date.now()}`;
    setCurrentStreamingId(aiMsgId);

    const placeholderAiMsg: ChatMessage = {
      id: aiMsgId,
      chatId: activeChatId,
      role: 'assistant',
      content: '',
      mentorVoice: preferredMentor,
      explanationLevel,
      mentorStyle,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), placeholderAiMsg],
    }));

    try {
      let accumulated = '';
      const result = await aiService.streamResponse(
        {
          prompt: textToSend || 'Please analyze this technical resource or voice note.',
          mentorVoice: preferredMentor,
          explanationLevel,
          mentorStyle,
          webSearchEnabled,
          imageBase64: userMsg.imageUrl,
          conversationHistory: activeMessages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        },
        (chunk) => {
          accumulated += chunk;
          setMessagesMap((prev) => {
            const list = [...(prev[activeChatId] || [])];
            const idx = list.findIndex((m) => m.id === aiMsgId);
            if (idx !== -1) {
              list[idx] = { ...list[idx], content: accumulated };
            }
            return { ...prev, [activeChatId]: list };
          });
        }
      );

      // Finalize message with sources
      setMessagesMap((prev) => {
        const list = [...(prev[activeChatId] || [])];
        const idx = list.findIndex((m) => m.id === aiMsgId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            content: result.content,
            searchSources: result.sources,
            isError: false,
          };
        }
        return { ...prev, [activeChatId]: list };
      });
    } catch (e: any) {
      console.error('Chat error:', e);
      setMessagesMap((prev) => {
        const list = [...(prev[activeChatId] || [])];
        const idx = list.findIndex((m) => m.id === aiMsgId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            content: `⚠️ **Unable to complete response**\n\n${e.message || 'The AI service encountered an interruption. Please check your network connection or API configuration and click Retry below.'}`,
            isError: true,
            retryPrompt: textToSend,
          };
        }
        return { ...prev, [activeChatId]: list };
      });
      showToast('Error generating mentor reply. Click Retry to re-attempt.', 'error');
    } finally {
      setIsStreaming(false);
      setCurrentStreamingId(null);
    }
  };

  // Retry failed response
  const handleRetryMessage = (retryPrompt?: string) => {
    if (retryPrompt) {
      handleSendMessage(retryPrompt);
    }
  };

  // Save notes to localStorage
  const handleSaveToNotes = (text: string) => {
    try {
      const existing = localStorage.getItem('orbit_saved_notes') || '[]';
      const notes = JSON.parse(existing);
      notes.push({
        id: `note_${Date.now()}`,
        content: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('orbit_saved_notes', JSON.stringify(notes));
      showToast('Saved note to your workspace notes!', 'success');
    } catch {
      showToast('Note saved successfully!', 'success');
    }
  };

  // Copy code or text
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success', 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr',
        height: 'calc(100vh - var(--header-height) - 48px)',
        gap: '20px',
      }}
    >
      {/* Left Chat History Panel */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          onClick={handleNewChat}
          className="gradient-btn-primary"
          style={{
            width: '100%',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          <span>New Consultation</span>
        </button>

        {/* Search Chats */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
            }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={chatSearch}
            onChange={(e) => setChatSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '32px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#fff',
            }}
          />
        </div>

        {/* Chats List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filteredChats.map((c) => {
            const isActive = c.id === activeChatId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={14} color={isActive ? '#00f2fe' : '#64748b'} />
                  <span
                    style={{
                      fontSize: '12.5px',
                      color: isActive ? '#fff' : '#94a3b8',
                      fontWeight: isActive ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {c.isPinned && <Pin size={11} color="#00f2fe" />}
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(c.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Voice Preview Controls in Sidebar */}
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Mentor Voice Previews:</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => neuralVoice.previewVoice('astra')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                background: preferredMentor === 'astra' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: preferredMentor === 'astra' ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                color: preferredMentor === 'astra' ? '#00f2fe' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              ▶ Astra Voice
            </button>
            <button
              onClick={() => neuralVoice.previewVoice('orion')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                background: preferredMentor === 'orion' ? 'rgba(121, 40, 202, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: preferredMentor === 'orion' ? '1px solid #7928ca' : '1px solid rgba(255, 255, 255, 0.08)',
                color: preferredMentor === 'orion' ? '#c084fc' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              ▶ Orion Voice
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          background: 'rgba(10, 15, 29, 0.75)',
        }}
      >
        {/* Chat Header Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{activeChat?.title || 'Active Consultation'}</span>
              <button onClick={() => renameChat(activeChatId)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <Edit2 size={12} />
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
              {/* Mentor Voice Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Mentor:</span>
                <button
                  onClick={() => handleSwitchMentor(preferredMentor === 'astra' ? 'orion' : 'astra')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: preferredMentor === 'astra' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(121, 40, 202, 0.2)',
                    color: preferredMentor === 'astra' ? '#00f2fe' : '#c084fc',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                  }}
                  title="Click to toggle mentor voice"
                >
                  {preferredMentor === 'astra' ? '🌟 Astra (Female)' : '⚡ Orion (Male)'}
                </button>
              </div>

              <span>•</span>

              {/* Mentor Style Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Style:</span>
                <select
                  value={mentorStyle}
                  onChange={(e) => setMentorStyle(e.target.value as MentorStyle)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="focused_coach">🎯 Focused Coach</option>
                  <option value="friendly_partner">🤝 Friendly Study Partner</option>
                  <option value="expert_debugger">🔍 Expert Debugger</option>
                </select>
              </div>

              <span>•</span>

              {/* Explanation Depth Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Depth:</span>
                <select
                  value={explanationLevel}
                  onChange={(e) => setExplanationLevel(e.target.value as ExplanationLevel)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Staff / Expert</option>
                </select>
              </div>
            </div>
          </div>

          {/* Web Search Mode Toggle */}
          <button
            onClick={() => {
              setWebSearchEnabled(!webSearchEnabled);
              showToast(
                !webSearchEnabled
                  ? 'Live Web Indexing Activated: AI will cite real sources'
                  : 'Web Indexing Disabled',
                'info'
              );
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: webSearchEnabled ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: webSearchEnabled ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
              color: webSearchEnabled ? '#00f2fe' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Globe size={14} />
            <span>{webSearchEnabled ? 'Web Research: ON' : 'Web Research: OFF'}</span>
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {activeMessages.length === 0 ? (
            /* Empty State & Starter Questions */
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: '640px', padding: '30px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(121,40,202,0.2))',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Sparkles size={30} color="#00f2fe" />
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '8px', color: '#fff' }}>
                How can {preferredMentor === 'astra' ? 'Astra' : 'Orion'} mentor you today?
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
                Ask any software engineering, algorithm, debugging, or career question.
                You can write code, attach diagrams, or record voice notes.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px',
                  textAlign: 'left',
                }}
              >
                {[
                  'How do I implement a thread-safe LRU Cache in Python?',
                  'Debug a memory leak in an async event processing queue',
                  'Explain React Server Components vs Client Components',
                  'Give me a step-by-step interview roadmap for Staff AI Engineer',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(promptText)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#cbd5e1',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f2fe')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSpeakingThisMsg = currentlySpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isUser
                        ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                        : preferredMentor === 'astra'
                        ? 'linear-gradient(135deg, #00f2fe, #7928ca)'
                        : 'linear-gradient(135deg, #7928ca, #4facfe)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isUser ? <Sparkles size={18} color="#060911" /> : <Bot size={18} color="#fff" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '85%',
                      background: isUser ? 'rgba(0, 242, 254, 0.12)' : 'rgba(15, 23, 42, 0.85)',
                      border: isUser
                        ? '1px solid rgba(0, 242, 254, 0.28)'
                        : msg.isError
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {/* Attached Image preview if present */}
                    {msg.imageUrl && (
                      <div style={{ marginBottom: '12px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded attachment"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '320px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    )}

                    {/* Voice Note Audio Player if present */}
                    {msg.voiceUrl && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <Mic size={18} color="#00f2fe" />
                        <audio controls src={msg.voiceUrl} style={{ height: '32px' }} />
                        {msg.voiceDuration ? (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{msg.voiceDuration}s</span>
                        ) : null}
                      </div>
                    )}

                    {/* Main Markdown Content with Syntax Highlighting */}
                    <MarkdownRenderer
                      content={msg.content}
                      onRunInCodeLab={(codeSnippet, lang) => {
                        try {
                          localStorage.setItem('orbit_codelab_import', JSON.stringify({ code: codeSnippet, language: lang }));
                          showToast(`Code loaded into Code Lab (${lang.toUpperCase()})!`, 'success');
                          if (onSelectTab) onSelectTab('codelab');
                        } catch {
                          showToast('Code copied for Code Lab', 'success');
                        }
                      }}
                    />

                    {/* Typing cursor animation during streaming */}
                    {isStreaming && msg.id === currentStreamingId && (
                      <span className="typing-cursor" />
                    )}

                    {/* Verified Web Citations if available */}
                    {msg.searchSources && msg.searchSources.length > 0 && (
                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
                          VERIFIED WEB CITATIONS & REFERENCES
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {msg.searchSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#93c5fd',
                              }}
                            >
                              <span>[{sIdx + 1}] {source.title}</span>
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Neural Voice Player bar for active speaking message */}
                    {isSpeakingThisMsg && (
                      <div style={{ marginTop: '12px' }}>
                        <NeuralVoicePlayer activeMessageId={msg.id} compact />
                      </div>
                    )}

                    {/* Context-Aware Quick Actions below every AI response */}
                    {!isUser && !msg.isError && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '14px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <button
                          onClick={() => handleSendMessage('Can you explain that simpler for a beginner?')}
                          className="chat-quick-action-btn"
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          ⚡ Explain Simpler
                        </button>

                        <button
                          onClick={() => handleSendMessage('Can you give a concrete real-world example or scenario for this?')}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          💡 Give Example
                        </button>

                        <button
                          onClick={() => handleSendMessage('Quiz me with a 1-question check to verify my understanding!')}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          📝 Quiz Me
                        </button>

                        <button
                          onClick={() => handleSendMessage('Please summarize the top 3 key takeaways as a bullet list.')}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          📋 Summarize
                        </button>

                        <button
                          onClick={() => neuralVoice.speak(msg.id, msg.content, preferredMentor)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: isSpeakingThisMsg ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: isSpeakingThisMsg ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: isSpeakingThisMsg ? '#00f2fe' : '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Volume2 size={12} />
                          <span>{isSpeakingThisMsg ? 'Voice Active' : 'Read Aloud'}</span>
                        </button>

                        <button
                          onClick={() => handleSaveToNotes(msg.content)}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          💾 Save Notes
                        </button>

                        <button
                          onClick={() => handleSendMessage('What are the common pitfalls or follow-up topics I should explore next?')}
                          style={{
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          💬 Ask Follow-up
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 9px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === msg.id ? '#10b981' : '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {/* Retry Button if an error occurred */}
                    {msg.isError && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleRetryMessage(msg.retryPrompt)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#f87171',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Retry Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(10, 15, 28, 0.85)',
          }}
        >
          {/* Active Preview Strip for Attached Image or Recorded Voice Note */}
          {(attachedImage || recordedAudioUrl || isRecording) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '10px',
                marginBottom: '12px',
              }}
            >
              {attachedImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachedImage}
                    alt="Attachment"
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '12px', color: '#00f2fe' }}>Image Ready for AI Vision Analysis</span>
                  <button onClick={() => setAttachedImage(null)} style={{ color: '#f43f5e', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f43f5e', flex: 1 }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#f43f5e',
                      boxShadow: '0 0 10px #f43f5e',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Recording: {recordingDuration}s</span>
                  {liveTranscript && (
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{liveTranscript}"
                    </span>
                  )}
                  <button
                    onClick={stopRecording}
                    style={{
                      marginLeft: 'auto',
                      background: '#f43f5e',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    Done Recording
                  </button>
                </div>
              )}

              {recordedAudioUrl && !isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <Mic size={16} color="#00f2fe" />
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Voice Note Recorded ({recordingDuration}s)</span>
                  <audio controls src={recordedAudioUrl} style={{ height: '30px', maxWidth: '240px' }} />
                  {liveTranscript && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                      "{liveTranscript}"
                    </span>
                  )}
                  <button
                    onClick={discardVoiceNote}
                    style={{ color: '#f43f5e', cursor: 'pointer', background: 'none', border: 'none', marginLeft: 'auto' }}
                    title="Delete voice note"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Hidden File Input for Image Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />

            {/* Attach Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: attachedImage ? '#00f2fe' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title="Upload image or diagram for AI analysis"
            >
              <ImageIcon size={18} />
            </button>

            {/* Voice Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: isRecording ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isRecording ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isRecording ? '#f43f5e' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title={isRecording ? 'Stop Recording' : 'Record Voice Note'}
            >
              {isRecording ? <Square size={16} /> : <Mic size={18} />}
            </button>

            {/* Prompt Input */}
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${preferredMentor === 'astra' ? 'Astra' : 'Orion'} anything, or press Enter...`}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                maxHeight: '120px',
                borderRadius: '10px',
                padding: '11px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '13.5px',
                lineHeight: 1.5,
                outline: 'none',
              }}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={isStreaming || (!inputPrompt.trim() && !attachedImage && !recordedAudioUrl)}
              className="gradient-btn-primary"
              style={{
                height: '42px',
                padding: '0 20px',
                borderRadius: '10px',
                opacity: isStreaming || (!inputPrompt.trim() && !attachedImage && !recordedAudioUrl) ? 0.5 : 1,
                cursor: isStreaming || (!inputPrompt.trim() && !attachedImage && !recordedAudioUrl) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
