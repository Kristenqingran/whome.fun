'use client';

import { useCallback, useState } from 'react';
import { Copy, Check, Download, Share2 } from 'lucide-react';
import { Locale } from '@/lib/types';

interface ShareCardProps {
  title: string;
  resultTitle: string;
  quizSlug: string;
  lang: Locale;
}

export function ShareCard({ title, resultTitle, quizSlug, lang }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${lang}/tests/${quizSlug}/result`
    : `/${lang}/tests/${quizSlug}/result`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${resultTitle} - ${title}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [title, resultTitle, shareUrl]);

  const handleSaveImage = useCallback(() => {
    alert('Image save coming soon!');
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-2">{resultTitle}</h3>
      <p className="text-white/80 mb-6">{title}</p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        <button
          onClick={handleSaveImage}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Save Image
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors md:hidden"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
