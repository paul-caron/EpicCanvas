const fsDiffuseShadow = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vColor;
varying vec3 vViewDirection;
varying vec4 vLightSpacePos;

uniform vec3 directionalLightColor;
uniform vec3 directionalVector;
uniform vec3 ambientLight;
uniform sampler2D uShadowMap;

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
    vec3 lightDir = normalize(directionalVector);

    // Ambient
    vec3 ambient = ambientLight * vColor.rgb;

    // Diffuse with shadow
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    float shadow = computeShadow(vLightSpacePos);
    vec3 diffuse = diffuseIntensity * directionalLightColor * vColor.rgb * shadow;

    // Combine
    vec3 finalColor = ambient + diffuse;
    gl_FragColor = vec4(finalColor, vColor.a);
}

`
