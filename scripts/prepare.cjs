#!/usr/bin/env node
const { spawnSync } = require('child_process');

function isNodeVersionCompatible() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (Number.isNaN(major) || Number.isNaN(minor)) {
    return false;
  }
  if (major > 16) {
    return true;
  }
  if (major === 16 && minor >= 9) {
    return true;
  }
  return false;
}

if (isNodeVersionCompatible()) {
  const result = spawnSync('npx', ['husky'], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status === null || result.status === undefined ? 1 : result.status);
  }
} else {
  process.stdout.write(
    'Skipping husky prepare hook: Node.js 16.9.0 or newer is required.\n'
  );
}
