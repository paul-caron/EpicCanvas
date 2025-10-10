function TrefoilKnot(epicCanvas, radius = 1.0, tubeRadius = 0.3, pathSegments = 60, tubeSegments = 16, initBuffers = true) {
    const vertices = [];
    const colors = [];
    const textureCoordinates = [];
    const normals = [];

    // Generate vertices, normals, texture coordinates, and colors
    for (let i = 0; i <= pathSegments; i++) {
        const t = (i / pathSegments) * 2.0 * Math.PI;
        
        // Trefoil knot parametric equations (path)
        const x = radius * (Math.sin(t) + 2 * Math.sin(2 * t));
        const y = radius * (Math.cos(t) - 2 * Math.cos(2 * t));
        const z = radius * (-Math.sin(3 * t));

        // Derivatives for tangent (for Frenet-Serret frame)
        const dx_dt = radius * (Math.cos(t) + 4 * Math.cos(2 * t));
        const dy_dt = radius * (-Math.sin(t) + 4 * Math.sin(2 * t));
        const dz_dt = radius * (-3 * Math.cos(3 * t));

        // Tangent vector
        const tangent = normalize([dx_dt, dy_dt, dz_dt]);
        
        // Arbitrary vector for Frenet-Serret frame (not parallel to tangent)
        const arbitrary = [0, 0, 1];
        const normal = normalize(cross(tangent, arbitrary));
        const binormal = normalize(cross(tangent, normal));

        // Generate tube around the knot path
        for (let j = 0; j <= tubeSegments; j++) {
            const theta = (j / tubeSegments) * 2.0 * Math.PI;

            // Tube circle coordinates
            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);
            const tubeX = cosTheta * normal[0] + sinTheta * binormal[0];
            const tubeY = cosTheta * normal[1] + sinTheta * binormal[1];
            const tubeZ = cosTheta * normal[2] + sinTheta * binormal[2];

            // Vertex position
            vertices.push(
                x + tubeRadius * tubeX,
                y + tubeRadius * tubeY,
                z + tubeRadius * tubeZ,
                1.0
            );

            // Normal (points outward from tube surface)
            normals.push(
                tubeX,
                tubeY,
                tubeZ,
                0.0
            );

            // Texture coordinates
            const s = i / pathSegments;
            const t = j / tubeSegments;
            textureCoordinates.push(s, t);

            // Color (gradient based on position)
            colors.push(0.5 + 0.5 * Math.cos(t), 0.5 + 0.5 * Math.sin(theta), 0.5, 1.0);
        }
    }

    // Helper functions for vector operations
    function normalize(vec) {
        const mag = Math.sqrt(vec[0] ** 2 + vec[1] ** 2 + vec[2] ** 2);
        return mag > 0 ? vec.map(v => v / mag) : vec;
    }

    function cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    // Generate TRIANGLE_STRIP connectivity
    const stripVertices = [];
    const stripColors = [];
    const stripTextureCoordinates = [];
    const stripNormals = [];

    for (let i = 0; i < pathSegments; i++) {
        for (let j = 0; j <= tubeSegments; j++) {
            const idx1 = i * (tubeSegments + 1) + j;
            const idx2 = (i + 1) * (tubeSegments + 1) + j;

            // Add two vertices per strip segment
            stripVertices.push(
                vertices[idx1 * 4], vertices[idx1 * 4 + 1], vertices[idx1 * 4 + 2], vertices[idx1 * 4 + 3],
                vertices[idx2 * 4], vertices[idx2 * 4 + 1], vertices[idx2 * 4 + 2], vertices[idx2 * 4 + 3]
            );
            stripNormals.push(
                normals[idx1 * 4], normals[idx1 * 4 + 1], normals[idx1 * 4 + 2], normals[idx1 * 4 + 3],
                normals[idx2 * 4], normals[idx2 * 4 + 1], normals[idx2 * 4 + 2], normals[idx2 * 4 + 3]
            );
            stripColors.push(
                colors[idx1 * 4], colors[idx1 * 4 + 1], colors[idx1 * 4 + 2], colors[idx1 * 4 + 3],
                colors[idx2 * 4], colors[idx2 * 4 + 1], colors[idx2 * 4 + 2], colors[idx2 * 4 + 3]
            );
            stripTextureCoordinates.push(
                textureCoordinates[idx1 * 2], textureCoordinates[idx1 * 2 + 1],
                textureCoordinates[idx2 * 2], textureCoordinates[idx2 * 2 + 1]
            );
        }
        // Add degenerate triangles to connect strips
        if (i < pathSegments - 1) {
            const lastIdx = (i + 1) * (tubeSegments + 1) + tubeSegments;
            const nextIdx = (i + 1) * (tubeSegments + 1);
            stripVertices.push(
                vertices[lastIdx * 4], vertices[lastIdx * 4 + 1], vertices[lastIdx * 4 + 2], vertices[lastIdx * 4 + 3],
                vertices[nextIdx * 4], vertices[nextIdx * 4 + 1], vertices[nextIdx * 4 + 2], vertices[nextIdx * 4 + 3]
            );
            stripNormals.push(
                normals[lastIdx * 4], normals[lastIdx * 4 + 1], normals[lastIdx * 4 + 2], normals[lastIdx * 4 + 3],
                normals[nextIdx * 4], normals[nextIdx * 4 + 1], normals[nextIdx * 4 + 2], normals[nextIdx * 4 + 3]
            );
            stripColors.push(
                colors[lastIdx * 4], colors[lastIdx * 4 + 1], colors[lastIdx * 4 + 2], colors[lastIdx * 4 + 3],
                colors[nextIdx * 4], colors[nextIdx * 4 + 1], colors[nextIdx * 4 + 2], colors[nextIdx * 4 + 3]
            );
            stripTextureCoordinates.push(
                textureCoordinates[lastIdx * 2], textureCoordinates[lastIdx * 2 + 1],
                textureCoordinates[nextIdx * 2], textureCoordinates[nextIdx * 2 + 1]
            );
        }
    }

    const mode = epicCanvas.gl.TRIANGLE_STRIP;
    const shape = {
        vertices: stripVertices,
        colors: stripColors,
        textureCoordinates: stripTextureCoordinates,
        normals: stripNormals,
        mode
    };

    if (initBuffers) {
        epicCanvas.initBuffers(shape);
    }

    return shape;
}
