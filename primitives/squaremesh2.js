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

    const grid = (() => {
        const gridArray = [];
        const step = 2 / divisions;
        for (let y = 0; y < divisions; ++y) {
            gridArray[y] = [];
            for (let x = 0; x < divisions; ++x) {
                // Collect unique vertices for the grid cell (x, y)
                const x1 = -1 + x * step;
                const x2 = -1 + (x + 1) * step;
                const y1 = -1 + y * step;
                const y2 = -1 + (y + 1) * step;

                gridArray[y][x] = [
                    [x1, y1, 0, 1], // Bottom-left
                    [x2, y1, 0, 1], // Bottom-right
                    [x2, y2, 0, 1], // Top-right
                    [x1, y2, 0, 1]  // Top-left
                ];
            }
        }
        return gridArray;
    })();

    // Initial normals (all pointing along +z)
    let normals = vertices.map((v, i) => {
        if (i % 4 === 3) return 0; // w-component
        return i % 4 === 2 ? 1 : 0; // Normal points along +z (0, 0, 1)
    });

    // Function to update normals based on current vertex and grid positions
    const updateNormals = () => {
        normals = new Array(vertices.length).fill(0); // Reset normals
        const step = 2 / divisions;

        // Helper function to compute triangle normal
        const computeTriangleNormal = (v0, v1, v2) => {
            // Vectors v0->v1 and v0->v2
            const u = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
            const v = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
            // Cross product u x v
            const normal = [
                u[1] * v[2] - u[2] * v[1],
                u[2] * v[0] - u[0] * v[2],
                u[0] * v[1] - u[1] * v[0]
            ];
            // Normalize
            const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
            return length > 0 ? normal.map(n => n / length).concat(0) : [0, 0, 1, 0];
        };

        // Helper to update vertex array from grid
        const updateVerticesFromGrid = () => {
            const newVertices = [];
            for (let i = 0; i < divisions; ++i) {
                for (let j = 0; j < divisions; ++j) {
                    const x1 = grid[i][j][0][0];
                    const x2 = grid[i][j][1][0];
                    const y1 = grid[i][j][0][1];
                    const y2 = grid[i][j][2][1];
                    const z1 = grid[i][j][0][2];
                    const z2 = grid[i][j][1][2];
                    const z3 = grid[i][j][2][2];
                    const z4 = grid[i][j][3][2];

                    // Triangle 1: (x1, y1), (x2, y1), (x2, y2)
                    newVertices.push(x1, y1, z1, 1, x2, y1, z2, 1, x2, y2, z3, 1);
                    // Triangle 2: (x1, y1), (x2, y2), (x1, y2)
                    newVertices.push(x1, y1, z1, 1, x2, y2, z3, 1, x1, y2, z4, 1);
                }
            }
            vertices.length = 0;
            vertices.push(...newVertices);
        };

        // Update vertices from grid
        updateVerticesFromGrid();

        // Compute normals for each triangle
        for (let i = 0; i < vertices.length; i += 12) {
            // Triangle 1: vertices[i:i+4], vertices[i+4:i+8], vertices[i+8:i+12]
            const v0 = [vertices[i], vertices[i + 1], vertices[i + 2]];
            const v1 = [vertices[i + 4], vertices[i + 5], vertices[i + 6]];
            const v2 = [vertices[i + 8], vertices[i + 9], vertices[i + 10]];
            const normal1 = computeTriangleNormal(v0, v1, v2);

            // Assign normal to all three vertices of triangle 1
            normals[i] = normal1[0];
            normals[i + 1] = normal1[1];
            normals[i + 2] = normal1[2];
            normals[i + 3] = normal1[3];
            normals[i + 4] = normal1[0];
            normals[i + 5] = normal1[1];
            normals[i + 6] = normal1[2];
            normals[i + 7] = normal1[3];
            normals[i + 8] = normal1[0];
            normals[i + 9] = normal1[1];
            normals[i + 10] = normal1[2];
            normals[i + 11] = normal1[3];

            // Triangle 2: vertices[i+12:i+16], vertices[i+16:i+20], vertices[i+20:i+24]
            const v3 = [vertices[i + 12], vertices[i + 13], vertices[i + 14]];
            const v4 = [vertices[i + 16], vertices[i + 17], vertices[i + 18]];
            const v5 = [vertices[i + 20], vertices[i + 21], vertices[i + 22]];
            const normal2 = computeTriangleNormal(v3, v4, v5);

            // Assign normal to all three vertices of triangle 2
            normals[i + 12] = normal2[0];
            normals[i + 13] = normal2[1];
            normals[i + 14] = normal2[2];
            normals[i + 15] = normal2[3];
            normals[i + 16] = normal2[0];
            normals[i + 17] = normal2[1];
            normals[i + 18] = normal2[2];
            normals[i + 19] = normal2[3];
            normals[i + 20] = normal2[0];
            normals[i + 21] = normal2[1];
            normals[i + 22] = normal2[2];
            normals[i + 23] = normal2[3];
        }

        // Reinitialize buffers if needed
        if (initBuffers) ec.initBuffers(shape);
    };

    const mode = ec.gl.TRIANGLES;
    const shape = {
        vertices,
        colors,
        textureCoordinates,
        normals,
        mode,
        grid,
        updateNormals
    };

    if (initBuffers) ec.initBuffers(shape);
    return shape;
}
