const vsDepth = `
attribute vec4 aVertexPosition;
uniform mat4 uModelMatrix;
uniform mat4 uLightViewMatrix;
uniform mat4 uLightProjectionMatrix;

void main() {
    gl_Position = uLightProjectionMatrix * uLightViewMatrix * uModelMatrix * aVertexPosition;
}
`
