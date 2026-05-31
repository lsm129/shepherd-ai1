'use client';


import { useState } from 'react';
import { noSelectStyle, noSelectEvents } from '@/lib/no-select';

// Labels are inline strings

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'email', label: 'Email' },
  { value: 'all', label: 'All Platforms' },
];

const STYLES = [
  { value: 'inspirational', label: 'Inspirational ✨' },
  { value: 'educational', label: 'Educational 📚' },
  { value: 'engaging', label: 'Engaging 💬' },
  { value: 'question', label: 'Question ❓' },
];

type GeneratedPost = {
  content: string;
  platform: string;
  style: string;
  scheduledAt: string | null;
};

export default function BatchContentPage() {
  const [sermonContent, setSermonContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['all']);
  const [style, setStyle] = useState('inspirational');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);



  const handlePlatformToggle = (value: string) => {
    if (value === 'all') {
      setSelectedPlatforms(['all']);
      return;
    }
    setSelectedPlatforms((prev) => {
      const filtered = prev.filter((p) => p !== 'all');
      if (filtered.includes(value)) {
        const next = filtered.filter((p) => p !== value);
        return next.length === 0 ? ['all'] : next;
      }
      return [...filtered, value];
    });
  };

  const handleGenerate = async () => {
    setError('');
    if (!sermonContent.trim()) {
      setError('Please enter sermon content.');
      return;
    }

    const platform = selectedPlatforms.includes('all')
      ? 'all'
      : selectedPlatforms[0] || 'all';

    setLoading(true);
    try {
      const res = await fetch('/api/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sermonContent: sermonContent.trim(),
          platform,
          count,
          style,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError('Quota exceeded. Please upgrade your plan.');
        } else {
          setError(data.error || 'Generation failed. Please try again.');
        }
        return;
      }

      setResults(data.results || []);
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditContent(results[index].content);
  };

  const handleSave = (index: number) => {
    setResults((prev) =>
      prev.map((item, i) => (i === index ? { ...item, content: editContent } : item))
    );
    setEditingIndex(null);
    setEditContent('');
  };

  return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ✨ {'Batch Content Creator'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {'Turn one sermon into multiple social media posts'}
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          {/* Sermon Content */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {'Sermon Content'}
            </label>
            <textarea
              className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
              placeholder={'Paste your sermon content here...'}
              value={sermonContent}
              onChange={(e) => setSermonContent(e.target.value)}
            />
          </div>

          {/* Platform Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {'Platforms'}
            </label>
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((p) => (
                <label
                  key={p.value}
                  className={`inline-flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlatforms.includes(p.value)
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedPlatforms.includes(p.value)}
                    onChange={() => handlePlatformToggle(p.value)}
                  />
                  {p.value === 'all' ? 'All Platforms' : p.label}
                </label>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {'Style'}
            </label>
            <div className="flex flex-wrap gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    style === s.value
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {'Number of Posts'}
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {'Free: 5 | Starter: 20 | Pro/Growth: 50'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {'Generating...'}
              </>
            ) : (
              <>{'Generate'}</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {'Generated Content'} ({results.length})
            </h2>
            <div className="space-y-4">
              {results.map((post, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
                >
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {post.platform}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      {post.style}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">#{index + 1}</span>
                  </div>

                  {/* Content — with anti-copy protection */}
                  {editingIndex === index ? (
                    <textarea
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y min-h-[80px]"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div
                      style={noSelectStyle}
                      {...noSelectEvents}
                      className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed"
                    >
                      {post.content}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(post.content, index)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {'Copied!'}
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {'Copy'}
                        </>
                      )}
                    </button>

                    {/* Edit / Save */}
                    {editingIndex === index ? (
                      <button
                        onClick={() => handleSave(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {'Save'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {'Edit'}
                      </button>
                    )}

                    {/* Schedule — placeholder for future implementation */}
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ml-auto"
                      title="Schedule for later"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {'Schedule'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {results.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            {'No content generated yet.'}
          </div>
        )}
      </div>
    </div>
        );
}
