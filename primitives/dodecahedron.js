function Dodecahedron(ec, initBuffers = true) {
    const vertices = (() => {
        const verts = [];
        const phi = (1 + Math.sqrt(5)) / 2;
        // Top front face
        {
            const pointA = [1, 1, 1, 1];
            const pointB = [1 / phi, 0, phi, 1];
            const pointC = [-1 / phi, 0, phi, 1];
            const pointD = [-1, 1, 1, 1];
            const pointE = [0, phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Bottom front face
        {
            const pointA = [1, -1, 1, 1];
            const pointB = [1 / phi, 0, phi, 1];
            const pointC = [-1 / phi, 0, phi, 1];
            const pointD = [-1, -1, 1, 1];
            const pointE = [0, -phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Front right
        {
            const pointA = [1, 1, 1, 1];
            const pointB = [phi, 1 / phi, 0, 1];
            const pointC = [phi, -1 / phi, 0, 1];
            const pointD = [1, -1, 1, 1];
            const pointE = [1 / phi, 0, phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Front left
        {
            const pointA = [-1, 1, 1, 1];
            const pointB = [-phi, 1 / phi, 0, 1];
            const pointC = [-phi, -1 / phi, 0, 1];
            const pointD = [-1, -1, 1, 1];
            const pointE = [-1 / phi, 0, phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Top right
        {
            const pointA = [1, 1, 1, 1];
            const pointB = [phi, 1 / phi, 0, 1];
            const pointC = [1, 1, -1, 1];
            const pointD = [0, phi, -1 / phi, 1];
            const pointE = [0, phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Top left
        {
            const pointA = [-1, 1, 1, 1];
            const pointB = [-phi, 1 / phi, 0, 1];
            const pointC = [-1, 1, -1, 1];
            const pointD = [0, phi, -1 / phi, 1];
            const pointE = [0, phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Bottom right
        {
            const pointA = [1, -1, 1, 1];
            const pointB = [phi, -1 / phi, 0, 1];
            const pointC = [1, -1, -1, 1];
            const pointD = [0, -phi, -1 / phi, 1];
            const pointE = [0, -phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Bottom left
        {
            const pointA = [-1, -1, 1, 1];
            const pointB = [-phi, -1 / phi, 0, 1];
            const pointC = [-1, -1, -1, 1];
            const pointD = [0, -phi, -1 / phi, 1];
            const pointE = [0, -phi, 1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Top back face
        {
            const pointA = [1, 1, -1, 1];
            const pointB = [1 / phi, 0, -phi, 1];
            const pointC = [-1 / phi, 0, -phi, 1];
            const pointD = [-1, 1, -1, 1];
            const pointE = [0, phi, -1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Bottom back face
        {
            const pointA = [1, -1, -1, 1];
            const pointB = [1 / phi, 0, -phi, 1];
            const pointC = [-1 / phi, 0, -phi, 1];
            const pointD = [-1, -1, -1, 1];
            const pointE = [0, -phi, -1 / phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Back right
        {
            const pointA = [1, 1, -1, 1];
            const pointB = [phi, 1 / phi, 0, 1];
            const pointC = [phi, -1 / phi, 0, 1];
            const pointD = [1, -1, -1, 1];
            const pointE = [1 / phi, 0, -phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        // Back left
        {
            const pointA = [-1, 1, -1, 1];
            const pointB = [-phi, 1 / phi, 0, 1];
            const pointC = [-phi, -1 / phi, 0, 1];
            const pointD = [-1, -1, -1, 1];
            const pointE = [-1 / phi, 0, -phi, 1];
            const midPoint = [
                (pointA[0] + pointB[0] + pointC[0] + pointD[0] + pointE[0]) / 5,
                (pointA[1] + pointB[1] + pointC[1] + pointD[1] + pointE[1]) / 5,
                (pointA[2] + pointB[2] + pointC[2] + pointD[2] + pointE[2]) / 5,
                1
            ];
            verts.push(...midPoint, ...pointA, ...pointB);
            verts.push(...midPoint, ...pointB, ...pointC);
            verts.push(...midPoint, ...pointC, ...pointD);
            verts.push(...midPoint, ...pointD, ...pointE);
            verts.push(...midPoint, ...pointE, ...pointA);
        }
        return verts;
    })();
    const colors = vertices.map(v => 1.0);
    const textureCoordinates = (() => {
        const tcs = [];
        for (let i = 0; i < vertices.length; i += 4) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const u = (x + 1) / 2;
            const v = (y + 1) / 2;
            tcs.push(u, v);
        }
        return tcs;
    })();
    const normals = (() => {
        const norms = [];
        for (let i = 0; i < vertices.length; i += 5 * 4 * 3) {
            // Get two edges of the face (e.g., from midpoint to two vertices)
            const midPoint = vertices.slice(i, i + 4);
            const pointA = vertices.slice(i + 4, i + 8);
            const pointB = vertices.slice(i + 8, i + 12);
            // Compute vectors from midpoint to vertices
            const v1 = [
                pointA[0] - midPoint[0],
                pointA[1] - midPoint[1],
                pointA[2] - midPoint[2]
            ];
            const v2 = [
                pointB[0] - midPoint[0],
                pointB[1] - midPoint[1],
                pointB[2] - midPoint[2]
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
                (vertices[i] + vertices[i + 4] + vertices[i + 8] + vertices[i + 12] + vertices[i + 16]) / 5,
                (vertices[i + 1] + vertices[i + 5] + vertices[i + 9] + vertices[i + 13] + vertices[i + 17]) / 5,
                (vertices[i + 2] + vertices[i + 6] + vertices[i + 10] + vertices[i + 14] + vertices[i + 18]) / 5
            ];
            const dot = n[0] * faceCenter[0] + n[1] * faceCenter[1] + n[2] * faceCenter[2];
            if (dot < 0) {
                normal[0] = -normal[0];
                normal[1] = -normal[1];
                normal[2] = -normal[2];
            }
            // Apply normal to all vertices of the face (5 triangles × 3 vertices)
            for (let j = 0; j < 5 * 3; ++j)
                norms.push(...normal);
        }
        return norms;
    })();
    const mode = ec.gl.TRIANGLES;
    const shape = {
        vertices, colors, textureCoordinates, normals, mode
    };
    if (initBuffers) ec.initBuffers(shape);
    return shape;
}
