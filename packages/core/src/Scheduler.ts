import type { FrameTiming } from './Clock';

export type TaskCadence = 60 | 30 | 15 | 10 | 5 | 2 | 1;

export interface ScheduledTask {
  id: string;
  cadenceHz: TaskCadence;
  priority: number;
  estimatedCostMs: number;
  run(frame: FrameTiming): void;
}

export class Scheduler {
  private tasks: ScheduledTask[] = [];

  register(task: ScheduledTask): () => void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
    return () => { this.tasks = this.tasks.filter(t => t !== task); };
  }

  run(frame: FrameTiming, budgetMs: number): number {
    const start = performance.now();
    for (const task of this.tasks) {
      const stride = Math.max(1, Math.round(60 / task.cadenceHz));
      if (frame.frame % stride !== 0) continue;
      if (performance.now() - start + task.estimatedCostMs > budgetMs) continue;
      task.run(frame);
    }
    return performance.now() - start;
  }
}
