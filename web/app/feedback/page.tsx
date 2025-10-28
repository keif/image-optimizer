'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Bug, Lightbulb, ExternalLink, ThumbsUp, Calendar } from 'lucide-react';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
  reactions: {
    '+1': number;
  };
  user: {
    login: string;
    avatar_url: string;
  };
}

export default function FeedbackPage() {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'enhancement' | 'bug'>('all');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      // Fetch open issues from GitHub API (public, no auth needed)
      const response = await fetch(
        'https://api.github.com/repos/keif/image-optimizer/issues?state=open&per_page=50',
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch issues');

      const data = await response.json();
      // Filter out pull requests (they also show up in issues endpoint)
      const issuesOnly = data.filter((item: any) => !item.pull_request);
      setIssues(issuesOnly);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.labels.some(label => label.name === filter);
  });

  const enhancementCount = issues.filter(issue =>
    issue.labels.some(label => label.name === 'enhancement')
  ).length;

  const bugCount = issues.filter(issue =>
    issue.labels.some(label => label.name === 'bug')
  ).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Community Feedback
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Help shape the future of Image Optimizer. Vote on features, report bugs, and see what's being worked on.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <a
            href="https://github.com/keif/image-optimizer/issues/new?labels=enhancement&template=feature_request.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
              <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Request a Feature
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suggest new functionality or improvements
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </a>

          <a
            href="https://github.com/keif/image-optimizer/issues/new?labels=bug&template=bug_report.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-600 transition-all group"
          >
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
              <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Report a Bug
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Let us know what's broken or not working
              </p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          </a>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('enhancement')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'enhancement'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Features ({enhancementCount})
          </button>
          <button
            onClick={() => setFilter('bug')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'bug'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Bugs ({bugCount})
          </button>
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {filter !== 'all' ? filter + 's' : 'issues'} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to contribute feedback!
            </p>
            <a
              href={`https://github.com/keif/image-optimizer/issues/new?labels=${filter === 'bug' ? 'bug' : 'enhancement'}&template=${filter === 'bug' ? 'bug_report' : 'feature_request'}.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {filter === 'bug' ? 'Report Bug' : 'Request Feature'}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const isEnhancement = issue.labels.some(label => label.name === 'enhancement');
              const isBug = issue.labels.some(label => label.name === 'bug');

              return (
                <a
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      isBug
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {isBug ? (
                        <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {issue.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(issue.created_at)}
                        </span>
                        {issue.reactions['+1'] > 0 && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {issue.reactions['+1']}
                          </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-500">
                          #{issue.number}
                        </span>
                      </div>

                      {/* Labels */}
                      <div className="flex flex-wrap gap-2">
                        {issue.labels.map((label) => (
                          <span
                            key={label.name}
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `#${label.color}20`,
                              color: `#${label.color}`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Want to contribute?</h2>
          <p className="text-purple-100 mb-6">
            Check out open issues on GitHub and join the discussion
          </p>
          <a
            href="https://github.com/keif/image-optimizer/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
          >
            View all issues on GitHub
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
