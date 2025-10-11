function Icosahedron(ec, initBuffers = true) {
    const vertices = (() => {
        const verts = [];
        const top = [0, 1, 0, 1];
        const bottom = [0, -1, 0, 1];
        for (let i = 0; i < 5; ++i) {
            const angle = i * (Math.PI * 2 / 5);
            const angle2 = angle + (Math.PI * 2 / 5);
            const angle3 = (angle + angle2) / 2;
            const latitudeAngle = Math.atan(0.5);
            const y = Math.sin(latitudeAngle);
            const xzRadius = Math.cos(latitudeAngle);
            const x1 = Math.cos(angle) * xzRadius;
            const z1 = Math.sin(angle) * xzRadius;
            const x2 = Math.cos(angle2) * xzRadius;
            const z2 = Math.sin(angle2) * xzRadius;
            const x3 = Math.cos(angle3) * xzRadius;
            const z3 = Math.sin(angle3) * xzRadius;
            // push top triangles
            verts.push(...top, x1, y, z1, 1, x2, y, z2, 1);
            // push top mid triangles
            verts.push(x1, y, z1, 1, x2, y, z2, 1, x3, -y, z3, 1);
        }
        for (let i = 0; i < 5; ++i) {
            const angle = i * (Math.PI * 2 / 5) + Math.PI / 5;
            const angle2 = angle + (Math.PI * 2 / 5);
            const angle3 = (angle + angle2) / 2;
            const latitudeAngle = Math.atan(0.5);
            const y = Math.sin(-latitudeAngle);
            const xzRadius = Math.cos(latitudeAngle);
            const x1 = Math.cos(angle) * xzRadius;
            const z1 = Math.sin(angle) * xzRadius;
            const x2 = Math.cos(angle2) * xzRadius;
            const z2 = Math.sin(angle2) * xzRadius;
            const x3 = Math.cos(angle3) * xzRadius;
            const z3 = Math.sin(angle3) * xzRadius;
            // push bottom triangles
            verts.push(...bottom, x1, y, z1, 1, x2, y, z2, 1);
            // push bottom mid triangles
            verts.push(x1, y, z1, 1, x2, y, z2, 1, x3, -y, z3, 1);
        }
        return verts;
    })();
    const colors = (() => {
        const cols = [];
        for (let i = 0; i < vertices.length / 4; i++) {
            cols.push(1.0, 1.0, 1.0, 1.0); // White with full opacity
        }
        return cols;
    })();
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
    const shape = { vertices, colors, textureCoordinates, normals, mode };
    if (initBuffers)
        ec.initBuffers(shape);
    return shape;
}
