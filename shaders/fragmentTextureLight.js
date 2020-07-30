const fsTextureLight=`
varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;
uniform sampler2D uSampler;
void main(void){
    mediump vec4 texelColor=texture2D(uSampler,vec2(vTextureCoord.s,vTextureCoord.t));
    gl_FragColor=vec4(texelColor.rgb*vLighting,texelColor.a);
}`
