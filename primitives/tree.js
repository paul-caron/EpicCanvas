function Tree(epicCanvas, trunkRadius = 0.1, trunkHeight = 1.0, branchLevels = 2, branchesPerLevel = 3, pathSegments = 16, tubeSegments = 12, initBuffers = true) {
    const vertices = [];
    const colors = [];
    const textureCoordinates = [];
    const normals = [];
    const rand = (min, max) => Math.random() * (max - min) + min; // Random helper

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

    // Function to generate a tube (trunk or branch) with TRIANGLES
    function addTube(start, direction, length, radius, segments, tubeSegs, baseT, colorBase) {
        const tubeVerts = [];
        const tubeNorms = [];
        const tubeTex = [];
        const tubeCols = [];

        // Generate vertex data for the tube
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pos = [
                start[0] + t * direction[0] * length,
                start[1] + t * direction[1] * length,
                start[2] + t * direction[2] * length
            ];
            const rad = radius * (1 - t * 0.5); // Taper the tube

            // Tangent is the direction vector
            const tangent = normalize(direction);
            const arbitrary = [0, 0, 1];
            const normal = normalize(cross(tangent, arbitrary));
            const binormal = normalize(cross(tangent, normal));

            for (let j = 0; j < tubeSegs; j++) { // Note: < tubeSegs (not <=) to avoid duplicate vertices
                const theta = (j / tubeSegs) * 2.0 * Math.PI;
                const thetaNext = ((j + 1) / tubeSegs) * 2.0 * Math.PI;
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);
                const cosThetaNext = Math.cos(thetaNext);
                const sinThetaNext = Math.sin(thetaNext);

                // Tube circle coordinates at current and next theta
                const tubeX = cosTheta * normal[0] + sinTheta * binormal[0];
                const tubeY = cosTheta * normal[1] + sinTheta * binormal[1];
                const tubeZ = cosTheta * normal[2] + sinTheta * binormal[2];
                const tubeXNext = cosThetaNext * normal[0] + sinThetaNext * binormal[0];
                const tubeYNext = cosThetaNext * normal[1] + sinThetaNext * binormal[1];
                const tubeZNext = cosThetaNext * normal[2] + sinThetaNext * binormal[2];

                // Vertex position
                tubeVerts.push(
                    pos[0] + rad * tubeX,
                    pos[1] + rad * tubeY,
                    pos[2] + rad * tubeZ,
                    1.0
                );
                // Normal
                tubeNorms.push(tubeX, tubeY, tubeZ, 0.0);
                // Texture coordinates
                tubeTex.push(baseT + t, j / tubeSegs);
                // Color
                const green = t * 0.5;
                tubeCols.push(colorBase[0], colorBase[1] + green, colorBase[2], 1.0);
            }
        }

        // Generate TRIANGLES (two per quad)
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < tubeSegs; j++) {
                const idx0 = i * tubeSegs + j;
                const idx1 = i * tubeSegs + (j + 1) % tubeSegs;
                const idx2 = (i + 1) * tubeSegs + j;
                const idx3 = (i + 1) * tubeSegs + (j + 1) % tubeSegs;

                // Triangle 1: idx0, idx1, idx2
                vertices.push(
                    tubeVerts[idx0 * 4], tubeVerts[idx0 * 4 + 1], tubeVerts[idx0 * 4 + 2], tubeVerts[idx0 * 4 + 3],
                    tubeVerts[idx1 * 4], tubeVerts[idx1 * 4 + 1], tubeVerts[idx1 * 4 + 2], tubeVerts[idx1 * 4 + 3],
                    tubeVerts[idx2 * 4], tubeVerts[idx2 * 4 + 1], tubeVerts[idx2 * 4 + 2], tubeVerts[idx2 * 4 + 3]
                );
                normals.push(
                    tubeNorms[idx0 * 4], tubeNorms[idx0 * 4 + 1], tubeNorms[idx0 * 4 + 2], tubeNorms[idx0 * 4 + 3],
                    tubeNorms[idx1 * 4], tubeNorms[idx1 * 4 + 1], tubeNorms[idx1 * 4 + 2], tubeNorms[idx1 * 4 + 3],
                    tubeNorms[idx2 * 4], tubeNorms[idx2 * 4 + 1], tubeNorms[idx2 * 4 + 2], tubeNorms[idx2 * 4 + 3]
                );
                colors.push(
                    tubeCols[idx0 * 4], tubeCols[idx0 * 4 + 1], tubeCols[idx0 * 4 + 2], tubeCols[idx0 * 4 + 3],
                    tubeCols[idx1 * 4], tubeCols[idx1 * 4 + 1], tubeCols[idx1 * 4 + 2], tubeCols[idx1 * 4 + 3],
                    tubeCols[idx2 * 4], tubeCols[idx2 * 4 + 1], tubeCols[idx2 * 4 + 2], tubeCols[idx2 * 4 + 3]
                );
                textureCoordinates.push(
                    tubeTex[idx0 * 2], tubeTex[idx0 * 2 + 1],
                    tubeTex[idx1 * 2], tubeTex[idx1 * 2 + 1],
                    tubeTex[idx2 * 2], tubeTex[idx2 * 2 + 1]
                );

                // Triangle 2: idx1, idx3, idx2
                vertices.push(
                    tubeVerts[idx1 * 4], tubeVerts[idx1 * 4 + 1], tubeVerts[idx1 * 4 + 2], tubeVerts[idx1 * 4 + 3],
                    tubeVerts[idx3 * 4], tubeVerts[idx3 * 4 + 1], tubeVerts[idx3 * 4 + 2], tubeVerts[idx3 * 4 + 3],
                    tubeVerts[idx2 * 4], tubeVerts[idx2 * 4 + 1], tubeVerts[idx2 * 4 + 2], tubeVerts[idx2 * 4 + 3]
                );
                normals.push(
                    tubeNorms[idx1 * 4], tubeNorms[idx1 * 4 + 1], tubeNorms[idx1 * 4 + 2], tubeNorms[idx1 * 4 + 3],
                    tubeNorms[idx3 * 4], tubeNorms[idx3 * 4 + 1], tubeNorms[idx3 * 4 + 2], tubeNorms[idx3 * 4 + 3],
                    tubeNorms[idx2 * 4], tubeNorms[idx2 * 4 + 1], tubeNorms[idx2 * 4 + 2], tubeNorms[idx2 * 4 + 3]
                );
                colors.push(
                    tubeCols[idx1 * 4], tubeCols[idx1 * 4 + 1], tubeCols[idx1 * 4 + 2], tubeCols[idx1 * 4 + 3],
                    tubeCols[idx3 * 4], tubeCols[idx3 * 4 + 1], tubeCols[idx3 * 4 + 2], tubeCols[idx3 * 4 + 3],
                    tubeCols[idx2 * 4], tubeCols[idx2 * 4 + 1], tubeCols[idx2 * 4 + 2], tubeCols[idx2 * 4 + 3]
                );
                textureCoordinates.push(
                    tubeTex[idx1 * 2], tubeTex[idx1 * 2 + 1],
                    tubeTex[idx3 * 2], tubeTex[idx3 * 2 + 1],
                    tubeTex[idx2 * 2], tubeTex[idx2 * 2 + 1]
                );
            }
        }
    }

    // Generate trunk
    const trunkStart = [0, 0, 0];
    const trunkDir = [0, 0, 1];
    addTube(trunkStart, trunkDir, trunkHeight, trunkRadius, pathSegments, tubeSegments, 0.0, [0.4, 0.2, 0.1]); // Brown trunk

    // Generate branches recursively
    function addBranches(level, start, dir, length, radius, tOffset) {
        if (level > branchLevels) return;
        const baseColor = [0.4 - level * 0.1, 0.2 + level * 0.2, 0.1]; // Shift to greener
        addTube(start, dir, length, radius, pathSegments, tubeSegments, tOffset, baseColor);

        if (level < branchLevels) {
            const nextLength = length * 0.7;
            const nextRadius = radius * 0.6;
            for (let i = 0; i < branchesPerLevel; i++) {
                // Randomize branch direction
                const angle = (i / branchesPerLevel) * 2.0 * Math.PI + rand(-0.2, 0.2);
                const tilt = rand(0.3, 0.7);
                const newDir = normalize([
                    Math.sin(tilt) * Math.cos(angle),
                    Math.sin(tilt) * Math.sin(angle),
                    Math.cos(tilt)
                ]);
                const newStart = [
                    start[0] + dir[0] * length,
                    start[1] + dir[1] * length,
                    start[2] + dir[2] * length
                ];
                addBranches(level + 1, newStart, newDir, nextLength, nextRadius, tOffset + length / trunkHeight);
            }
        }
    }

    // Add branches from the top of the trunk
    const trunkTop = [0, 0, trunkHeight];
    for (let i = 0; i < branchesPerLevel; i++) {
        const angle = (i / branchesPerLevel) * 2.0 * Math.PI + rand(-0.2, 0.2);
        const tilt = rand(0.3, 0.7);
        const branchDir = normalize([
            Math.sin(tilt) * Math.cos(angle),
            Math.sin(tilt) * Math.sin(angle),
            Math.cos(tilt)
        ]);
        addBranches(1, trunkTop, branchDir, trunkHeight * 0.5, trunkRadius * 0.5, 1.0);
    }

    const mode = epicCanvas.gl.TRIANGLES;
    const shape = {
        vertices,
        colors,
        textureCoordinates,
        normals,
        mode
    };

    if (initBuffers) {
        epicCanvas.initBuffers(shape);
    }

    return shape;
}
