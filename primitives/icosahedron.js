function Icosahedron(ec, initBuffers = true){
    const vertices = (()=>{
        const verts = []
        const top = [0,1,0,1]
        const bottom = [0,-1,0,1]
        for(let i=0;i<5;++i){
            const angle = i*(Math.PI*2/5)
            const angle2 = angle + (Math.PI*2/5)
            const angle3 = (angle+angle2)/2
            const latitudeAngle = Math.atan(0.5)
            const y = Math.sin(latitudeAngle)
            const xzRadius = Math.cos(latitudeAngle)
            const x1 = Math.cos(angle)*xzRadius
            const z1 = Math.sin(angle)*xzRadius
            const x2 = Math.cos(angle2)*xzRadius
            const z2 = Math.sin(angle2)*xzRadius
            const x3 = Math.cos(angle3)*xzRadius
            const z3 = Math.sin(angle3)*xzRadius
            //push top triangles
            verts.push(...top,x1,y,z1,1,x2,y,z2,1)
            //push top mid triangles
            verts.push(x1,y,z1,1,x2,y,z2,1,x3,-y,z3,1)
        }
        for(let i=0;i<5;++i){
            const angle = i*(Math.PI*2/5)+Math.PI/5
            const angle2 = angle + (Math.PI*2/5)
            const angle3 = (angle+angle2)/2
            const latitudeAngle = Math.atan(0.5)
            const y = Math.sin(-latitudeAngle)
            const xzRadius = Math.cos(latitudeAngle)
            const x1 = Math.cos(angle)*xzRadius
            const z1 = Math.sin(angle)*xzRadius
            const x2 = Math.cos(angle2)*xzRadius
            const z2 = Math.sin(angle2)*xzRadius
            const x3 = Math.cos(angle3)*xzRadius
            const z3 = Math.sin(angle3)*xzRadius
            //push bottom triangles
            verts.push(...bottom,x1,y,z1,1,x2,y,z2,1)
            //push bottom mid triangles
            verts.push(x1,y,z1,1,x2,y,z2,1,x3,-y,z3,1)
        }
        return verts
    })()
    const colors = vertices.map(v=>1)
    const textureCoordinates = (()=>{
        const tcs = []
        for(let i=0;i<vertices.length;i+=4){
            const x = vertices[i]
            const y = vertices[i+1]
            const u = (x + 1) / 2
            const v = (y + 1) / 2
            tcs.push(u,v)
        }
        return tcs
    })()
    //midpoint of every equilateral triangle can be mean of all three points
    const normals = (()=>{
        const norms = []
        for(let i=0;i<vertices.length;i+=12){
            const pointA = vertices.slice(i,i+4)
            const pointB = vertices.slice(i+4,i+8)
            const pointC = vertices.slice(i+8,i+12)
            //midpoint coords
            const x = (pointA[0]+pointB[0]+pointC[0])/3
            const y = (pointA[1]+pointB[1]+pointC[1])/3
            const z = (pointA[2]+pointB[2]+pointC[2])/3
            //vector length
            const l = Math.sqrt(x**2+y**2+z**2)
            //push normalized values three times
            for(let j=0;j<3;++j)
                norms.push(x/l,y/l,z/l,1)
        }
        return norms
    })()
    const mode = ec.gl.TRIANGLES
    const shape = {vertices,colors,textureCoordinates,normals,mode}
    if(initBuffers)
        ec.initBuffers(shape)
    return shape
}
