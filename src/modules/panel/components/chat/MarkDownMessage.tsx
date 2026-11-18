import type { ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

// ELEMENTOS MARKDOWN MAPEADOS A LAS CLASES DEL PROYECTO (TAILWIND RESETEA LOS ESTILOS DE h1/h2/ul)
const MD_COMPONENTS: Components = {
  h1: ({ children }) => <h3 className="mb-1 mt-3 text-base font-bold text-text-primary first:mt-0">{children}</h3>,
  h2: ({ children }) => <h4 className="mb-1 mt-3 text-sm font-bold text-text-primary first:mt-0">{children}</h4>,
  h3: ({ children }) => <h5 className="mb-1 mt-2 text-sm font-semibold text-text-primary first:mt-0">{children}</h5>,
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  pre: ({ children }) => <pre className="mb-2 overflow-x-auto rounded-lg bg-bg-hover p-2 text-xs last:mb-0">{children}</pre>,
  code: ({ children }) => <code className="rounded bg-bg-hover px-1 py-0.5 text-xs">{children}</code>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-violet underline">
      {children}
    </a>
  ),
}

// RENDERIZA EL TEXTO DE LA IA COMO MARKDOWN. SEGURO: IGNORA HTML CRUDO Y NO PERMITE IMAGENES.
const MarkdownMessage = ({ content }: { content: string }): ReactNode => (
  <Markdown
    remarkPlugins={[remarkGfm, remarkBreaks]}
    skipHtml
    allowElement={(element) => element.tagName !== 'img'}
    components={MD_COMPONENTS}
  >
    {content}
  </Markdown>
)

export default MarkdownMessage
