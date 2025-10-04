const vsColor=`
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uPointSize;

varying highp vec4 vColor;
void main(){
    gl_Position=uProjectionMatrix
               *uModelViewMatrix
               *aVertexPosition;
    vColor=aVertexColor;
    gl_PointSize = uPointSize;
}`
