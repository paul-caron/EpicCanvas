const vsColorLight=`
attribute highp vec4 aVertexNormal;
attribute highp vec4 aVertexPosition;
attribute highp vec4 aVertexColor;
uniform highp mat4 uNormalMatrix;
uniform highp mat4 uModelViewMatrix;
uniform highp mat4 uProjectionMatrix;
uniform highp vec3 ambientLight;
uniform highp vec3 directionalLightColor;
uniform highp vec3 directionalVector;
varying highp vec4 vColor;
varying highp vec3 vLighting;
void main(void){
gl_Position=uProjectionMatrix*uModelViewMatrix*aVertexPosition;
vColor=aVertexColor;
highp vec4 transformedNormal=uNormalMatrix*aVertexNormal;
highp float directional=max(dot(transformedNormal.xyz, directionalVector),0.0);
vLighting=ambientLight+(directionalLightColor*directional);
}`
