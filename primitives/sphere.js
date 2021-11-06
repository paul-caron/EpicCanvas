function Sphere(ec, divisions = 10, initBuffers = true){
    const vertices = (()=>{
        const verts = []
        for(let i=0;i<divisions;++i){
            const latitudeAngle = Math.PI/2 + i*(Math.PI/divisions)
            const latitudeAngle2 = Math.PI/2 + (i+1)*(Math.PI/divisions)
            for(let j=0;j<divisions;++j){
                const azimuthAngle = j*(Math.PI*2/divisions)
                const azimuthAngle2 = (j+1)*(Math.PI*2/divisions)
                const y1 = Math.sin(latitudeAngle)
                const y2 = Math.sin(latitudeAngle2)
                
                const xzRadius1 = Math.cos(latitudeAngle)
                const xzRadius2 = Math.cos(latitudeAngle2)
                
                const x1 = Math.cos(azimuthAngle)*xzRadius1
                const x2 = Math.cos(azimuthAngle2)*xzRadius1
                const x3 = Math.cos(azimuthAngle)*xzRadius2
                const x4 = Math.cos(azimuthAngle2)*xzRadius2
                
                const z1 = Math.sin(azimuthAngle)*xzRadius1
                const z2 = Math.sin(azimuthAngle2)*xzRadius1
                const z3 = Math.sin(azimuthAngle)*xzRadius2
                const z4 = Math.sin(azimuthAngle2)*xzRadius2
                
                
                verts.push(x1,y1,z1,1,x2,y1,z2,1,x4,y2,z4,1)
                verts.push(x1,y1,z1,1,x3,y2,z3,1,x4,y2,z4,1)
            }
        }
        return verts
    })()
    const colors = vertices.map(v=>1.0)
    const textureCoordinates = (()=>{
        const tcs = []
        for(let i=0;i<vertices.length;i+=4){
            const x = vertices[i]
            const y = vertices[i+1]
            const u = (x + 1) / 2
            const v = Math.abs(1 - y) / 2
            tcs.push(u,v)
        }
        return tcs
    })()
    const normals = vertices.map(v=>v)
    const mode = ec.gl.TRIANGLES
    const shape = {
        vertices, colors, textureCoordinates, normals, mode
    }
    if(initBuffers) ec.initBuffers(shape)
    return shape
}
