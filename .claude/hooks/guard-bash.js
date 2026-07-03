#!/usr/bin/env node
// PreToolUse guard for Bash commands.
// Blocks anything that could touch the live theme, delete themes, rewrite
// protected history, or break the one-way main → sale sync.
// Exit code 2 blocks the command; stderr is shown to Claude.

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let cmd = '';
  try {
    cmd = JSON.parse(input).tool_input?.command ?? '';
  } catch {
    process.exit(0);
  }

  const rules = [
    {
      re: /shopify\s+theme\s+publish/i,
      msg: 'Publishing a theme is a human decision (weekend sale swaps etc.). Never publish from automation — ask Aidan.',
    },
    {
      re: /shopify\s+theme\s+delete/i,
      msg: 'Theme deletion is blocked. Ask Aidan.',
    },
    {
      re: /shopify\s+theme\s+push[^|;&]*(\s--live\b|\s-l\b|\s--allow-live\b)/i,
      msg: 'Pushing to the live theme from this machine is blocked. Deploys go through GitHub Actions only.',
    },
    {
      re: /git\s+push[^|;&]*(\s--force\b|\s-f\b|\s--force-with-lease\b)[^|;&]*\bmain\b/i,
      msg: 'Force-pushing main is blocked.',
    },
    {
      re: /git\s+push[^|;&]*\bmain\b[^|;&]*(\s--force\b|\s-f\b|\s--force-with-lease\b)/i,
      msg: 'Force-pushing main is blocked.',
    },
    {
      re: /git\s+(checkout|switch)\s+main[^|;&]*&&[^|;&]*git\s+merge\s+sale\b|git\s+merge\s+sale\b/i,
      msg: 'Merging sale into any branch is blocked — sync is one-way (main → sale). Sale content must never reach main.',
    },
  ];

  for (const { re, msg } of rules) {
    if (re.test(cmd)) {
      console.error(`BLOCKED by .claude/hooks/guard-bash.js: ${msg}`);
      process.exit(2);
    }
  }
  process.exit(0);
});
