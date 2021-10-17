function RegularPolygon(ec,numberOfCorners){
    const vertices=(()=>{
        const verts=[0,0,0,1.0]
        const z=0
        let angle=Math.PI/2
        for(let i=0;i<=numberOfCorners;++i){
            const x=Math.cos(angle)
            const y=Math.sin(angle)
            verts.push(x,y,z,1.0)
            angle+=2*Math.PI/numberOfCorners
        }
        return verts
    })()
    const colors=(()=>{
        const cols = []
        for(const v of vertices){
            cols.push(0.1,0.1,0.1,1)
        }
        cols[0]=cols[1]=cols[2]=1
        return cols
    })()
    const textureCoordinates=(()=>{
        const tcs=[]
        //from radius -1 to 1, to 0 to 1 ((v+1)/2)
        for(let i=0;i<vertices.length;i+=4){
            tcs.push((vertices[i]+1)/2,
                     (Math.abs(vertices[i+1]-1))/2)
        }
        return tcs
    })()
    const normals=(()=>{
        const norms=[]
        for(let i=0;i<vertices.length;i+=4){
            norms.push(...[0,0,1,1])
        }
        return norms
    })()
    const mode=ec.gl.TRIANGLE_FAN
    const shape={vertices,
                 colors,
                 textureCoordinates,
                 mode,
                 normals}
    ec.initBuffers(shape)
    return shape
}

