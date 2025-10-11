const Octahedron = (ec, initBuffers = true) => {
    const vertices = [
        // top
        // front
        -1, 0, 1, 1,
        1, 0, 1, 1,
        0, Math.sqrt(2), 0, 1,
        // left
        -1, 0, -1, 1,
        -1, 0, 1, 1,
        0, Math.sqrt(2), 0, 1,
        // back
        1, 0, -1, 1,
        -1, 0, -1, 1,
        0, Math.sqrt(2), 0, 1,
        // right
        1, 0, 1, 1,
        1, 0, -1, 1,
        0, Math.sqrt(2), 0, 1,
        // bottom
        // front
        -1, 0, 1, 1,
        1, 0, 1, 1,
        0, -Math.sqrt(2), 0, 1,
        // left
        -1, 0, -1, 1,
        -1, 0, 1, 1,
        0, -Math.sqrt(2), 0, 1,
        // back
        1, 0, -1, 1,
        -1, 0, -1, 1,
        0, -Math.sqrt(2), 0, 1,
        // right
        1, 0, 1, 1,
        1, 0, -1, 1,
        0, -Math.sqrt(2), 0, 1,
    ];
    const colors = (() => {
        const cols = [];
        for (let i = 0; i < 8; ++i) {
            const r = Math.random();
            const g = Math.random();
            const b = Math.random();
            for (let j = 0; j < 3; ++j) {
                cols.push(r, g, b, 1.0);
            }
        }
        return cols;
    })();
    const textureCoordinates = (() => {
        const tcs = [];
        for (let i = 0; i < vertices.length; i += 4) {
            const [x, y, z] = vertices.slice(i, i + 3);
            if (i < vertices.length / 2)
                tcs.push((x + 1) / 2, (z + 1) / 2);
            else
                tcs.push((1 - x) / 2, (z + 1) / 2);
        }
        return tcs;
    })();
    const normals = (() => {
        const norms = [];
        for (let i = 0; i < vertices.length; i += 12) {
            const pointA = vertices.slice(i, i + 4);
            const pointB = vertices.slice(i + 4, i + 8);
            const pointC = vertices.slice(i + 8, i + 12);
            // Compute vectors for two edges
            const v1 = [
                pointB[0] - pointA[0],
                pointB[1] - pointA[1],
                pointB[2] - pointA[2]
            ];
            const v2 = [
                pointC[0] - pointA[0],
                pointC[1] - pointA[1],
                pointC[2] - pointA[2]
            ];
            // Compute cross product for normal
            const n = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            // Normalize
            const l = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2);
            const normal = [n[0] / l, n[1] / l, n[2] / l, 0];
            // Check direction (ensure normal points outward)
            const faceCenter = [
                (pointA[0] + pointB[0] + pointC[0]) / 3,
                (pointA[1] + pointB[1] + pointC[1]) / 3,
                (pointA[2] + pointB[2] + pointC[2]) / 3
            ];
            const dot = n[0] * faceCenter[0] + n[1] * faceCenter[1] + n[2] * faceCenter[2];
            if (dot < 0) {
                normal[0] = -normal[0];
                normal[1] = -normal[1];
                normal[2] = -normal[2];
            }
            // Apply normal to all vertices of the triangle
            for (let j = 0; j < 3; ++j)
                norms.push(...normal);
        }
        return norms;
    })();
    const mode = ec.gl.TRIANGLES;
    const shape = { mode, vertices, colors, textureCoordinates, normals };
    if (initBuffers)
        ec.initBuffers(shape);
    return shape;
};
