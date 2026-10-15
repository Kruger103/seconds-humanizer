# seconds-humanizer

Converts an integer seconds value into a compact human-readable duration string with configurable precision and unit selection.

## Usage

```js
import { humanizeSeconds } from 'seconds-humanizer';

humanizeSeconds(3661);              // "1 hour, 1 minute"
humanizeSeconds(93784, { precision: 3 });  // "1 day, 2 hours, 3 minutes"
humanizeSeconds(93784, { allowedUnits: ['hour', 'minute'] }); // "26 hours, 3 minutes"
```

## Why

Formatting durations by hand is repetitive and error-prone: you floor, modulus, branch on plural, join with commas, and then decide how many units to show. This library does that one job and nothing else. It returns a string like `"1 hour, 30 seconds"` rather than an ISO 8601 token or a moment-style object because the target is display text.

## Decisions and edge cases

- A **year** is 31557600 seconds (365.25 days) to average leap years. A **month** is 1/12 of that. These are not exact for any given calendar month but are the least surprising fixed factors.
- **Negative input is treated as zero.** There is no useful human representation for a negative duration in this context.
- **Fractional seconds are truncated toward zero**, not rounded, so `90.9` becomes `"1 minute, 30 seconds"`.
- `precision` caps the number of units emitted; remaining time is dropped silently.
- `allowedUnits` restricts which units may appear. If the remaining value is too small for any allowed unit, the output is `"0 seconds"` regardless of the filter.

## Exports

- `humanizeSeconds(totalSeconds, opts?)` — the formatter.
- `UNITS` — the ordered unit definitions: `[{ name, seconds }, ...]` from year down to second.
