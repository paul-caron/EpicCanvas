const fsPhong = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vColor;
varying vec3 vViewDirection;

uniform vec3 uPointLightPosition;
uniform vec3 uPointLightColor;
uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalVector;
uniform vec3 uAmbientLight;
uniform float uShininess;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uPointLightPosition - vWorldPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(vViewDirection);

    // Ambient
    vec3 ambient = uAmbientLight * vColor.rgb;
    
    // Directional
    float directionalLightIntensity=max(dot(normal, uDirectionalVector),0.0);
    vec3 directional = directionalLightIntensity * uDirectionalLightColor * vColor.rgb;

    // Diffuse
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = uPointLightColor * diff * vColor.rgb;

    // Specular
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
    vec3 specular = uPointLightColor * spec * vColor.rgb;

    // Combine
    vec3 finalColor = ambient + diffuse + specular + directional;
    gl_FragColor = vec4(finalColor, vColor.a);
}
`;
