const fsColorLight=`
varying highp vec3 vLighting;
varying highp vec4 vColor;
void main(void){
gl_FragColor=vec4(vColor.rgb*vLighting,vColor.a);
}`
