function Dodecahedron(ec, initBuffers = true){
    //https://en.m.wikipedia.org/wiki/Regular_dodecahedron
    //https://math.stackexchange.com/questions/3827839/spherical-coordinates-of-a-regular-dodecahedron
    const vertices = (()=>{
        const verts = []
        const phi = (1 + Math.sqrt(5)) / 2
        //top front face
        {
        const pointA = [1,1,1,1]
        const pointB = [1/phi, 0, phi, 1]
        const pointC = [-1/phi, 0, phi, 1]
        const pointD = [-1,1,1,1]
        const pointE = [0,phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //bottom front face
        {
        const pointA = [1,-1,1,1]
        const pointB = [1/phi, 0, phi, 1]
        const pointC = [-1/phi, 0, phi, 1]
        const pointD = [-1,-1,1,1]
        const pointE = [0,-phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        //front right
        {
        const pointA = [1,1,1,1]
        const pointB = [phi, 1/phi, 0, 1]
        const pointC = [phi, -1/phi, 0, 1]
        const pointD = [1,-1,1,1]
        const pointE = [1/phi,0,phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //front left
        {
        const pointA = [-1,1,1,1]
        const pointB = [-phi, 1/phi, 0, 1]
        const pointC = [-phi, -1/phi, 0, 1]
        const pointD = [-1,-1,1,1]
        const pointE = [-1/phi,0,phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        //top right
        {
        const pointA = [1,1,1,1]
        const pointB = [phi, 1/phi, 0, 1]
        const pointC = [1,1,-1, 1]
        const pointD = [0,phi,-1/phi,1]
        const pointE = [0,phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //top left
        {
        const pointA = [-1,1,1,1]
        const pointB = [-phi, 1/phi, 0, 1]
        const pointC = [-1,1,-1, 1]
        const pointD = [0,phi,-1/phi,1]
        const pointE = [0,phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        //bottom right
        {
        const pointA = [1,-1,1,1]
        const pointB = [phi, -1/phi, 0, 1]
        const pointC = [1,-1,-1, 1]
        const pointD = [0,-phi,-1/phi,1]
        const pointE = [0,-phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //bottom left
        {
        const pointA = [-1,-1,1,1]
        const pointB = [-phi, -1/phi, 0, 1]
        const pointC = [-1,-1,-1, 1]
        const pointD = [0,-phi,-1/phi,1]
        const pointE = [0,-phi,1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        
        //top back face
        {
        const pointA = [1,1,-1,1]
        const pointB = [1/phi, 0, -phi, 1]
        const pointC = [-1/phi, 0, -phi, 1]
        const pointD = [-1,1,-1,1]
        const pointE = [0,phi,-1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //bottom back face
        {
        const pointA = [1,-1,-1,1]
        const pointB = [1/phi, 0, -phi, 1]
        const pointC = [-1/phi, 0, -phi, 1]
        const pointD = [-1,-1,-1,1]
        const pointE = [0,-phi,-1/phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        //front right
        {
        const pointA = [1,1,-1,1]
        const pointB = [phi, 1/phi, 0, 1]
        const pointC = [phi, -1/phi, 0, 1]
        const pointD = [1,-1,-1,1]
        const pointE = [1/phi,0,-phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
        }
        
        //front left
        {
        const pointA = [-1,1,-1,1]
        const pointB = [-phi, 1/phi, 0, 1]
        const pointC = [-phi, -1/phi, 0, 1]
        const pointD = [-1,-1,-1,1]
        const pointE = [-1/phi,0,-phi,1]
        const midPoint = [
        (pointA[0]+pointB[0]+pointC[0]+pointD[0]+pointE[0])/5,
        (pointA[1]+pointB[1]+pointC[1]+pointD[1]+pointE[1])/5,
        (pointA[2]+pointB[2]+pointC[2]+pointD[2]+pointE[2])/5,
        1
        ]
        verts.push(...midPoint,...pointA,...pointB)
        verts.push(...midPoint,...pointB,...pointC)
        verts.push(...midPoint,...pointC,...pointD)
        verts.push(...midPoint,...pointD,...pointE)
        verts.push(...midPoint,...pointE,...pointA)
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
            const v = (y + 1) / 2
            tcs.push(u,v)
        }
        return tcs
    })()
    const normals = (()=>{
        const norms = []
        for(let i=0;i<vertices.length;i+=5*4*3){
            const n = vertices.slice(i,i+4)
            const l = Math.sqrt(n[0]**2+n[1]**2+n[2]**2)
            for(let j=0;j<5*3;++j)
                norms.push(n[0]/l,n[1]/l,n[2]/l,1)
        }
        return norms
    })()
    const mode = ec.gl.TRIANGLES
    const shape = {
        vertices, colors, textureCoordinates, normals, mode
    }
    if(initBuffers) ec.initBuffers(shape)
    return shape
}
