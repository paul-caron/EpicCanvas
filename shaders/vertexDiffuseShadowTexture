const vsDiffuseShadowTexture = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uCameraPosition;
uniform mat4 uLightViewMatrix;
uniform mat4 uLightProjectionMatrix;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vTextureCoord;
varying vec3 vViewDirection;
varying vec4 vLightSpacePos;

void main() {
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(uNormalMatrix * aVertexNormal).xyz;
    vViewDirection = normalize(uCameraPosition - worldPosition.xyz);
    vTextureCoord = aTextureCoord;
    vLightSpacePos = uLightProjectionMatrix * uLightViewMatrix * worldPosition;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}
`;
