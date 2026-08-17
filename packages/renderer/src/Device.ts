import { probeCapabilities, type RendererCapabilities } from './Capabilities';

export class WebGL2Device {
  readonly gl: WebGL2RenderingContext;
  readonly capabilities: RendererCapabilities;

  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
      desynchronized: false
    });
    if (!gl) throw new Error('RAVEN requires WebGL2.');
    this.gl = gl;
    this.capabilities = probeCapabilities(gl);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  resize(width: number, height: number): void {
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }
}
