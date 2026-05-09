import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');

const vars = envContent.split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => {
    const parts = line.split('=');
    const key = parts[0];
    let value = parts.slice(1).join('=');
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }
    return { key, value };
  });

// Add standard Clerk redirect variables
vars.push(
  { key: 'NEXT_PUBLIC_CLERK_SIGN_IN_URL', value: '/sign-in' },
  { key: 'NEXT_PUBLIC_CLERK_SIGN_UP_URL', value: '/sign-up' },
  { key: 'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL', value: '/dashboard' },
  { key: 'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL', value: '/dashboard' }
);

console.log(`Found ${vars.length} variables to push.`);

for (const { key, value } of vars) {
  if (!key || !value) continue;
  console.log(`Pushing ${key}...`);
  for (const env of ['production', 'preview', 'development']) {
    try {
      // Use echo to pipe the value into the command
      const command = `echo ${value} | npx vercel env add ${key} ${env} --yes`;
      execSync(`cmd.exe /c "${command}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to push ${key} to ${env}:`, e.message);
    }
  }
}

console.log('Done!');
