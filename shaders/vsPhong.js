const vsPhong =`
attribute vec4 aVertexPosition;
attribute vec4 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uCameraPosition;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vColor;
varying vec3 vViewDirection;

void main() {
    vec4 worldPosition = uModelMatrix * aVertexPosition;
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(uNormalMatrix * aVertexNormal).xyz;
    vViewDirection = normalize(uCameraPosition - worldPosition.xyz);
    vColor = aVertexColor;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
}

`;
