import { validateAllContent } from '../packages/content/src/validate';
import { certDisplayOrder } from '../packages/content/src';

const { errors, warnings } = validateAllContent();
console.log('\n=== CertQuest OS — Content Validation ===\n');
for (const e of [...errors, ...warnings]) {
  const tag = e.severity === 'error' ? '✗ ERROR' : '⚠ WARN ';
  console.log(`${tag} [${e.certId}] ${e.message}`);
}
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${certDisplayOrder.length} cert(s).\n`);
if (errors.length > 0) process.exit(1);
