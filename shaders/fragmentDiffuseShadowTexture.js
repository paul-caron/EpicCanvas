const fsDiffuseShadowTexture = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vTextureCoord;
varying vec3 vViewDirection;
varying vec4 vLightSpacePos;

uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalVector;
uniform vec3 uAmbientLight;
uniform sampler2D uShadowMap;
uniform sampler2D uSampler;

float computeShadow(vec4 lightSpacePos) {
    vec3 projCoords = lightSpacePos.xyz / lightSpacePos.w;
    projCoords = projCoords * 0.5 + 0.5;
    float currentDepth = projCoords.z;
    if (projCoords.z > 1.0) return 1.0;
    float shadowMapDepth = texture2D(uShadowMap, projCoords.xy).r;
    float bias = 0.005;
    return currentDepth > shadowMapDepth + bias ? 0.0 : 1.0;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uDirectionalVector);
    
    // Sample texture
    vec4 texColor = texture2D(uSampler, vTextureCoord);

    // Ambient
    vec3 ambient = uAmbientLight * texColor.rgb;

    // Diffuse with shadow
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    float shadow = computeShadow(vLightSpacePos);
    vec3 diffuse = diffuseIntensity * uDirectionalLightColor * texColor.rgb * shadow;

    // Combine
    vec3 finalColor = ambient + diffuse;
    gl_FragColor = vec4(finalColor, texColor.a);
}
`;
