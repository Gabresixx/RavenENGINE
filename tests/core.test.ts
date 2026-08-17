import { describe,expect,it } from 'vitest';
import { DeterministicRng, FrameGovernor } from '../packages/core/src/index';

describe('core determinism',()=>{
  it('replays identical random streams from the same seed',()=>{const a=new DeterministicRng(42),b=new DeterministicRng(42);expect([a.next(),a.next(),a.next()]).toEqual([b.next(),b.next(),b.next()]);});
  it('classifies CPU pressure',()=>{expect(new FrameGovernor().classify(20,12)).toBe('cpu');});
});
