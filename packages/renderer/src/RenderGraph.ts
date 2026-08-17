export interface RenderPassContext {
  gl: WebGL2RenderingContext;
  width: number;
  height: number;
}

export interface RenderPass {
  name: string;
  enabled?: () => boolean;
  execute(ctx: RenderPassContext): void;
}

export class RenderGraph {
  private passes: RenderPass[] = [];

  add(pass: RenderPass): this {
    this.passes.push(pass);
    return this;
  }

  execute(ctx: RenderPassContext): void {
    for (const pass of this.passes) {
      if (pass.enabled && !pass.enabled()) continue;
      pass.execute(ctx);
    }
  }
}
