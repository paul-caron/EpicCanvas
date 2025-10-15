const fsDiffuseShadow = `
precision mediump float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec4 vColor;
varying vec3 vViewDirection;
varying vec4 vLightSpacePos;

uniform vec3 uDirectionalLightColor;
uniform vec3 uDirectionalVector;
uniform vec3 uAmbientLight;
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
    vec3 lightDir = normalize(uDirectionalVector);

    // Ambient
    vec3 ambient = uAmbientLight * vColor.rgb;

    // Diffuse with shadow
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    float shadow = computeShadow(vLightSpacePos);
    vec3 diffuse = diffuseIntensity * uDirectionalLightColor * vColor.rgb * shadow;

    // Combine
    vec3 finalColor = ambient + diffuse;
    gl_FragColor = vec4(finalColor, vColor.a);
}

`
