export class ShaderProgram {
  readonly program: WebGLProgram;
  private uniforms = new Map<string, WebGLUniformLocation | null>();

  constructor(readonly gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
    const vs = this.compile(gl.VERTEX_SHADER, vertexSource);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error('Unable to allocate WebGLProgram');
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? 'unknown link error'; gl.deleteProgram(program); throw new Error(`RAVEN shader link failed: ${log}`);
    }
    this.program = program;
  }

  use(): void { this.gl.useProgram(this.program); }
  uniform(name: string): WebGLUniformLocation | null {
    if (!this.uniforms.has(name)) this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    return this.uniforms.get(name)!;
  }
  dispose(): void { this.gl.deleteProgram(this.program); }

  private compile(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type); if (!shader) throw new Error('Unable to allocate shader');
    this.gl.shaderSource(shader, source); this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log=this.gl.getShaderInfoLog(shader)??'unknown compile error'; this.gl.deleteShader(shader); throw new Error(`RAVEN shader compile failed: ${log}`);
    }
    return shader;
  }
}
