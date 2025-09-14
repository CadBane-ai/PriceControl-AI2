#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, basename } from 'path';

/*
  Simple Markdown sharder:
  - Splits by level-2 headings (## ) outside of code fences
  - Writes each section to its own file with heading levels decreased by 1
  - Creates an index.md with the top content before first level-2 section
*/

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function adjustHeadingLevels(content) {
  // Decrease heading levels by 1: ## -> #, ### -> ##, etc., but keep # as #
  return content
    .split('\n')
    .map((line) => {
      if (/^```/.test(line)) return line; // handled by parser; leave as-is
      // Only adjust markdown heading lines that start with hashes followed by space
      const m = line.match(/^(#{2,6})\s+(.*)$/);
      if (m) {
        const hashes = m[1];
        const text = m[2];
        return '#'.repeat(Math.max(1, hashes.length - 1)) + ' ' + text;
      }
      return line;
    })
    .join('\n');
}

function shardMd(sourcePath, destDir) {
  const raw = readFileSync(sourcePath, 'utf8');
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const lines = raw.split(/\r?\n/);
  let inFence = false;
  let fenceTag = '';
  const sections = [];
  let current = { title: null, lines: [] };
  let preface = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // code fence toggle
    const fenceMatch = line.match(/^```(.*)$/);
    if (fenceMatch) {
      const tag = fenceMatch[1] || '';
      if (!inFence) {
        inFence = true;
        fenceTag = tag;
      } else {
        inFence = false;
        fenceTag = '';
      }
    }

    const isH2 = !inFence && /^##\s+/.test(line);
    if (isH2) {
      if (current.title) {
        // push previous section
        sections.push({ ...current });
      }
      current = { title: line.replace(/^##\s+/, '').trim(), lines: [line] };
    } else {
      if (current.title) {
        current.lines.push(line);
      } else {
        preface.push(line);
      }
    }
  }
  if (current.title) sections.push({ ...current });

  // Write index.md with preface transformed (# stays #, but we don't adjust top-level)
  // Keep original top-level title and intro before first ##
  const indexPath = `${destDir}/index.md`;
  const indexContent = preface.join('\n').trim() + '\n\n## Sections\n' +
    sections
      .map((s) => `- [${s.title}](./${slugify(s.title)}.md)`)
      .join('\n') + '\n';
  writeFileSync(indexPath, indexContent, 'utf8');

  // Write each section file with adjusted heading levels
  sections.forEach((s) => {
    const body = s.lines.join('\n');
    const adjusted = adjustHeadingLevels(body);
    const outPath = `${destDir}/${slugify(s.title)}.md`;
    writeFileSync(outPath, adjusted.trim() + '\n', 'utf8');
  });

  return { sections: sections.map((s) => s.title), indexPath };
}

function main() {
  const [,, src, dest] = process.argv;
  if (!src || !dest) {
    console.error('Usage: node shard-md.mjs <source.md> <dest-folder>');
    process.exit(1);
  }
  const result = shardMd(src, dest);
  console.log('Sharded sections:', result.sections.length);
  result.sections.forEach((t) => console.log('- ' + t));
  console.log('Index:', result.indexPath);
}

main();

