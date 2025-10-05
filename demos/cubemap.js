const vsCubeMap = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec3 vDirection;
void main() {
    mat4 viewRotation = mat4(mat3(uModelViewMatrix));
    vec4 direction = viewRotation * aVertexPosition;
    vDirection = direction.xyz;
    gl_Position = uProjectionMatrix * vec4(direction.xyz, 1.0);
}
`

const fsCubeMap = `
precision highp float;
uniform samplerCube uCubeMap;
varying vec3 vDirection;
void main() {
    gl_FragColor = textureCube(uCubeMap, normalize(vDirection));
}
`

const program = epicCanvas.makeProgram(vsCubeMap, fsCubeMap);

// Load the cubemap
const cubeMap = epicCanvas.loadCubeMap([
  'posx.png', 'negx.png',
  'posy.png', 'negy.png',
  'posz.png', 'negz.png'
])
epicCanvas.setCubeMap(cubeMap)

// Draw
const skybox = Cube(epicCanvas) // Use your cube shape
epicCanvas.gl.depthMask(false) // Prevent writing to depth buffer (important!)
epicCanvas.drawShape(program, skybox)
epicCanvas.gl.depthMask(true)
