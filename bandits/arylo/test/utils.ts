import test from 'ava';
import { date } from '../src/utils';

test('Date Method', (t) => {
    t.is(date.s(0), 0);
    t.is(date.s(3), 3 * 1000);
    t.is(date.m(5), 5 * 60 * 1000);
    t.is(date.h(4), 4 * 60 * 60 * 1000);
    t.is(date.d(0.5), date.h(12));
});
