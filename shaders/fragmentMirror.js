const fsMirror = `

precision highp float;
 
// Passed in from the vertex shader.
varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
 
// The texture.
uniform samplerCube uSampler;
 
// The position of the camera
uniform vec3 uCameraPosition;
 
void main() {
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - uCameraPosition);
  vec3 direction = reflect(eyeToSurfaceDir,worldNormal);
  gl_FragColor = textureCube(uSampler, direction) ;
}
`;
