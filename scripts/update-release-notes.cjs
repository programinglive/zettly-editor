#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function updateReleaseNotes({
  rootDir = process.cwd(),
  releaseNotesRelativePath = path.join('docs', 'release-notes', 'RELEASE_NOTES.md'),
  changelogRelativePath = 'CHANGELOG.md',
  packageJsonRelativePath = 'package.json',
  now = () => new Date()
} = {}) {
  const releaseNotesPath = path.join(rootDir, releaseNotesRelativePath);
  if (!fs.existsSync(releaseNotesPath)) {
    console.log(`ℹ️  Release notes file not found at ${releaseNotesPath}; skipping update.`);
    return false;
  }

  const packageJsonPath = path.join(rootDir, packageJsonRelativePath);
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`ℹ️  package.json not found at ${packageJsonPath}; skipping release notes update.`);
    return false;
  }

  const changelogPath = path.join(rootDir, changelogRelativePath);
  if (!fs.existsSync(changelogPath)) {
    console.log(`ℹ️  CHANGELOG not found at ${changelogPath}; skipping release notes update.`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  if (!version) {
    console.log('ℹ️  package.json version is missing; skipping release notes update.');
    return false;
  }

  const releaseNotesContent = fs.readFileSync(releaseNotesPath, 'utf8');
  if (releaseNotesContent.includes(`| ${version} `) || releaseNotesContent.includes(`## ${version}`)) {
    console.log(`ℹ️  Release notes already contain version ${version}; skipping.`);
    return false;
  }

  const changelogContent = fs.readFileSync(changelogPath, 'utf8');
  const changelogInfo = extractChangelogInfo({ changelogContent, version });

  const releaseDate = changelogInfo.date || formatDate(now());
  const highlight = changelogInfo.highlight || changelogInfo.heading || 'See CHANGELOG for details.';
  const sectionHeading = changelogInfo.heading || '';
  const detailBullets = Array.isArray(changelogInfo.bullets) && changelogInfo.bullets.length > 0
    ? changelogInfo.bullets
    : [highlight];

  const updatedContent = insertReleaseNotesEntry({
    content: releaseNotesContent,
    version,
    releaseDate,
    highlight,
    sectionHeading,
    detailBullets
  });

  fs.writeFileSync(releaseNotesPath, updatedContent);
  console.log(`✅ Added release notes entry for version ${version}.`);
  return true;
}

function insertReleaseNotesEntry({ content, version, releaseDate, highlight, sectionHeading, detailBullets }) {
  const lines = content.split('\n');
  const headerSeparatorIndex = lines.findIndex((line) => line.trim().startsWith('|---------'));
  if (headerSeparatorIndex === -1) {
    throw new Error('Unable to locate release notes table header.');
  }

  const newRow = `| ${version} | ${releaseDate} | ${escapePipes(highlight)} |`;
  lines.splice(headerSeparatorIndex + 1, 0, newRow);

  const sectionLines = [];
  sectionLines.push('');
  const trimmedHeading = typeof sectionHeading === 'string' ? sectionHeading.trim() : '';
  const headingSuffix = trimmedHeading ? ` – ${trimmedHeading}` : '';
  sectionLines.push(`## ${version}${headingSuffix}`);
  sectionLines.push('');
  sectionLines.push(`Released on **${releaseDate}**.`);
  sectionLines.push('');
  for (const bullet of detailBullets) {
    sectionLines.push(`- ${bullet}`);
  }
  sectionLines.push('');

  const firstSectionIndex = lines.findIndex((line, idx) => idx > headerSeparatorIndex && line.startsWith('## '));
  if (firstSectionIndex === -1) {
    lines.push(...sectionLines);
  } else {
    lines.splice(firstSectionIndex, 0, ...sectionLines);
  }

  return lines.join('\n');
}

function extractChangelogInfo({ changelogContent, version }) {
  const versionHeadingRegex = new RegExp(`^### \\[${escapeRegExp(version)}\\][^\n]*`, 'm');
  const match = changelogContent.match(versionHeadingRegex);
  if (!match) {
    return {};
  }

  const headingIndex = match.index;
  const rest = changelogContent.slice(headingIndex + match[0].length);
  const nextVersionRegex = /^### \[[^\n]*\]/m;
  const nextVersionMatch = nextVersionRegex.exec(rest);
  const section = nextVersionMatch ? rest.slice(0, nextVersionMatch.index) : rest;

  const dateMatch = match[0].match(/\((\d{4}-\d{2}-\d{2})\)/);
  const date = dateMatch ? dateMatch[1] : undefined;

  const categoryRegex = /^###\s+([^\n]+)$/m;
  const categoryMatch = section.match(categoryRegex);
  let heading;
  if (categoryMatch) {
    heading = sanitizeText(categoryMatch[1]);
  }

  const bullets = [];
  const bulletRegex = /^\*\s+([^\n]+)$/gm;
  let bulletMatch;
  while ((bulletMatch = bulletRegex.exec(section)) !== null) {
    const sanitized = sanitizeText(bulletMatch[1]);
    if (!bullets.includes(sanitized)) {
      bullets.push(sanitized);
    }
  }

  const highlight = bullets.length > 0 ? bullets[0] : undefined;

  return {
    date,
    highlight,
    heading,
    bullets
  };
}

function sanitizeText(text) {
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapePipes(text) {
  return text.replace(/\|/g, '\\|');
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  updateReleaseNotes,
  insertReleaseNotesEntry,
  extractChangelogInfo,
  sanitizeText,
  escapePipes,
  formatDate
};

if (require.main === module) {
  try {
    updateReleaseNotes();
  } catch (error) {
    console.error(`❌ Failed to update release notes: ${error.message}`);
    process.exit(1);
  }
}
