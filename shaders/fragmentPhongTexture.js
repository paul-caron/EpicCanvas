const fsPhongTexture= `
precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 pointLightPosition;
uniform vec3 pointLightColor;
uniform vec3 directionalLightColor;
uniform vec3 directionalVector;
uniform vec3 ambientLight;
uniform float shininess;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(pointLightPosition - vWorldPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(vViewDirection);
    vec4 textureColor = texture2D(uSampler, vTextureCoord);

    // Ambient
    vec3 ambient = ambientLight * textureColor.rgb;
    
    // Directional
    float directionalLightIntensity=max(dot(normal, directionalVector),0.0);
    vec3 directional = directionalLightIntensity * directionalLightColor * textureColor.rgb;

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = pointLightColor * diff * textureColor.rgb;

    // Specular
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = pointLightColor * spec * textureColor.rgb;

    // Combine
    vec3 finalColor = ambient + diffuse + specular + directional;
    gl_FragColor = vec4(finalColor, textureColor.a);
}
`;
