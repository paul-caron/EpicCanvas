function Cube(ec){
    const vertices=[
        //outer
        -1,1,1,1,
        -1,-1,1,1,
        -1,1,1,1,
        -1,1,-1,1,
        -1,1,1,1,
        1,1,1,1,
        1,1,1,1,
        1,-1,1,1,
        1,1,1,1,
        1,1,-1,1,
        -1,1,-1,1,
        1,1,-1,1,
        -1,-1,1,1,
        1,-1,1,1,
        -1,1,-1,1,
        -1,-1,-1,1,
        -1,-1,-1,1,
        -1,-1,1,1,
        -1,-1,-1,1,
        1,-1,-1,1,
        1,-1,-1,1,
        1,-1,1,1,
        1,-1,-1,1,
        1,1,-1,1,
        
        //inner
        -1,1,1,3,
        -1,-1,1,3,
        -1,1,1,3,
        -1,1,-1,3,
        -1,1,1,3,
        1,1,1,3,
        1,1,1,3,
        1,-1,1,3,
        1,1,1,3,
        1,1,-1,3,
        -1,1,-1,3,
        1,1,-1,3,
        -1,-1,1,3,
        1,-1,1,3,
        -1,1,-1,3,
        -1,-1,-1,3,
        -1,-1,-1,3,
        -1,-1,1,3,
        -1,-1,-1,3,
        1,-1,-1,3,
        1,-1,-1,3,
        1,-1,1,3,
        1,-1,-1,3,
        1,1,-1,3,
        
        //inner-outer
        -1,1,1,1,
        -1,1,1,3,
        1,1,1,1,
        1,1,1,3,
        -1,-1,1,1,
        -1,-1,1,3,
        1,-1,1,1,
        1,-1,1,3,
        
        -1,1,-1,1,
        -1,1,-1,3,
        1,1,-1,1,
        1,1,-1,3,
        -1,-1,-1,1,
        -1,-1,-1,3,
        1,-1,-1,1,
        1,-1,-1,3
    ]
    const colors=new Array(vertices.length)
    colors.fill(1.0)
    const textureCoordinates=[]
    const mode=ec.gl.LINES
    const shape={vertices,colors,textureCoordinates,mode}
    ec.initBuffers(shape)
    return shape
}
