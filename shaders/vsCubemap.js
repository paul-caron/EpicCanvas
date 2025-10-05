`
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vDirection;

void main() {
    // Only apply rotation part of modelViewMatrix (remove translation)
    mat4 viewRotation = mat4(mat3(uModelViewMatrix)); // drop translation

    vec4 direction = viewRotation * aVertexPosition;
    vDirection = direction.xyz;

    gl_Position = uProjectionMatrix * vec4(direction.xyz, 1.0);
}
`
