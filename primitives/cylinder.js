const Cylinder = (ec, nDivisions, initBuffers = true) => {
    const vertices = (() => {
        const verts = []
        const yTop = 1
        const yBottom = -1
        const zTop = 0
        const zBottom = 0
        const xTop = 0
        const xBottom = 0
        const centerTop = [xTop,yTop,zTop,1.0]
        const centerBottom = [xBottom,yBottom,zBottom,1.0]
        
        //top
        const topVerts = []
        for(let i=0,
                angle=0;
            i<nDivisions;
            ++i,
            angle+=Math.PI*2/nDivisions){
            topVerts.push([Math.cos(angle),
                           yTop,
                           Math.sin(angle),
                           1.0])
        }
        for(let i=0;i<nDivisions;++i){
            const j= (i+1)%nDivisions
            verts.push(...centerTop,
                       ...topVerts[i],
                       ...topVerts[j])
        }
        
        //bottom
        const bottomVerts = []
        for(let i=0,
                angle=0;
            i<nDivisions;
            ++i,
            angle+=Math.PI*2/nDivisions){
            bottomVerts.push([Math.cos(angle),
                              yBottom,
                              Math.sin(angle),
                              1.0])
        }
        for(let i=0;i<nDivisions;++i){
            const j= (i+1)%nDivisions
            verts.push(...centerBottom,
                       ...bottomVerts[i],
                       ...bottomVerts[j])
        }
        
        //sides
        for(let i=0;i<nDivisions;++i){
            const j= (i+1)%nDivisions
            verts.push(...topVerts[i],
                       ...bottomVerts[i],
                       ...bottomVerts[j])
            verts.push(...topVerts[i],
                       ...bottomVerts[j],
                       ...topVerts[j])
        }
        
        
        return verts
    })()
    const colors = (() => {
        const cols = []
        let r,g,b
        //top
        r = Math.random()
        g = Math.random()
        b = Math.random()
        for(let i=0;i<nDivisions*3;++i){
            cols.push(...[r,g,b,1])
        }
        //bottom
        r = Math.random()
        g = Math.random()
        b = Math.random()
        for(let i=0;i<nDivisions*3;++i){
            cols.push(...[r,g,b,1])
        }
        //sides
        for(let j=0;j<nDivisions;++j){
            r = Math.random()
            g = Math.random()
            b = Math.random()
            for(let i=0;i<6;++i){
                cols.push(...[r,g,b,1])
            }
        }
        return cols
    })()
    const textureCoordinates=(() => {
        const tcs = []
        for(let i=0;i<vertices.length;i+=4){
            const vert = vertices.slice(i,i+4)
            //top and bottom
            if(i<2*4*3*nDivisions){
                const u = (vert[0]+1)/2
                const v = (vert[2]+1)/2
                tcs.push(u,v)
            }
            //sides
            else{
               // console.log(i)
                const u = (() => {
                    if(i==vertices.length-4|| i==vertices.length-8||i==vertices.length-16)
                    return 0
                    const angle = (Math.atan2(vert[2],vert[0]) + 2*Math.PI)%(2*Math.PI) 
                    return Math.abs(2*Math.PI-angle)/(2*Math.PI)
                })()
                const v = Math.abs(vert[1]-1)/2
                tcs.push(u,v)
            }
        }
        return tcs
    })()
    const normals = (() => {
        const norms = []
        for(let i=0;i<vertices.length;i+=4){
            if(i<4*3*nDivisions){
                norms.push(...[0,1,0,0])
            }else if(i<2*4*3*nDivisions){
                norms.push(...[0,-1,0,0])
            }else{
                const v = vertices.slice(i,i+4)
                const angleDelta = Math.PI*2/nDivisions/2
                const sideIndex = (i%(6*4))/4
                const angle = Math.atan2(v[2],v[0])
                let normAngle
                if(sideIndex == 0 || sideIndex == 1 || sideIndex == 3){
                    normAngle = angle + angleDelta
                }else{
                    normAngle = angle - angleDelta
                }
                
                const x = Math.cos(normAngle)
                const y = 0
                const z = Math.sin(normAngle)
                norms.push(...[x,y,z,0])
            }
        }
        return norms
    })()
    const mode = ec.gl.TRIANGLES
    const shape={vertices,
                 colors,
                 textureCoordinates,
                 mode,
                 normals}
    if(initBuffers)
        ec.initBuffers(shape)
    return shape
}
