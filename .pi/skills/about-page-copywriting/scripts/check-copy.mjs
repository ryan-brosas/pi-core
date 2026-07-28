#!/usr/bin/env node
import fs from "node:fs";

const inputPath = process.argv[2];
const raw = inputPath ? fs.readFileSync(inputPath, "utf8") : fs.readFileSync(0, "utf8");

const withoutFrontmatter = raw.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");
const visible = withoutFrontmatter
  .replace(/```[\s\S]*?```/g, " ")
  .replace(/`[^`]*`/g, " ")
  .replace(/https?:\/\/\S+/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/^#{1,6}\s+(.+)$/gm, "$1.")
  .replace(/^[-*+]\s+/gm, "")
  .replace(/^\d+[.)]\s+/gm, "")
  .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  .replace(/[>*_~]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const words = visible.match(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+/g) ?? [];
const sentences = visible
  .split(/[.!?]+|\n+/)
  .map((part) => part.trim())
  .filter((part) => /[A-Za-z0-9]/.test(part));

function syllables(value) {
  const word = value.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 1;
  if (word.length <= 3) return 1;
  const trimmed = word
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/i, "")
    .replace(/^y/, "");
  return Math.max(1, (trimmed.match(/[aeiouy]{1,2}/g) ?? []).length);
}

const wordCount = Math.max(1, words.length);
const sentenceCount = Math.max(1, sentences.length);
const syllableCount = words.reduce((sum, word) => sum + syllables(word), 0);
const grade = 0.39 * (wordCount / sentenceCount)
  + 11.8 * (syllableCount / wordCount)
  - 15.59;

const stockPatterns = [
  /\bin today['’]s\b/i,
  /\bever[- ]evolving\b/i,
  /\bdelve\b/i,
  /\bunlock\b/i,
  /\bseamless\b/i,
  /\brobust\b/i,
  /\btransformative\b/i,
  /\brevolutionary\b/i,
  /\bcutting[- ]edge\b/i,
  /\bgame[- ]changer\b/i,
  /\blandscape\b/i,
  /\bjourney\b/i,
  /\btestament\b/i,
  /\bnot just\b[^.!?]{0,80}\bbut\b/i,
  /\bbest[- ]in[- ]class\b/i,
];

const violations = [];
const emDashes = (visible.match(/—/g) ?? []).length;
const colons = (visible.match(/:/g) ?? []).length;
if (emDashes > 0) violations.push(`${emDashes} em dash${emDashes === 1 ? "" : "es"}`);
if (colons > 0) violations.push(`${colons} colon${colons === 1 ? "" : "s"}`);
for (const pattern of stockPatterns) {
  const match = visible.match(pattern);
  if (match) violations.push(`stock phrase "${match[0]}"`);
}
if (grade > 6) violations.push(`reading grade ${grade.toFixed(1)} is above 6`);

console.log(`Reading grade ${grade.toFixed(1)}`);
console.log(`Words ${words.length}`);
console.log(`Sentences ${sentences.length}`);
console.log(`Em dashes ${emDashes}`);
console.log(`Colons ${colons}`);
if (violations.length > 0) {
  console.log("Violations");
  for (const violation of violations) console.log(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Copy check passed");
}
