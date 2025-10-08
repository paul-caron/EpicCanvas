const fsMirror = `

precision highp float;
 
// Passed in from the vertex shader.
varying vec3 v_worldPosition;
varying vec3 v_worldNormal;
 
// The texture.
uniform samplerCube uSampler;
 uniform mat4 uModelMatrix;
 
// The position of the camera
uniform vec3 uCameraPosition;


// Function to reverse a 3x3 rotation matrix by applying its transpose
mat3 inverseMatrix(mat3 rotationMatrix) {
    // Compute the transpose of the rotation matrix
    mat3 invMatrix = mat3(
        rotationMatrix[0][0], rotationMatrix[1][0], rotationMatrix[2][0], // Column 0
        rotationMatrix[0][1], rotationMatrix[1][1], rotationMatrix[2][1], // Column 1
        rotationMatrix[0][2], rotationMatrix[1][2], rotationMatrix[2][2]  // Column 2
    );
    
    return invMatrix ;
}
 
void main() {
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - uCameraPosition);
  vec3 direction = reflect(eyeToSurfaceDir,worldNormal);
  mat3 invModelMatrix = inverseMatrix(mat3(uModelMatrix));
  vec3 direction2 = invModelMatrix * direction;
  gl_FragColor = textureCube(uSampler, direction2) ;
}

`;
