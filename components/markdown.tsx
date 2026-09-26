import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** The app's reading style for long-form text, shared with lesson pages. */
export const proseClass =
  "prose prose-invert max-w-none prose-headings:font-display prose-headings:text-slate-50 prose-h2:text-amber-100 prose-a:text-amber-300 prose-blockquote:border-amber-400/60 prose-blockquote:font-display prose-blockquote:text-lg prose-blockquote:text-slate-200 prose-strong:text-slate-50 prose-li:marker:text-amber-400/70 prose-hr:border-white/10 prose-th:text-slate-200";

/** Renders teacher-written Markdown in the app's reading style. Raw HTML is not rendered. */
export function Markdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <div className={`${proseClass} ${compact ? "prose-h2:mt-6" : "prose-h2:mt-10 prose-h2:border-t prose-h2:border-white/10 prose-h2:pt-8 sm:prose-lg"}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="-mx-1 overflow-x-auto px-1">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
