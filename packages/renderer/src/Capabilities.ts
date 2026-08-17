export interface RendererCapabilities {
  maxTextureSize: number;
  maxRenderbufferSize: number;
  maxCombinedTextureUnits: number;
  maxSamples: number;
  colorBufferFloat: boolean;
  anisotropicFiltering: boolean;
  parallelShaderCompile: boolean;
}

export function probeCapabilities(gl: WebGL2RenderingContext): RendererCapabilities {
  return {
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    maxCombinedTextureUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    maxSamples: gl.getParameter(gl.MAX_SAMPLES),
    colorBufferFloat: !!gl.getExtension('EXT_color_buffer_float'),
    anisotropicFiltering: !!gl.getExtension('EXT_texture_filter_anisotropic'),
    parallelShaderCompile: !!gl.getExtension('KHR_parallel_shader_compile')
  };
}
