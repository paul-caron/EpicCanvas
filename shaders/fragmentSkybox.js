const fsSkybox = `
precision highp float;
uniform samplerCube uCubeMap;
varying vec3 vDirection;

void main() {
    gl_FragColor = textureCube(uCubeMap, normalize(vDirection));
}


`;

