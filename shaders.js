/* WebGL considers positive Y as up and negative Y as down. In clip space
    the bottom left corner -1,-1. We haven't changed any signs so with our 
    current math 0, 0 becomes the bottom left corner. To get it to be the more 
    traditional top left corner used for 2d graphics APIs we can just flip the
     clip space y coordinate. */

const vertexShaderSource = `#version 300 es
in vec2 a_position;

uniform mat3 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

  // Convert from clipspace to colorspace.
  // Clipspace goes -1.0 to +1.0
  // Colorspace goes from 0.0 to 1.0
  v_color = gl_Position * 0.5 + 0.5;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;