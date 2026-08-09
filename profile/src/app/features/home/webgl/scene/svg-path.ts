import { ShapePath } from 'three';

/**
 * Minimal SVG path parser for the subset the AY mark uses.
 *
 * Three ships `SVGLoader` for this, but it pulls in a large module to read one
 * string that is already a compile-time constant. The mark uses only `M`, `c`,
 * `l` and `z` (verified against `logo-path.ts`), so a focused parser is both
 * smaller and easier to reason about.
 *
 * Framework-free, and the only `three` import is the type it fills.
 */
export function parseSvgPath(d: string, target: ShapePath): void {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return;

  let i = 0;
  let command = '';
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  const num = () => Number.parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      command = tokens[i++];
      if (command === 'z' || command === 'Z') {
        x = startX;
        y = startY;
        continue;
      }
    }

    switch (command) {
      case 'M':
        x = num();
        y = num();
        startX = x;
        startY = y;
        target.moveTo(x, y);
        // An implicit lineto follows a moveto, per the SVG spec.
        command = 'L';
        break;
      case 'm':
        x += num();
        y += num();
        startX = x;
        startY = y;
        target.moveTo(x, y);
        command = 'l';
        break;
      case 'L':
        x = num();
        y = num();
        target.lineTo(x, y);
        break;
      case 'l':
        x += num();
        y += num();
        target.lineTo(x, y);
        break;
      case 'C': {
        const x1 = num();
        const y1 = num();
        const x2 = num();
        const y2 = num();
        x = num();
        y = num();
        target.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      case 'c': {
        const x1 = x + num();
        const y1 = y + num();
        const x2 = x + num();
        const y2 = y + num();
        x += num();
        y += num();
        target.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      default:
        // Unknown command: skip the token rather than loop forever.
        i++;
        break;
    }
  }
}
