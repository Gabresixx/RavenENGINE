export interface RendererCapabilities {
  maxTextureSize: number;
  maxRenderbufferSize: number;
  maxCombinedTextureUnits: number;
  maxSamples: number;
  maxArrayTextureLayers: number;
  maxDrawBuffers: number;
  maxColorAttachments: number;
  colorBufferFloat: boolean;
  floatLinearFiltering: boolean;
  anisotropicFiltering: boolean;
  parallelShaderCompile: boolean;
  timerQuery: boolean;
}

export function probeCapabilities(gl: WebGL2RenderingContext): RendererCapabilities {
  return {
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    maxCombinedTextureUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
    maxSamples: gl.getParameter(gl.MAX_SAMPLES),
    maxArrayTextureLayers: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
    maxDrawBuffers: gl.getParameter(gl.MAX_DRAW_BUFFERS),
    maxColorAttachments: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS),
    colorBufferFloat: !!gl.getExtension('EXT_color_buffer_float'),
    floatLinearFiltering: !!gl.getExtension('OES_texture_float_linear'),
    anisotropicFiltering: !!gl.getExtension('EXT_texture_filter_anisotropic'),
    parallelShaderCompile: !!gl.getExtension('KHR_parallel_shader_compile'),
    timerQuery: !!gl.getExtension('EXT_disjoint_timer_query_webgl2')
  };
}
