'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // html
import { Copy, Check, Play, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onRunInCodeLab?: (code: string, language: string) => void;
}

/**
 * Safely normalizes markdown content to prevent:
 * - Accidental JSON-encoded quoted strings
 * - Double-escaped backslashes and line breaks (\\n -> \n)
 * - Escaped markdown symbols (\*\* -> **, \`\`\` -> ```, etc.)
 * - Raw escape backslashes displayed to users
 */
export function normalizeMarkdown(raw: string | undefined | null): string {
  if (!raw) return '';

  let text = String(raw);

  // 1. If the content is an accidentally JSON-encoded string (e.g. starts and ends with double quotes)
  const trimmed = text.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith('"{') && trimmed.endsWith('}"'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') {
        text = parsed;
      }
    } catch {
      // If parsing fails, proceed with raw text
    }
  }

  // 2. Convert literal escaped newlines into real newline characters
  // Only convert \n that aren't preceded by an odd number of backslashes inside a literal regex
  text = text.replace(/\\r\\n/g, '\n');
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\t/g, '\t');

  // 3. Fix escaped code fences: \`\`\` -> ```
  text = text.replace(/\\`\\`\\`/g, '```');

  // 4. Fix escaped bold, headers, lists, italics, links, and tables
  // \*\*text\*\* -> **text**
  text = text.replace(/\\\*\\\*/g, '**');
  // \*text\* -> *text* (when preceded by backslash)
  text = text.replace(/\\\*/g, '*');
  // \# -> # (headers)
  text = text.replace(/^\\([#]+)/gm, '$1');
  text = text.replace(/\s\\([#]+)/g, ' $1');
  // \_ -> _
  text = text.replace(/\\_/g, '_');
  // \`inline\` -> `inline`
  text = text.replace(/\\`/g, '`');
  // \[text\]\(url\) -> [text](url)
  text = text.replace(/\\\[/g, '[');
  text = text.replace(/\\\]/g, ']');
  text = text.replace(/\\\(/g, '(');
  text = text.replace(/\\\)/g, ')');
  // \- or \+ -> - or + (lists)
  text = text.replace(/^\\([-\+\*])\s/gm, '$1 ');

  // 5. Clean standalone accidental backslashes at end of lines or before spaces
  text = text.replace(/\\\s*\n/g, '\n');

  return text;
}

export default function MarkdownRenderer({ content, onRunInCodeLab }: MarkdownRendererProps) {
  const normalized = normalizeMarkdown(content);

  return (
    <div className="orbit-markdown-container">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom Code Block & Inline Code
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1].toLowerCase() : '';
            const codeString = String(children).replace(/\n$/, '');

            if (inline) {
              return (
                <code
                  style={{
                    background: 'rgba(0, 242, 254, 0.1)',
                    color: '#38bdf8',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
                    fontSize: '0.88em',
                    border: '1px solid rgba(0, 242, 254, 0.2)',
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlockWithActions
                code={codeString}
                language={language || 'code'}
                onRunInCodeLab={onRunInCodeLab}
              />
            );
          },

          // Headings
          h1({ children }) {
            return (
              <h1 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#f8fafc',
                marginTop: '18px',
                marginBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#38bdf8',
                marginTop: '16px',
                marginBottom: '8px',
              }}>
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#e2e8f0',
                marginTop: '14px',
                marginBottom: '6px',
              }}>
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#94a3b8',
                marginTop: '12px',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {children}
              </h4>
            );
          },

          // Paragraphs
          p({ children }) {
            return (
              <p style={{
                margin: '0 0 12px 0',
                lineHeight: 1.68,
                color: '#e2e8f0',
                fontSize: '14px',
              }}>
                {children}
              </p>
            );
          },

          // Lists
          ul({ children }) {
            return (
              <ul style={{
                margin: '0 0 14px 0',
                paddingLeft: '22px',
                lineHeight: 1.65,
                color: '#cbd5e1',
                fontSize: '14px',
              }}>
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol style={{
                margin: '0 0 14px 0',
                paddingLeft: '22px',
                lineHeight: 1.65,
                color: '#cbd5e1',
                fontSize: '14px',
              }}>
                {children}
              </ol>
            );
          },
          li({ children }) {
            return (
              <li style={{
                marginBottom: '6px',
              }}>
                {children}
              </li>
            );
          },

          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote style={{
                margin: '12px 0',
                padding: '10px 16px',
                borderLeft: '3px solid #00f2fe',
                background: 'rgba(0, 242, 254, 0.05)',
                borderRadius: '0 8px 8px 0',
                color: '#94a3b8',
                fontStyle: 'italic',
              }}>
                {children}
              </blockquote>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div style={{
                overflowX: 'auto',
                margin: '16px 0',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  textAlign: 'left',
                }}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead style={{
                background: 'rgba(0, 242, 254, 0.08)',
                borderBottom: '1px solid rgba(0, 242, 254, 0.2)',
                color: '#38bdf8',
                fontWeight: 600,
              }}>
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th style={{
                padding: '10px 14px',
                fontWeight: 600,
              }}>
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td style={{
                padding: '9px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
              }}>
                {children}
              </td>
            );
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#38bdf8',
                  textDecoration: 'none',
                  borderBottom: '1px dotted rgba(56, 189, 248, 0.6)',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#7dd3fc';
                  e.currentTarget.style.borderBottomColor = '#7dd3fc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#38bdf8';
                  e.currentTarget.style.borderBottomColor = 'rgba(56, 189, 248, 0.6)';
                }}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Interactive Code Block with syntax highlighting, copy button, and Code Lab runner
 */
function CodeBlockWithActions({
  code,
  language,
  onRunInCodeLab,
}: {
  code: string;
  language: string;
  onRunInCodeLab?: (code: string, language: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting with Prism
  let highlightedHtml = '';
  const langKey = language === 'js' ? 'javascript' : language === 'ts' ? 'typescript' : language === 'py' ? 'python' : language;
  if (Prism.languages[langKey]) {
    try {
      highlightedHtml = Prism.highlight(code, Prism.languages[langKey], langKey);
    } catch {
      highlightedHtml = '';
    }
  }

  // Display friendly language label
  const languageNames: Record<string, string> = {
    python: 'Python 3',
    py: 'Python 3',
    javascript: 'JavaScript',
    js: 'JavaScript',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    cpp: 'C++ 20',
    c: 'C',
    sql: 'SQL (SQLite)',
    html: 'HTML5',
    css: 'CSS3',
    bash: 'Bash / Shell',
    sh: 'Bash / Shell',
    json: 'JSON',
  };

  const displayLang = languageNames[language] || language.toUpperCase();

  const isExecutableInCodeLab = ['python', 'py', 'javascript', 'js', 'cpp', 'sql', 'html', 'css'].includes(language);

  return (
    <div style={{
      margin: '14px 0',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      background: '#090e17',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    }}>
      {/* Code Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          color: '#38bdf8',
          fontWeight: 600,
          letterSpacing: '0.03em',
        }}>
          <Terminal size={14} color="#00f2fe" />
          <span>{displayLang}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExecutableInCodeLab && onRunInCodeLab && (
            <button
              onClick={() => onRunInCodeLab(code, language)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(0, 242, 254, 0.12)',
                color: '#00f2fe',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Load and execute directly in Code Lab"
            >
              <Play size={11} fill="#00f2fe" />
              <span>Run in Code Lab</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: copied ? '#34d399' : '#cbd5e1',
              border: copied ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Body with Horizontal Scroll and Preserved Indentation */}
      <pre style={{
        margin: 0,
        padding: '16px',
        overflowX: 'auto',
        fontFamily: 'var(--font-mono, "Fira Code", "SFMono-Regular", Consolas, Menlo, monospace)',
        fontSize: '13px',
        lineHeight: 1.6,
        whiteSpace: 'pre',
        tabSize: 4,
        color: '#e2e8f0',
      }}>
        {highlightedHtml ? (
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}
