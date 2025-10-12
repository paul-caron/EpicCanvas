function Cone(ec, divisions = 10, initBuffers = true) {
    const vertices = (() => {
        const verts = [];
        // Generate base and side triangles
        for (let i = 0; i < divisions; ++i) {
            const angle1 = i * (Math.PI * 2 / divisions);
            const angle2 = (i + 1) * (Math.PI * 2 / divisions);

            const x1 = Math.cos(angle1);
            const z1 = Math.sin(angle1);
            const x2 = Math.cos(angle2);
            const z2 = Math.sin(angle2);

            // Base triangle (at y = -1)
            verts.push(0, -1, 0, 1,  // Center of base
                       x1, -1, z1, 1, // Base vertex 1
                       x2, -1, z2, 1); // Base vertex 2

            // Side triangle (from base to apex)
            verts.push(x1, -1, z1, 1, // Base vertex 1
                       x2, -1, z2, 1, // Base vertex 2
                       0, 1, 0, 1);   // Apex
        }
        return verts;
    })();

    const colors = vertices.map(() => 1.0); // White colors (1.0 for r, g, b, a)

    const textureCoordinates = (() => {
        const tcs = [];
        for (let i = 0; i < vertices.length; i += 4) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            if (Math.abs(y + 1) < 0.0001) { // Base center
                tcs.push(0.5, 0.5); // Center of base texture
            } else if (Math.abs(y - 1) < 0.0001) { // Apex
                tcs.push(0.5, 0); // Apex texture coordinate
            } else { // Base edge
                const u = (x + 1) / 2;
                const v = (z + 1) / 2;
                tcs.push(u, v);
            }
        }
        return tcs;
    })();

    const normals = (() => {
        const norms = [];
        for (let i = 0; i < vertices.length; i += 12) {
            // Base triangle normals (pointing downward)
            norms.push(0, -1, 0, 0, 0, -1, 0, 0, 0, -1, 0, 0);

            // Side triangle normals
            const x1 = vertices[i + 4];
            const z1 = vertices[i + 6];
            const x2 = vertices[i + 8];
            const z2 = vertices[i + 10];
            // Approximate normal for side triangle (average of vertex normals)
            const nx1 = x1 * Math.sqrt(2) / 2; // Normal scaled for cone slope
            const nz1 = z1 * Math.sqrt(2) / 2;
            const nx2 = x2 * Math.sqrt(2) / 2;
            const nz2 = z2 * Math.sqrt(2) / 2;
            norms.push(nx1, Math.sqrt(2) / 2, nz1, 0, // Base vertex 1
                       nx2, Math.sqrt(2) / 2, nz2, 0, // Base vertex 2
                       nx1, Math.sqrt(2) / 2, nz1, 0); // Apex (use one of base normals for simplicity)
        }
        return norms;
    })();

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
