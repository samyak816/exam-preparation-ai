import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-700 prose-strong:font-bold prose-li:marker:text-indigo-500 dark:prose-li:marker:text-indigo-400 prose-hr:border-gray-200 dark:prose-hr:border-gray-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
