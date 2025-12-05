#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { updateReleaseNotes } = require('./update-release-notes.cjs');

const fsFokPreloadPath = path.join(__dirname, 'preload', 'fs-f-ok.cjs');
const FS_FOK_PRELOAD_FLAG = buildPreloadFlag(fsFokPreloadPath);

require('./preload/fs-f-ok.cjs');

const VALID_RELEASE_TYPES = new Set([
  'major',
  'minor',
  'patch',
  'premajor',
  'preminor',
  'prepatch',
  'prerelease'
]);

const SEMVER_REGEX = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const LOCKFILE_PREFERENCES = [
  { manager: 'pnpm', file: 'pnpm-lock.yaml' },
  { manager: 'yarn', file: 'yarn.lock' },
  { manager: 'bun', file: 'bun.lockb' },
  { manager: 'npm', file: 'package-lock.json' }
];

function getCliArguments(argv = process.argv) {
  const rawArgs = argv.slice(2);
  if (rawArgs.length === 0) {
    return { releaseType: undefined, extraArgs: [] };
  }

  if (rawArgs[0].startsWith('-')) {
    return { releaseType: undefined, extraArgs: rawArgs };
  }

  const [firstArg, ...rest] = rawArgs;
  return { releaseType: firstArg, extraArgs: rest };
}

function getNpmRunArgument(env = process.env) {
  try {
    const npmArgs = JSON.parse(env.npm_config_argv || '{}');
    const original = npmArgs.original || [];
    const releaseIndex = original.lastIndexOf('release');
    if (releaseIndex !== -1) {
      return original[releaseIndex + 1];
    }
  } catch (error) {
    // Ignore JSON parsing issues and fall back to defaults
  }
  return undefined;
}

function buildStandardVersionArgs({ releaseType, extraArgs }) {
  const args = [];
  if (releaseType) {
    const normalized = releaseType.trim();
    const isValid = VALID_RELEASE_TYPES.has(normalized) || SEMVER_REGEX.test(normalized);
    if (!isValid) {
      const allowed = Array.from(VALID_RELEASE_TYPES).join(', ');
      throw new Error(`Unknown release type "${normalized}". Use one of ${allowed} or a valid semver version.`);
    }
    args.push('--release-as', normalized);
  }

  if (Array.isArray(extraArgs) && extraArgs.length > 0) {
    args.push(...extraArgs);
  }

  return args;
}

function loadPackageJson(cwd = process.cwd()) {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const contents = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(contents);
  } catch (error) {
    return null;
  }
}

function detectPackageManager({ env = process.env, cwd = process.cwd() } = {}) {
  const userAgent = env.npm_config_user_agent || '';
  if (userAgent.startsWith('pnpm/')) return 'pnpm';
  if (userAgent.startsWith('yarn/')) return 'yarn';
  if (userAgent.startsWith('bun/')) return 'bun';

  for (const { manager, file } of LOCKFILE_PREFERENCES) {
    if (fs.existsSync(path.join(cwd, file))) {
      return manager;
    }
  }

  return 'npm';
}

function buildTestCommand(packageManager) {
  switch (packageManager) {
    case 'pnpm':
      return { command: 'pnpm', args: ['test'] };
    case 'yarn':
      return { command: 'yarn', args: ['test'] };
    case 'bun':
      return { command: 'bun', args: ['test'] };
    default:
      return { command: 'npm', args: ['test'] };
  }
}

function runProjectTests({ spawn = spawnSync, env = process.env, cwd = process.cwd() } = {}) {
  const packageJson = loadPackageJson(cwd);
  const scripts = packageJson && packageJson.scripts ? packageJson.scripts : {};

  if (!scripts.test) {
    console.log('ℹ️  Skipping tests: no "test" script detected in package.json');
    return { status: 0 };
  }

  const packageManager = detectPackageManager({ env, cwd });
  const { command, args } = buildTestCommand(packageManager);

  console.log(`🧪 Running tests with ${packageManager} ${args.join(' ')}`.trim());
  return spawn(command, args, {
    stdio: 'inherit',
    env
  });
}

function runRelease({
  argv = process.argv,
  env = process.env,
  spawn = spawnSync,
  cwd = process.cwd(),
  dependencies = {}
} = {}) {
  const { releaseType: cliReleaseType, extraArgs } = getCliArguments(argv);
  const inferredReleaseType = cliReleaseType || getNpmRunArgument(env);
  const standardVersionArgs = buildStandardVersionArgs({
    releaseType: inferredReleaseType,
    extraArgs
  });

  const checkWorkingTreeClean = dependencies.isWorkingTreeClean || (() => isWorkingTreeClean({ cwd }));
  const workingTreeClean = checkWorkingTreeClean();
  if (!workingTreeClean) {
    throw new Error('Working tree has uncommitted changes. Commit or stash before running release.');
  }

  const testResult = runProjectTests({ spawn, env });
  if (testResult && typeof testResult.status === 'number' && testResult.status !== 0) {
    return testResult;
  }

  const standardVersionBin = require.resolve('standard-version/bin/cli.js');
  const childEnv = appendPreloadToNodeOptions(env, FS_FOK_PRELOAD_FLAG);
  const releaseResult = spawn(process.execPath, [standardVersionBin, ...standardVersionArgs], {
    stdio: 'inherit',
    env: childEnv,
    cwd
  });

  if (releaseResult && typeof releaseResult.status === 'number' && releaseResult.status !== 0) {
    return releaseResult;
  }

  const releaseNotesPath = dependencies.releaseNotesPath || path.join('docs', 'release-notes', 'RELEASE_NOTES.md');
  const updateNotes = dependencies.updateReleaseNotes || ((options = {}) => updateReleaseNotes({ rootDir: cwd, ...options }));

  let notesUpdated = false;
  try {
    notesUpdated = updateNotes();
  } catch (error) {
    console.warn(`⚠️  Skipping release notes update: ${error.message}`);
  }

  if (notesUpdated) {
    const gitAddResult = spawnSync('git', ['add', releaseNotesPath], { stdio: 'inherit', cwd });
    if (!gitAddResult || typeof gitAddResult.status !== 'number' || gitAddResult.status !== 0) {
      console.warn('⚠️  Release notes updated but failed to stage. Please add manually: git add ' + releaseNotesPath);
    }
  }

  return releaseResult;
}
if (require.main === module) {
  try {
    const result = runRelease();
    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  VALID_RELEASE_TYPES,
  SEMVER_REGEX,
  getCliArguments,
  getNpmRunArgument,
  buildStandardVersionArgs,
  loadPackageJson,
  detectPackageManager,
  runProjectTests,
  runRelease,
  isWorkingTreeClean
};

function buildPreloadFlag(filePath) {
  const resolved = path.resolve(filePath);
  const escaped = resolved.includes(' ')
    ? `"${resolved.replace(/"/g, '\"')}"`
    : resolved;
  return `--require ${escaped}`;
}

function appendPreloadToNodeOptions(env, preloadFlag) {
  const nextEnv = { ...env };
  const existing = typeof nextEnv.NODE_OPTIONS === 'string' ? nextEnv.NODE_OPTIONS.trim() : '';
  nextEnv.NODE_OPTIONS = existing ? `${existing} ${preloadFlag}` : preloadFlag;
  return nextEnv;
}

function isWorkingTreeClean({ cwd = process.cwd() } = {}) {
  const result = spawnSync('git', ['status', '--porcelain'], {
    cwd,
    encoding: 'utf8'
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    const stderr = typeof result.stderr === 'string' ? result.stderr.trim() : '';
    const message = stderr || 'Failed to determine working tree status.';
    throw new Error(message);
  }

  const output = typeof result.stdout === 'string' ? result.stdout : '';
  return output.trim().length === 0;
}
