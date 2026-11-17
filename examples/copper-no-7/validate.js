// brief2motion: checks config.js before anything heavy loads, and says what is wrong in plain words. MIT.
const isInt = (v) => Number.isInteger(v) && v >= 0;

export function validateConfig(cfg) {
  const problems = [];
  const a = cfg?.assemble;
  if (!a) problems.push('assemble is missing: add an assemble block with at least one target');
  else {
    if (!Array.isArray(a.targets) || !a.targets.length) problems.push('assemble.targets is empty: add one image or text target');
    else {
      if (a.targets.length > 4) problems.push(`assemble.targets has ${a.targets.length} entries: only the first 4 are used`);
      a.targets.slice(0, 4).forEach((t, i) => {
        if (t?.type === 'image' && !t.src) problems.push(`assemble.targets[${i}] is an image with no src`);
        else if (t?.type === 'text' && !String(t.text || '').trim()) problems.push(`assemble.targets[${i}] is text with no text`);
        else if (t?.type !== 'image' && t?.type !== 'text') problems.push(`assemble.targets[${i}].type must be 'image' or 'text'`);
      });
    }
    if (!a.points || !(a.points.desktop > 0) || !(a.points.mobile > 0)) problems.push('assemble.points needs desktop and mobile counts above 0, for example { desktop: 60000, mobile: 25000 }');
    if (a.sequence) {
      const tn = Math.min(4, a.targets?.length || 0);
      if (!Array.isArray(a.sequence) || a.sequence.some((s) => !isInt(s) || s >= tn)) problems.push(`assemble.sequence must list whole target numbers from 0 to ${Math.max(0, tn - 1)}`);
    }
  }
  const items = cfg?.page?.collection?.items || [];
  items.forEach((x, i) => { if (!x?.name) problems.push(`page.collection.items[${i}] has no name`); });
  if (problems.length) throw new Error(`config.js has a problem:\n- ${problems.join('\n- ')}`);
}
