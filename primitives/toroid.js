function Toroid(epicCanvas, majorRadius = 1.0, minorRadius = 0.3, majorSegments = 32, minorSegments = 16, initBuffers = true) {
    const vertices = [];
    const colors = [];
    const textureCoordinates = [];
    const normals = [];

    // Generate vertices, normals, texture coordinates, and colors
    for (let i = 0; i <= majorSegments; i++) {
        const u = (i / majorSegments) * 2.0 * Math.PI;
        for (let j = 0; j <= minorSegments; j++) {
            const v = (j / minorSegments) * 2.0 * Math.PI;

            // Parametric equations for a torus
            const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
            const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
            const z = minorRadius * Math.sin(v);

            // Vertex position (4D with w = 1.0)
            vertices.push(x, y, z, 1.0);

            // Normal vector (4D with w = 0.0)
            const nx = Math.cos(v) * Math.cos(u);
            const ny = Math.cos(v) * Math.sin(u);
            const nz = Math.sin(v);
            normals.push(nx, ny, nz, 0.0);

            // Texture coordinates
            const s = i / majorSegments;
            const t = j / minorSegments;
            textureCoordinates.push(s, t);

            // Color (gradient based on position)
            colors.push(0.5 + 0.5 * Math.cos(u), 0.5 + 0.5 * Math.sin(v), 0.5, 1.0);
        }
    }

    // Generate TRIANGLE_STRIP connectivity
    const stripVertices = [];
    const stripColors = [];
    const stripTextureCoordinates = [];
    const stripNormals = [];

    for (let i = 0; i < majorSegments; i++) {
        for (let j = 0; j <= minorSegments; j++) {
            const idx1 = i * (minorSegments + 1) + j;
            const idx2 = (i + 1) * (minorSegments + 1) + j;

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
        if (i < majorSegments - 1) {
            const lastIdx = (i + 1) * (minorSegments + 1) + minorSegments;
            const nextIdx = (i + 1) * (minorSegments + 1);
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
