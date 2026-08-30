"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────
   의존성 없는 경량 마크다운 렌더러.
   지원: 제목, 문단, 굵게/기울임/인라인코드/링크, 순서·비순서 목록,
   인용, 구분선, 언어 태그가 붙은 펜스 코드블록(+복사, 경량 하이라이트).
   표 등 그 외 문법은 평문으로 흘려보낸다.
   ────────────────────────────────────────────────────────────── */

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "para"; text: string }
  | { kind: "code"; lang: string; content: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "hr" };

const FENCE_RE = /^ {0,3}(```+|~~~+)\s*([\w+#-]*)\s*$/;
const LIST_RE = /^ {0,3}([-*+]|\d+[.)])\s+/;
const HEADING_RE = /^ {0,3}(#{1,6})\s+(.*)$/;
const HR_RE = /^ {0,3}([-*_])[ \t]*(?:\1[ \t]*){2,}$/;
const QUOTE_RE = /^ {0,3}>\s?/;

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(FENCE_RE);
    if (fence) {
      const closeRe = new RegExp(`^ {0,3}${fence[1][0] === "`" ? "```+" : "~~~+"}\\s*$`);
      i++;
      const code: string[] = [];
      while (i < lines.length && !closeRe.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // 닫는 펜스 건너뛰기
      blocks.push({ kind: "code", lang: fence[2].toLowerCase(), content: code.join("\n") });
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2].trim() });
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    if (QUOTE_RE.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        quote.push(lines[i].replace(QUOTE_RE, ""));
        i++;
      }
      blocks.push({ kind: "quote", text: quote.join("\n") });
      continue;
    }

    if (LIST_RE.test(line)) {
      const ordered = /^ {0,3}\d+[.)]/.test(line);
      const items: string[] = [];
      while (i < lines.length && LIST_RE.test(lines[i])) {
        items.push(lines[i].replace(LIST_RE, ""));
        i++;
        while (
          i < lines.length &&
          lines[i].trim() &&
          !LIST_RE.test(lines[i]) &&
          /^\s+\S/.test(lines[i])
        ) {
          items[items.length - 1] += `\n${lines[i].trim()}`;
          i++;
        }
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !FENCE_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !QUOTE_RE.test(lines[i]) &&
      !LIST_RE.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "para", text: para.join("\n") });
  }

  return blocks;
}

/* ── 인라인 ── */

const INLINE_RE =
  /(`[^`]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*|_[^_\n]+_)|(\[[^\]\n]+\]\([^)\s]+\))/;

function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:\/\/|mailto:)/i.test(url)) return url;
  if (url.startsWith("/") || url.startsWith("#")) return url;
  return null;
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let k = 0;

  while (rest) {
    const m = rest.match(INLINE_RE);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const token = m[0];
    const key = `${keyBase}-${k++}`;

    if (token.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-[#e6d7ff]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = safeHref(linkMatch[2]);
      out.push(
        href ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8c9bff] underline decoration-white/30 underline-offset-2 hover:decoration-[#8c9bff]"
          >
            {linkMatch[1]}
          </a>
        ) : (
          <Fragment key={key}>{linkMatch[1]}</Fragment>
        )
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    rest = rest.slice(m.index + token.length);
  }

  return out;
}

function renderMultiline(text: string, keyBase: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.flatMap((line, idx) => [
    ...renderInline(line, `${keyBase}-l${idx}`),
    idx < lines.length - 1 ? <br key={`${keyBase}-br${idx}`} /> : null,
  ]);
}

/* ── 경량 코드 하이라이트 ── */

const KEYWORDS = new Set([
  "abstract", "as", "async", "await", "break", "case", "catch", "class", "const", "continue",
  "def", "default", "delete", "do", "elif", "else", "enum", "export", "extends", "false",
  "finally", "for", "from", "function", "if", "implements", "import", "in", "instanceof",
  "interface", "is", "lambda", "let", "new", "none", "null", "or", "and", "not", "package",
  "pass", "private", "protected", "public", "raise", "readonly", "return", "self", "static",
  "super", "switch", "this", "throw", "true", "try", "type", "typeof", "undefined", "var",
  "void", "while", "with", "yield", "print", "func", "struct", "fn", "mut", "use", "impl",
]);

const HASH_COMMENT_LANGS = new Set([
  "py", "python", "bash", "sh", "shell", "zsh", "ruby", "rb", "yaml", "yml", "toml", "r", "perl", "makefile",
]);

const STRING_NUM_WORD =
  `("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|(\\b\\d[\\w.]*\\b)|([A-Za-z_$][\\w$]*)`;
const TOKEN_RE_SLASH = new RegExp(`(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|${STRING_NUM_WORD}`, "g");
const TOKEN_RE_HASH = new RegExp(
  `((?:\\/\\/|#)[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)|${STRING_NUM_WORD}`,
  "g"
);

function highlight(code: string, lang: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = new RegExp(
    (HASH_COMMENT_LANGS.has(lang) ? TOKEN_RE_HASH : TOKEN_RE_SLASH).source,
    "g"
  );

  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) nodes.push(code.slice(last, m.index));
    const [tok, comment, str, num, word] = m;
    const key = `t${k++}`;
    if (comment) nodes.push(<span key={key} className="text-[#6a7385] italic">{tok}</span>);
    else if (str) nodes.push(<span key={key} className="text-[#9ecbff]">{tok}</span>);
    else if (num) nodes.push(<span key={key} className="text-[#f0b072]">{tok}</span>);
    else if (word && KEYWORDS.has(word.toLowerCase()))
      nodes.push(<span key={key} className="text-[#c792ea]">{tok}</span>);
    else nodes.push(tok);
    last = m.index + tok.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 클립보드 미허용 환경 무시 */
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b12]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-white/35">
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          className="rounded px-2 py-0.5 text-[11px] text-white/45 transition hover:bg-white/10 hover:text-white/80"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3.5 py-3 text-[13px] leading-relaxed">
        <code className="font-mono text-white/85">{highlight(content, lang)}</code>
      </pre>
    </div>
  );
}

export default function Markdown({ text }: { text: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);

  return (
    <div className="space-y-3 text-[14px] leading-relaxed text-white/85">
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.kind) {
          case "code":
            return <CodeBlock key={key} lang={block.lang} content={block.content} />;
          case "heading": {
            const size =
              block.level <= 1 ? "text-lg" : block.level === 2 ? "text-base" : "text-[15px]";
            return (
              <p key={key} className={`${size} mt-4 font-bold text-white first:mt-0`}>
                {renderInline(block.text, key)}
              </p>
            );
          }
          case "list":
            return block.ordered ? (
              <ol key={key} className="list-decimal space-y-1 pl-5 marker:text-white/40">
                {block.items.map((it, j) => (
                  <li key={j}>{renderMultiline(it, `${key}-${j}`)}</li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="list-disc space-y-1 pl-5 marker:text-white/40">
                {block.items.map((it, j) => (
                  <li key={j}>{renderMultiline(it, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="border-l-2 border-[#6C7CFF]/50 pl-3 text-white/65"
              >
                {renderMultiline(block.text, key)}
              </blockquote>
            );
          case "hr":
            return <hr key={key} className="border-white/10" />;
          default:
            return (
              <p key={key} className="whitespace-pre-wrap break-words">
                {renderMultiline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
