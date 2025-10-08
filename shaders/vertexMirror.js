const vsMirror = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
 
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
 
varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
 
void main() {
  // Multiply the position by the matrix.
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
 
  // send the view position to the fragment shader
  v_worldPosition = (uModelMatrix * aVertexPosition).xyz;
 
  // orient the normals and pass to the fragment shader
  v_worldNormal = mat3(uModelMatrix) * aVertexNormal.xyz;
}
    
`;
