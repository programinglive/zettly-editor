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
  const npxArgs = ['--yes', 'husky'];
  const result = spawnSync('npx', npxArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    const exitCode = result.status === null || result.status === undefined ? 1 : result.status;
    const message = `husky prepare failed with exit code ${exitCode}`;
    process.stderr.write(`${message}\n`);
    if (result.error) {
      process.stderr.write(`error: ${result.error.message}\n`);
    }
    if (result.stderr) {
      process.stderr.write(`stderr: ${result.stderr.toString()}\n`);
    }
    process.exit(exitCode);
  }
} else {
  process.stdout.write(
    'Skipping husky prepare hook: Node.js 16.9.0 or newer is required.\n'
  );
}
