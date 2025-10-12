function SquareMesh(ec, divisions = 10, initBuffers = true) {
    const vertices = (() => {
        const verts = [];
        const step = 2 / divisions; // Size of each grid cell
        for (let i = 0; i < divisions; ++i) {
            for (let j = 0; j < divisions; ++j) {
                // Calculate vertex positions for a grid cell
                const x1 = -1 + j * step;
                const x2 = -1 + (j + 1) * step;
                const y1 = -1 + i * step;
                const y2 = -1 + (i + 1) * step;

                // Two triangles per grid cell (lower-left and upper-right)
                // Triangle 1: (x1, y1), (x2, y1), (x2, y2)
                verts.push(x1, y1, 0, 1,  // Bottom-left
                           x2, y1, 0, 1,  // Bottom-right
                           x2, y2, 0, 1); // Top-right

                // Triangle 2: (x1, y1), (x2, y2), (x1, y2)
                verts.push(x1, y1, 0, 1,  // Bottom-left
                           x2, y2, 0, 1,  // Top-right
                           x1, y2, 0, 1); // Top-left
            }
        }
        return verts;
    })();

    const colors = vertices.map(() => 1.0); // White colors (1.0 for r, g, b, a)

    const textureCoordinates = (() => {
        const tcs = [];
        const step = 1 / divisions; // Texture space step
        for (let i = 0; i < divisions; ++i) {
            for (let j = 0; j < divisions; ++j) {
                const u1 = j * step;
                const u2 = (j + 1) * step;
                const v1 = i * step;
                const v2 = (i + 1) * step;

                // Triangle 1: (u1, v1), (u2, v1), (u2, v2)
                tcs.push(u1, v1, u2, v1, u2, v2);

                // Triangle 2: (u1, v1), (u2, v2), (u1, v2)
                tcs.push(u1, v1, u2, v2, u1, v2);
            }
        }
        return tcs;
    })();

    const normals = vertices.map((v, i) => {
        if (i % 4 === 3) return 0; // w-component
        return i % 4 === 2 ? 1 : 0; // Normal points along +z (0, 0, 1)
    });

    const mode = ec.gl.TRIANGLES;
    const shape = {
        vertices,
        colors,
        textureCoordinates,
        normals,
        mode
    };

    if (initBuffers) ec.initBuffers(shape);
    return shape;
}
