/**
 * Core humanizing logic for seconds-humanizer.
 *
 * All units are defined in SI seconds and derived with fixed conversion
 * factors. We use 86400 for a day and 31557600 for a year (365.25 days).
 * The 365.25 figure accounts for leap years on average, which is the
 * convention ISO 8601 uses for durations. It is not "exact" but it is
 * the least surprising choice for durations spanning multiple years.
 */

/**
 * Ordered list of supported units from largest to smallest.
 * Each entry holds the threshold (in seconds) and the singular label.
 * The plural is formed by appending 's'.
 */
export const UNITS = [
  { name: 'year',   seconds: 31557600 },
  { name: 'month',  seconds: 2629800  }, // 31557600 / 12
  { name: 'week',   seconds: 604800   },
  { name: 'day',    seconds: 86400    },
  { name: 'hour',   seconds: 3600    },
  { name: 'minute', seconds: 60      },
  { name: 'second', seconds: 1       },
];

/**
 * Validate a precision argument. Returns a clean integer >= 1.
 *
 * We coerce floats because JSON config often yields 2.0. We reject
 * non-finite numbers and non-numbers early so the caller gets a clear
 * TypeError rather than a confusing NaN downstream.
 */
function normalizePrecision(precision) {
  if (typeof precision !== 'number' || !Number.isFinite(precision)) {
    throw new TypeError('precision must be a finite number');
  }
  const p = Math.floor(precision);
  if (p < 1) {
    throw new RangeError('precision must be at least 1');
  }
  return p;
}

/**
 * Normalize the allowedUnits option into a Set of lowercase unit names.
 * If the caller passes null or undefined we return null, meaning
 * "use all units". Unknown unit names are silently ignored rather than
 * throwing: the intent of the option is restriction, and an unknown
 * name simply restricts nothing.
 */
function normalizeAllowedUnits(allowedUnits) {
  if (allowedUnits == null) return null;
  if (!Array.isArray(allowedUnits)) {
    throw new TypeError('allowedUnits must be an array of strings');
  }
  const set = new Set();
  for (const u of allowedUnits) {
    if (typeof u !== 'string') {
      throw new TypeError('allowedUnits entries must be strings');
    }
    set.add(u.toLowerCase());
  }
  return set;
}

/**
 * Pluralize a unit name if count is not 1.
 */
function label(unitName, count) {
  return count === 1 ? unitName : unitName + 's';
}

/**
 * Humanize a seconds value into a compact duration string.
 *
 * @param {number} totalSeconds - Integer seconds to convert.
 * @param {object} [opts]
 * @param {number} [opts.precision=2]   - Maximum number of units to emit.
 * @param {string[]|null} [opts.allowedUnits=null] - Restrict output to these units.
 * @returns {string}
 */
export function humanizeSeconds(totalSeconds, opts = {}) {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds)) {
    throw new TypeError('totalSeconds must be a finite number');
  }
  // Truncate toward zero so -5 becomes 0, not -5. Negative input is
  // treated as zero because a negative duration has no useful human
  // representation here.
  let remaining = totalSeconds < 0 ? 0 : Math.floor(totalSeconds);
  if (remaining === 0) return '0 seconds';

  const precision = normalizePrecision(opts.precision ?? 2);
  const allowed = normalizeAllowedUnits(opts.allowedUnits);

  const parts = [];
  for (const unit of UNITS) {
    if (allowed !== null && !allowed.has(unit.name)) continue;
    if (parts.length >= precision) break;
    if (remaining < unit.seconds) continue;

    const count = Math.floor(remaining / unit.seconds);
    parts.push(count + ' ' + label(unit.name, count));
    remaining -= count * unit.seconds;
  }

  if (parts.length === 0) {
    // No allowed unit was large enough AND none was 'second', or
    // allowedUnits excluded 'second' while totalSeconds < 60. The only
    // honest output is zero of the smallest allowed unit, but since we
    // cannot know intent, we fall back to '0 seconds'.
    return '0 seconds';
  }

  return parts.join(', ');
}
