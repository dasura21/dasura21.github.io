import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const pages = ['index.html'];
if (existsSync('projects')) for (const d of readdirSync('projects', { withFileTypes: true })) {
  if (d.isDirectory() && existsSync(`projects/${d.name}/index.html`)) pages.push(`projects/${d.name}/index.html`);
}
for (const page of pages) {
  const html=readFileSync(page,'utf8');
  const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/i)?.[1];
  assert.ok(policy,`${page}: missing CSP`);
  for(const directive of ["object-src 'none'", "base-uri 'none'", "form-action 'none'"]) assert.ok(policy.includes(directive));
  assert.ok(!/script-src[^;]*'(unsafe-inline|unsafe-eval)'/.test(policy));
  assert.ok(!/<[^>]+\son\w+\s*=/.test(html),`${page}: inline event handler`);
  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const source=match[1].match(/src="([^"]+)"/)?.[1];
    if(source) {
      assert.ok(!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(source), `${page}: external script`);
      assert.ok(existsSync(resolve(dirname(page),source)),`${page}: missing script`);
    } else {
      assert.ok(match[1].includes('importmap'),`${page}: executable inline script`);
      const digest=createHash('sha256').update(match[2]).digest('base64');
      assert.ok(policy.includes(`'sha256-${digest}'`),`${page}: import-map CSP hash mismatch`);
      for(const value of Object.values(JSON.parse(match[2]).imports)) assert.ok(value.startsWith('./') || value.startsWith('../'));
    }
  }
}
console.log(`${pages.length} pages passed static security checks.`);
