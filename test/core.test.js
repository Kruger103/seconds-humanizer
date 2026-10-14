import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { humanizeSeconds, UNITS } from '../src/index.js';

describe('humanizeSeconds', () => {
  it('returns "0 seconds" for zero', () => {
    assert.equal(humanizeSeconds(0), '0 seconds');
  });

  it('handles a single unit', () => {
    assert.equal(humanizeSeconds(30), '30 seconds');
    assert.equal(humanizeSeconds(60), '1 minute');
    assert.equal(humanizeSeconds(3600), '1 hour');
  });

  it('combines two units by default', () => {
    assert.equal(humanizeSeconds(90), '1 minute, 30 seconds');
    assert.equal(humanizeSeconds(3661), '1 hour, 1 minute');
  });

  it('respects precision option', () => {
    assert.equal(humanizeSeconds(3661, { precision: 1 }), '1 hour');
    assert.equal(humanizeSeconds(93784, { precision: 3 }), '1 day, 2 hours, 3 minutes');
  });

  it('pluralizes correctly', () => {
    assert.equal(humanizeSeconds(120), '2 minutes');
    assert.equal(humanizeSeconds(7200), '2 hours');
  });

  it('truncates fractional seconds toward zero', () => {
    assert.equal(humanizeSeconds(90.9), '1 minute, 30 seconds');
  });

  it('treats negative input as zero', () => {
    assert.equal(humanizeSeconds(-100), '0 seconds');
  });

  it('supports weeks and months', () => {
    assert.equal(humanizeSeconds(604800), '1 week');
    assert.equal(humanizeSeconds(2629800), '1 month');
  });

  it('supports years', () => {
    assert.equal(humanizeSeconds(31557600), '1 year');
    assert.equal(humanizeSeconds(63115200), '2 years');
  });

  it('respects allowedUnits filter', () => {
    assert.equal(
      humanizeSeconds(93784, { allowedUnits: ['hour', 'minute', 'second'] }),
      '26 hours, 3 minutes'
    );
  });

  it('allowedUnits excluding seconds produces fewer parts when remainder is sub-minute', () => {
    // 59 seconds with no 'second' unit allowed -> nothing to show -> "0 seconds"
    assert.equal(humanizeSeconds(59, { allowedUnits: ['minute'] }), '0 seconds');
  });

  it('throws TypeError on non-number input', () => {
    assert.throws(() => humanizeSeconds('100'), TypeError);
    assert.throws(() => humanizeSeconds(NaN), TypeError);
    assert.throws(() => humanizeSeconds(Infinity), TypeError);
  });

  it('throws on invalid precision', () => {
    assert.throws(() => humanizeSeconds(100, { precision: 0 }), RangeError);
    assert.throws(() => humanizeSeconds(100, { precision: 'x' }), TypeError);
  });

  it('throws on non-array allowedUnits', () => {
    assert.throws(() => humanizeSeconds(100, { allowedUnits: 'minutes' }), TypeError);
  });

  it('exports UNITS array with seven entries in descending order', () => {
    assert.equal(UNITS.length, 7);
    assert.deepEqual(UNITS.map(u => u.name), ['year','month','week','day','hour','minute','second']);
    for (let i = 1; i < UNITS.length; i++) {
      assert.ok(UNITS[i-1].seconds > UNITS[i].seconds);
    }
  });
});
