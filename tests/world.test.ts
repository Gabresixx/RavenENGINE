import { describe,expect,it } from 'vitest';
import { projectedImportance } from '../packages/world/src/ProjectedImportance';

describe('projected importance',()=>{it('ranks closer equal-size objects higher',()=>{const common={radius:1,viewportHeight:1080,focalLengthPx:900};expect(projectedImportance({...common,distance:2})).toBeGreaterThan(projectedImportance({...common,distance:20}));});});
