function Tetrahedron(ec, initBuffers = true){
    const vertices = [
    -1,-1,-1,1,
    1,1,-1,1,
    1,-1,1,1,
    
    1,1,-1,1,
    1,-1,1,1,
    -1,1,1,1,
    
    -1,-1,-1,1,
    1,1,-1,1,
    -1,1,1,1,
    
    -1,-1,-1,1,
    1,-1,1,1,
    -1,1,1,1,
    ]
    const colors = (() => {
        const cols = []
        for(let i=0;i<4;++i){
            const r = Math.random()
            const g = Math.random()
            const b = Math.random()
            for(let j=0;j<3;++j){
                cols.push(r,g,b,1)
            }
        }
        return cols
    })()
    const textureCoordinates = (() => {
        const tcs = []
        tcs.push(1,1)
        tcs.push(0,0)
        tcs.push(0,1)
        
        tcs.push(1,0)
        tcs.push(1,1)
        tcs.push(0,0)
        
        tcs.push(1,1)
        tcs.push(0,0)
        tcs.push(1,0)
        
        tcs.push(0,1)
        tcs.push(1,1)
        tcs.push(0,0)
        
        return tcs
    })()
    const normals = (() => {
        const norms = []
        for(let i=0;i<3;++i){
            norms.push(1,-1,-1,1)
        }
        for(let i=0;i<3;++i){
            norms.push(1,1,1,1)
        }
        for(let i=0;i<3;++i){
            norms.push(-1,1,-1,1)
        }
        for(let i=0;i<3;++i){
            norms.push(-1,-1,1,1)
        }
        return norms
    })()
    const mode = ec.gl.TRIANGLES
    const shape = {vertices,
                   colors,
                   textureCoordinates,
                   normals,
                   mode}
    if(initBuffers)
        ec.initBuffers(shape)
    return shape
}
