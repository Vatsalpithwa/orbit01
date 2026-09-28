'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Save,
  Terminal,
  Code2,
  Eye,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  FolderOpen,
  Download,
  Clock,
  Cpu,
  Layers,
  FileCode,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { CodeProject, CodeLanguage, CodeRunResult, MentorVoice } from '@/lib/types';
import { INITIAL_CODE_PROJECTS } from '@/lib/sampleData';
import { aiService } from '@/lib/aiService';
import { soundManager } from '@/lib/audio';
import { useToast } from '@/components/Notification/ToastContext';
import MarkdownRenderer from '@/components/Chat/MarkdownRenderer';

interface CodeLabModuleProps {
  preferredMentor: MentorVoice;
}

interface RunHistoryItem {
  id: string;
  timestamp: string;
  language: CodeLanguage;
  executionTimeMs: number;
  status: string;
  hasError: boolean;
}

export default function CodeLabModule({ preferredMentor }: CodeLabModuleProps) {
  const { showToast } = useToast();

  const [projects, setProjects] = useState<CodeProject[]>(INITIAL_CODE_PROJECTS);
  const [activeProject, setActiveProject] = useState<CodeProject>(INITIAL_CODE_PROJECTS[0]);
  const [code, setCode] = useState(INITIAL_CODE_PROJECTS[0].code);
  const [cssCode, setCssCode] = useState(INITIAL_CODE_PROJECTS[0].cssCode || '');
  const [stdin, setStdin] = useState(INITIAL_CODE_PROJECTS[0].stdin || '');
  const [language, setLanguage] = useState<CodeLanguage>(INITIAL_CODE_PROJECTS[0].language);

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<CodeRunResult | null>({
    output: INITIAL_CODE_PROJECTS[0].lastRunOutput || 'Ready to execute code.',
    executionTimeMs: 14,
    exitStatus: 'Ready',
  });

  const [activeTab, setActiveTab] = useState<'console' | 'stdin' | 'preview' | 'history'>('console');
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([]);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Progressive Hints state (1 to 3)
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [mentorHint, setMentorHint] = useState<string | null>(null);
  const [isAskingMentor, setIsAskingMentor] = useState(false);

  // Check for code imported from chat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const imported = localStorage.getItem('orbit_codelab_import');
      if (imported) {
        try {
          const parsed = JSON.parse(imported);
          if (parsed.code) {
            setCode(parsed.code);
            if (parsed.language) {
              const lang = parsed.language.toLowerCase();
              if (['python', 'py'].includes(lang)) setLanguage('python');
              else if (['javascript', 'js', 'ts', 'typescript'].includes(lang)) setLanguage('javascript');
              else if (['cpp', 'c'].includes(lang)) setLanguage('cpp');
              else if (['sql'].includes(lang)) setLanguage('sql');
              else if (['html', 'css'].includes(lang)) setLanguage('html');
            }
            showToast('Imported code snippet from chat into Code Lab!', 'success');
            localStorage.removeItem('orbit_codelab_import');
          }
        } catch {}
      }
    }
  }, [showToast]);

  // Autosave effect with debounce
  useEffect(() => {
    setAutosaveStatus('unsaved');
    const timer = setTimeout(() => {
      setAutosaveStatus('saving');
      const updated = {
        ...activeProject,
        code,
        cssCode,
        stdin,
        language,
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
      if (typeof window !== 'undefined') {
        localStorage.setItem(`orbit_code_proj_${activeProject.id}`, JSON.stringify(updated));
      }
      setAutosaveStatus('saved');
    }, 1500);

    return () => clearTimeout(timer);
  }, [code, cssCode, stdin, language, activeProject.id]);

  // Switch project
  const handleSelectProject = (proj: CodeProject) => {
    setActiveProject(proj);
    setCode(proj.code);
    setCssCode(proj.cssCode || '');
    setStdin(proj.stdin || '');
    setLanguage(proj.language);
    setRunResult(proj.lastRunOutput ? { output: proj.lastRunOutput, executionTimeMs: 12, exitStatus: 'Accepted' } : null);
    setMentorHint(null);
    setHintLevel(1);
    if (proj.language === 'html' || proj.language === 'css') {
      setActiveTab('preview');
    } else {
      setActiveTab('console');
    }
  };

  // Change Language with Starter Templates
  const handleLanguageChange = (lang: CodeLanguage) => {
    setLanguage(lang);
    setMentorHint(null);
    setHintLevel(1);

    if (lang === 'python') {
      setCode(`# Python Algorithmic & Systems Sandbox
# Supports classes, recursion, standard library, and custom stdin

class BinarySearchTree:
    class Node:
        def __init__(self, val):
            self.val = val
            self.left = None
            self.right = None

    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = self.Node(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = self.Node(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = self.Node(val)
                    break
                curr = curr.right

    def inorder(self, node, result):
        if node:
            self.inorder(node.left, result)
            result.append(node.val)
            self.inorder(node.right, result)

# Build BST and traverse
bst = BinarySearchTree()
elements = [42, 17, 89, 8, 23, 64, 99, 11]
for x in elements:
    bst.insert(x)

sorted_items = []
bst.inorder(bst.root, sorted_items)
print("Original Elements:", elements)
print("Inorder BST Sorted Sequence:", sorted_items)
`);
      setStdin('');
      setActiveTab('console');
    } else if (lang === 'cpp') {
      setCode(`// C++20 Algorithmic & Systems Sandbox
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

struct TaskRecord {
    int id;
    int priority;
    double execution_ms;
};

int main() {
    std::vector<TaskRecord> tasks = {
        {101, 3, 14.5},
        {102, 1, 4.2},
        {103, 5, 28.1},
        {104, 2, 8.9}
    };

    // Sort by priority descending
    std::sort(tasks.begin(), tasks.end(), [](const TaskRecord& a, const TaskRecord& b) {
        return a.priority > b.priority;
    });

    std::cout << "--- Scheduled Task Execution Order ---\\n";
    for (const auto& task : tasks) {
        std::cout << "Task ID: " << task.id 
                  << " | Priority: " << task.priority 
                  << " | Runtime: " << task.execution_ms << "ms\\n";
    }

    std::cout << "\\nFinished execution with exit code 0.\\n";
    return 0;
}
`);
      setStdin('');
      setActiveTab('console');
    } else if (lang === 'javascript') {
      setCode(`// JavaScript (Node.js 20) Sandbox
// Supports async/await, closures, Maps, Sets, and modern ES features

async function processQueue(items, concurrencyLimit = 3) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = (async () => {
      // Simulate task processing
      const processed = { id: item, completed: true, timestamp: Date.now() };
      return processed;
    })();

    results.push(promise);
    executing.add(promise);

    const cleanup = () => executing.delete(promise);
    promise.then(cleanup).catch(cleanup);

    if (executing.size >= concurrencyLimit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

const taskIds = [1, 2, 3, 4, 5, 6, 7];
processQueue(taskIds, 2).then(results => {
  console.log("Processed " + results.length + " tasks concurrently!");
  console.log("Sample Result:", JSON.stringify(results[0]));
});
`);
      setStdin('');
      setActiveTab('console');
    } else if (lang === 'sql') {
      setCode(`-- SQLite Relational Database Sandbox
CREATE TABLE IF NOT EXISTS mentors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    mentor_id INTEGER,
    title TEXT NOT NULL,
    enrolled_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    FOREIGN KEY(mentor_id) REFERENCES mentors(id)
);

INSERT INTO mentors VALUES (1, 'Astra AI', 'Distributed Systems & Algorithms');
INSERT INTO mentors VALUES (2, 'Orion AI', 'High-Throughput Architecture');

INSERT INTO courses VALUES (101, 1, 'Mastering Distributed LLM Architecture', 4820, 4.96);
INSERT INTO courses VALUES (102, 2, 'High-Throughput Kafka & Event Streaming', 3910, 4.92);
INSERT INTO courses VALUES (103, 1, 'TypeScript Type Gymnastics & Monads', 2640, 4.88);
INSERT INTO courses VALUES (104, 2, 'C++20 Zero-Copy Systems', 1980, 4.94);

-- Query courses with mentor details sorted by enrollments
SELECT 
    m.name AS mentor_name, 
    c.title AS course_title, 
    c.enrolled_count, 
    c.rating
FROM courses c
JOIN mentors m ON c.mentor_id = m.id
WHERE c.rating >= 4.9
ORDER BY c.enrolled_count DESC;
`);
      setStdin('');
      setActiveTab('console');
    } else if (lang === 'html' || lang === 'css') {
      setCode(`<div class="preview-container">
  <div class="glow-orb"></div>
  <div class="card">
    <div class="badge">Live Sandbox</div>
    <h2>Orbit Mentor AI</h2>
    <p>Rendered safely inside an isolated client iframe.</p>
    <div class="actions">
      <button class="btn primary" onclick="alert('Primary action verified!')">Interactive Button</button>
      <button class="btn secondary" onclick="document.querySelector('.badge').textContent = 'State Updated!'">Update State</button>
    </div>
  </div>
</div>`);
      setCssCode(`body {
  margin: 0;
  padding: 30px;
  background: #080d1a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
}
.card {
  position: relative;
  background: rgba(17, 26, 46, 0.8);
  border: 1px solid rgba(0, 242, 254, 0.3);
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 242, 254, 0.15);
  backdrop-filter: blur(10px);
  max-width: 380px;
}
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  background: rgba(0, 242, 254, 0.15);
  color: #00f2fe;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
}
h2 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 22px;
}
p {
  color: #94a3b8;
  font-size: 13.5px;
  margin: 0 0 20px 0;
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.15s;
}
.btn:active {
  transform: scale(0.97);
}
.btn.primary {
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  color: #070d18;
}
.btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}`);
      setActiveTab('preview');
    }
  };

  // Run Code via Isolated Remote Sandbox (Judge0)
  const handleRunCode = async () => {
    setIsRunning(true);
    soundManager.playSendSound();

    if (language === 'html' || language === 'css') {
      setActiveTab('preview');
      setIsRunning(false);
      showToast('Live render preview updated', 'success');
      return;
    }

    setActiveTab('console');
    showToast(`Executing ${language.toUpperCase()} in remote sandbox...`, 'info');

    try {
      const result = await aiService.runRemoteCode(language, code, stdin);
      setRunResult(result);

      // Add to run history
      const historyItem: RunHistoryItem = {
        id: `run_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        language,
        executionTimeMs: result.executionTimeMs,
        status: result.exitStatus || (result.error ? 'Error' : 'Accepted'),
        hasError: Boolean(result.error || result.compilerError),
      };
      setRunHistory((prev) => [historyItem, ...prev.slice(0, 14)]);

      if (result.error || result.compilerError) {
        showToast('Execution stopped with error. Click "Get Hint" for debug advice!', 'error');
      } else {
        soundManager.playAchievementChime();
        showToast(`Program finished with status ${result.exitStatus || 'Accepted'}`, 'success');
      }
    } catch (e: any) {
      setRunResult({
        output: '',
        error: `Sandbox execution failed: ${e.message}`,
        executionTimeMs: 0,
        exitStatus: 'Execution Error',
      });
      showToast('Execution failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Step-by-Step Mentor Code Review
  const handleAskMentor = async () => {
    setIsAskingMentor(true);
    showToast(`${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is analyzing your code and telemetry...`, 'info');
    try {
      const hint = await aiService.getCodeHint({
        code,
        language,
        error: runResult?.error || runResult?.compilerError || runResult?.stderr,
        output: runResult?.output,
        stdin,
        type: 'explain',
        mentorVoice: preferredMentor,
      });
      setMentorHint(hint);
    } catch (e) {
      showToast('Mentor analysis unavailable', 'error');
    } finally {
      setIsAskingMentor(false);
    }
  };

  // Progressive Hints (Hint 1, Hint 2, Hint 3)
  const handleGetHint = async (levelOverride?: number) => {
    const targetLevel = levelOverride || hintLevel;
    setIsAskingMentor(true);
    showToast(`Fetching Progressive Hint ${targetLevel} of 3...`, 'info');
    try {
      const hint = await aiService.getCodeHint({
        code,
        language,
        error: runResult?.error || runResult?.compilerError || runResult?.stderr,
        output: runResult?.output,
        stdin,
        hintLevel: targetLevel,
        type: 'hint',
        mentorVoice: preferredMentor,
      });
      setMentorHint(hint);
      setHintLevel(targetLevel < 3 ? targetLevel + 1 : 1);
    } catch (e) {
      showToast('Hint generator unavailable', 'error');
    } finally {
      setIsAskingMentor(false);
    }
  };

  // Reveal Full Solution
  const handleRevealSolution = async () => {
    setIsAskingMentor(true);
    showToast(`${preferredMentor === 'astra' ? 'Astra' : 'Orion'} is generating the full robust solution...`, 'info');
    try {
      const solution = await aiService.getCodeHint({
        code,
        language,
        error: runResult?.error || runResult?.compilerError,
        output: runResult?.output,
        stdin,
        type: 'solution',
        mentorVoice: preferredMentor,
      });
      setMentorHint(solution);
    } finally {
      setIsAskingMentor(false);
    }
  };

  // Reset Code
  const handleResetCode = () => {
    if (window.confirm('Reset code back to original starter template?')) {
      handleLanguageChange(language);
      showToast('Code reset to default starter template', 'info');
    }
  };

  // Format Code (basic clean indentation)
  const handleFormatCode = () => {
    try {
      const lines = code.split('\n').map((l) => l.trimRight());
      setCode(lines.join('\n'));
      showToast('Code indentation cleaned', 'success');
    } catch {
      showToast('Formatting completed', 'info');
    }
  };

  // Download / Export File
  const handleDownloadFile = () => {
    const extensions: Record<CodeLanguage, string> = {
      python: 'py',
      cpp: 'cpp',
      javascript: 'js',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    const ext = extensions[language] || 'txt';
    const filename = `${activeProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename}`, 'success');
  };

  // Save Project Manually
  const handleSaveProject = () => {
    const updated = {
      ...activeProject,
      code,
      cssCode,
      stdin,
      language,
      lastRunOutput: runResult?.output,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
    soundManager.playAchievementChime();
    showToast('Project saved securely to your workspace!', 'success');
  };

  const lineCount = code.split('\n').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar with Language Selector, Starter Templates, Controls */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderRadius: '16px',
        }}
      >
        {/* Left: Language & Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={18} color="#00f2fe" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as CodeLanguage)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#00f2fe',
                fontWeight: 700,
                fontSize: '13px',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              <option value="python">Python 3 (Isolated Remote Sandbox)</option>
              <option value="cpp">C++ 20 (GCC Remote Sandbox)</option>
              <option value="javascript">JavaScript (Node.js Remote Sandbox)</option>
              <option value="sql">SQL (SQLite Relational Sandbox)</option>
              <option value="html">HTML5 / CSS3 Live Sandbox</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={16} color="#94a3b8" />
            <select
              value={activeProject.id}
              onChange={(e) => {
                const p = projects.find((proj) => proj.id === e.target.value);
                if (p) handleSelectProject(p);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontSize: '12.5px',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title} ({proj.language})
                </option>
              ))}
            </select>
          </div>

          {/* Autosave Status Indicator */}
          <span style={{ fontSize: '11px', color: autosaveStatus === 'saving' ? '#fbbf24' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: autosaveStatus === 'saving' ? '#fbbf24' : '#10b981' }} />
            {autosaveStatus === 'saving' ? 'Saving...' : 'Autosaved'}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Format Button */}
          <button
            onClick={handleFormatCode}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Clean code formatting"
          >
            <RefreshCw size={13} />
            <span>Format</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleResetCode}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Reset code to starter template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          {/* Export / Download */}
          <button
            onClick={handleDownloadFile}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Export code file"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          {/* Progressive Hint Button */}
          <button
            onClick={() => handleGetHint()}
            disabled={isAskingMentor}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <HelpCircle size={14} />
            <span>Hint ({hintLevel}/3)</span>
          </button>

          {/* Ask Mentor Button */}
          <button
            onClick={handleAskMentor}
            disabled={isAskingMentor}
            className="gradient-btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            <Sparkles size={14} color="#00f2fe" />
            <span>Ask {preferredMentor === 'astra' ? 'Astra' : 'Orion'}</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="gradient-btn-primary"
            style={{ fontSize: '12.5px', padding: '7px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={14} fill="#090e17" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Console/Preview Split Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px',
          minHeight: '520px',
        }}
      >
        {/* Left: Code Editor Container */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#070b14',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Editor Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.4)',
              fontSize: '12px',
              color: '#94a3b8',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#00f2fe', fontWeight: 600 }}>main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'javascript' ? 'js' : language === 'sql' ? 'sql' : 'html'}</span>
              <span>• Isolated Sandbox</span>
            </div>
            <span>{lineCount} lines</span>
          </div>

          {/* Code Textarea with Line Numbers */}
          <div style={{ display: 'flex', flex: 1, minHeight: '440px', position: 'relative' }}>
            {/* Line numbers bar */}
            <div
              style={{
                width: '46px',
                background: '#04070d',
                color: '#475569',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '14px 8px',
                textAlign: 'right',
                userSelect: 'none',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                lineHeight: '21px',
              }}
            >
              {Array.from({ length: Math.max(lineCount, 18) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Actual code input */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono, "Fira Code", monospace)',
                fontSize: '13.5px',
                lineHeight: '21px',
                padding: '14px 16px',
                resize: 'none',
                outline: 'none',
                boxShadow: 'none',
                whiteSpace: 'pre',
                tabSize: 4,
              }}
            />
          </div>

          {/* Auxiliary CSS code input for HTML mode */}
          {(language === 'html' || language === 'css') && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 16px', background: '#050810' }}>
              <div style={{ fontSize: '12px', color: '#00f2fe', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                CSS Stylesheet
              </div>
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: '#090d18',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              />
            </div>
          )}
        </div>

        {/* Right: Output Console / Live HTML Preview / Custom Stdin / History */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#070b14',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Header with Navigation Tabs & Execution Telemetry */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.4)',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('console')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: activeTab === 'console' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  color: activeTab === 'console' ? '#00f2fe' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Terminal size={13} />
                <span>Console Output</span>
              </button>

              <button
                onClick={() => setActiveTab('stdin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: activeTab === 'stdin' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  color: activeTab === 'stdin' ? '#00f2fe' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Layers size={13} />
                <span>Custom Input (stdin){stdin.trim() ? ' • active' : ''}</span>
              </button>

              {(language === 'html' || language === 'css') && (
                <button
                  onClick={() => setActiveTab('preview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: activeTab === 'preview' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                    color: activeTab === 'preview' ? '#00f2fe' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Eye size={13} />
                  <span>Live Render Preview</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: activeTab === 'history' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  color: activeTab === 'history' ? '#00f2fe' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Clock size={13} />
                <span>Run History ({runHistory.length})</span>
              </button>
            </div>

            {/* Execution Telemetry Badges */}
            {runResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {runResult.exitStatus && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: runResult.error || runResult.compilerError ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: runResult.error || runResult.compilerError ? '#f43f5e' : '#34d399',
                      border: runResult.error || runResult.compilerError ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    {runResult.exitStatus}
                  </span>
                )}
                <span style={{ color: '#94a3b8' }}>{runResult.executionTimeMs}ms</span>
                {runResult.memoryKb && (
                  <span style={{ color: '#94a3b8' }}>{(runResult.memoryKb / 1024).toFixed(1)}MB</span>
                )}
              </div>
            )}
          </div>

          {/* Console Output Screen */}
          {activeTab === 'console' && (
            <div
              style={{
                flex: 1,
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Compiler Error / Diagnostics Box */}
              {runResult?.compilerError && (
                <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} />
                    <span>Compiler Output & Diagnostics</span>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#fca5a5' }}>
                    {runResult.compilerError}
                  </pre>
                </div>
              )}

              {/* Standard Error (Tracebacks) */}
              {runResult?.stderr && (
                <div style={{ color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(251, 146, 60, 0.3)' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px' }}>Standard Error (stderr):</div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, color: '#fdba74' }}>
                    {runResult.stderr}
                  </pre>
                </div>
              )}

              {/* Resource-limit / Timeout Explanations */}
              {runResult?.error && !runResult.compilerError && (
                <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {runResult.error}
                  </pre>
                </div>
              )}

              {/* Standard Output (stdout) */}
              {runResult?.output && (
                <div style={{ color: '#38bdf8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {runResult.output}
                </div>
              )}

              {/* SQL Structured Table View */}
              {runResult?.sqlTable && (
                <div style={{ overflowX: 'auto', marginTop: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe' }}>
                        {runResult.sqlTable.columns.map((col, idx) => (
                          <th key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runResult.sqlTable.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '7px 12px', color: '#cbd5e1' }}>
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!runResult?.output && !runResult?.error && !runResult?.compilerError && (
                <div style={{ color: '#64748b', fontStyle: 'italic', padding: '12px' }}>
                  No output yet. Write your program and click "Run Code" to execute.
                </div>
              )}
            </div>
          )}

          {/* Stdin / Custom Input Tab */}
          {activeTab === 'stdin' && (
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600 }}>
                Standard Input (stdin)
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Provide input values line by line for functions like Python's \`input()\`, C++'s \`std::cin\`, or Node's \`readline\`.
              </p>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter custom stdin inputs here (e.g. 42 or user names)..."
                style={{
                  flex: 1,
                  background: '#03050a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  resize: 'none',
                }}
              />
            </div>
          )}

          {/* Live HTML/CSS Render Preview */}
          {activeTab === 'preview' && (
            <div style={{ flex: 1, background: '#fff', position: 'relative' }}>
              <iframe
                title="Live Sandbox Preview"
                srcDoc={`<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${code}</body></html>`}
                sandbox="allow-scripts"
                style={{ width: '100%', height: '100%', border: 'none', background: '#080d1a' }}
              />
            </div>
          )}

          {/* Run History Tab */}
          {activeTab === 'history' && (
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, marginBottom: '10px' }}>
                Recent Remote Execution Runs
              </div>
              {runHistory.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                  No previous runs in this session.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {runHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#00f2fe', textTransform: 'uppercase' }}>{item.language}</span>
                        <span style={{ color: '#64748b' }}>•</span>
                        <span style={{ color: '#94a3b8' }}>{item.timestamp}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94a3b8' }}>{item.executionTimeMs}ms</span>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: item.hasError ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: item.hasError ? '#f43f5e' : '#34d399',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mentor Guidance / Hints Panel (Rendered with MarkdownRenderer) */}
      {mentorHint && (
        <div
          className="glass-card"
          style={{
            padding: '20px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            background: 'rgba(11, 19, 36, 0.9)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#00f2fe" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                {preferredMentor === 'astra' ? 'Astra' : 'Orion'}'s Code Analysis & Progressive Guidance
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Progressive Hint Next */}
              <button
                onClick={() => handleGetHint()}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  cursor: 'pointer',
                }}
              >
                Next Hint ({hintLevel}/3)
              </button>

              {/* Reveal Solution */}
              <button
                onClick={handleRevealSolution}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: 'rgba(0, 242, 254, 0.12)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  color: '#00f2fe',
                  cursor: 'pointer',
                }}
              >
                Reveal Solution
              </button>

              <button
                onClick={() => setMentorHint(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>
          </div>

          <MarkdownRenderer content={mentorHint} />
        </div>
      )}
    </div>
  );
}
