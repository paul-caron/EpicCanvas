const vsSkybox = `
attribute vec4 aVertexPosition;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vDirection;

void main() {
    // Only apply rotation part of ViewMatrix (remove translation)
    mat4 viewRotation = mat4(mat3(uViewMatrix));

    vec4 direction = viewRotation * aVertexPosition;
    vDirection = direction.xyz;

    gl_Position = uProjectionMatrix * viewRotation * vec4(direction.xyz, 1.0);
}


`;

