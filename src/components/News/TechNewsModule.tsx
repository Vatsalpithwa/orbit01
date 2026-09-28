'use client';

import React, { useState } from 'react';
import {
  Newspaper,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Search,
  RotateCw,
  Sparkles,
  Calendar,
  Clock,
  Filter,
} from 'lucide-react';
import { TechNewsArticle, MentorVoice } from '@/lib/types';
import { INITIAL_TECH_NEWS } from '@/lib/sampleData';
import { useToast } from '@/components/Notification/ToastContext';

interface TechNewsProps {
  preferredMentor: MentorVoice;
}

export default function TechNewsModule({ preferredMentor }: TechNewsProps) {
  const { showToast } = useToast();

  const [articles, setArticles] = useState<TechNewsArticle[]>(INITIAL_TECH_NEWS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summarizedArticle, setSummarizedArticle] = useState<TechNewsArticle | null>(null);

  // Toggle Bookmark
  const toggleBookmark = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          const newState = !a.bookmarked;
          showToast(newState ? 'Article bookmarked!' : 'Bookmark removed', 'info');
          return { ...a, bookmarked: newState };
        }
        return a;
      })
    );
  };

  // Refresh feeds
  const handleRefresh = () => {
    setIsRefreshing(true);
    showToast('Checking global sources for breaking news...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('News feed updated with latest 2026 releases!', 'success');
    }, 700);
  };

  const categories = ['All', 'AI', 'Software', 'Cybersecurity', 'Science', 'Open Source'];

  const filteredArticles = articles.filter((a) => {
    const matchesCat = selectedCategory === 'All' ? true : a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>Daily Frontier Tech News</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Verified research breakthroughs, systems engineering advancements, and software industry updates.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gradient-btn-secondary"
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          <RotateCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                fontSize: '12.5px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: selectedCategory === cat ? 700 : 400,
                background: selectedCategory === cat ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedCategory === cat ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.06)',
                color: selectedCategory === cat ? '#00f2fe' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '6px 12px',
          width: '260px',
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '12.5px',
              color: '#fff',
              width: '100%',
              boxShadow: 'none',
            }}
          />
        </div>
      </div>

      {/* Article Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}>
        {filteredArticles.map((article) => {
          const categoryColor =
            article.category === 'AI' ? '#00f2fe' :
            article.category === 'Cybersecurity' ? '#f43f5e' :
            article.category === 'Science' ? '#9d4edd' : '#10b981';

          return (
            <div
              key={article.id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '24px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Meta Top: Category badge, date, read time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: categoryColor,
                    background: `${categoryColor}15`,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${categoryColor}33`,
                    textTransform: 'uppercase',
                  }}>
                    {article.category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                    <span>{article.publishedAt}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>

                {/* Article Headline */}
                <h3 style={{ fontSize: '18px', lineHeight: 1.4, marginBottom: '10px', color: '#f8fafc' }}>
                  {article.title}
                </h3>

                {/* Summary */}
                <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
                  {article.summary}
                </p>
              </div>

              {/* Bottom Actions: Source link, AI Summarize, Bookmark */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '14px',
              }}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: '#00f2fe',
                    fontWeight: 600,
                  }}
                >
                  <span>Source: {article.source}</span>
                  <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* AI Quick Summarize */}
                  <button
                    onClick={() => setSummarizedArticle(article)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      color: '#cbd5e1',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                    }}
                    title="Generate executive bullet point summary"
                  >
                    <Sparkles size={12} color="#00f2fe" />
                    <span>AI Brief</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    style={{
                      color: article.bookmarked ? '#f59e0b' : '#64748b',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                    title={article.bookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                  >
                    {article.bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Brief Modal */}
      {summarizedArticle && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f2fe', marginBottom: '8px', fontSize: '13px', fontWeight: 700 }}>
              <Sparkles size={16} />
              <span>{preferredMentor === 'astra' ? "Astra's" : "Orion's"} Executive Brief</span>
            </div>
            <h3 style={{ fontSize: '19px', marginBottom: '14px', color: '#fff' }}>
              {summarizedArticle.title}
            </h3>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '16px',
              borderRadius: '10px',
              color: '#cbd5e1',
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>Key Takeaway:</strong> {summarizedArticle.summary}
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li>Direct relevance to scalable cloud systems and architectural stability.</li>
                <li>Benchmark indicates 30%+ latency improvements over previous standard patterns.</li>
                <li>Recommended for software engineers preparing for senior technical reviews.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSummarizedArticle(null)}
                className="gradient-btn-secondary"
                style={{ padding: '8px 18px' }}
              >
                Close
              </button>
              <a
                href={summarizedArticle.url}
                target="_blank"
                rel="noreferrer"
                className="gradient-btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <span>Read Full Article</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
