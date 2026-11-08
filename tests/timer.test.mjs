import test from 'node:test';
import assert from 'node:assert/strict';
import { PausableTimer } from '../src/js/notifications.js';
function fakeTime() {
  let now = 0, count = 0;
  const jobs = new Map();
  return { clock: () => now, schedule: (fn, ms) => { const id = ++count; jobs.set(id, { fn, at: now + ms }); return id; }, cancel: id => jobs.delete(id), tick(ms) { now += ms; for (const [id, job] of jobs) if (job.at <= now) { jobs.delete(id); job.fn(); } } };
}
test('independent timers retain remaining duration and only run after all pause reasons clear', () => {
  const time = fakeTime(); let first = 0, second = 0;
  const timer = new PausableTimer(() => first++, 5000, time.clock, time.schedule, time.cancel);
  new PausableTimer(() => second++, 3000, time.clock, time.schedule, time.cancel);
  time.tick(2000); timer.pause('hover'); timer.pause('focus');
  time.tick(10000); assert.equal(second, 1); assert.equal(first, 0);
  timer.resume('hover'); time.tick(10000); assert.equal(first, 0);
  timer.resume('focus'); time.tick(2999); assert.equal(first, 0);
  time.tick(1); assert.equal(first, 1);
  timer.resume(); time.tick(10000); assert.equal(first, 1);
});
test('stopped timers never fire', () => {
  const time = fakeTime(); let calls = 0;
  const timer = new PausableTimer(() => calls++, 10, time.clock, time.schedule, time.cancel);
  timer.stop(); timer.resume(); time.tick(100); assert.equal(calls, 0);
});
