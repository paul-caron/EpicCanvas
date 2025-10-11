
function Square(epicCanvas, initBuffers = true){
    const vertices=[
        1.0,1.0,0.0,1.0,
        -1.0,1.0,0.0,1.0,
        1.0,-1.0,0.0,1.0,
        -1.0,-1.0,0.0,1.0,
    ]
    const colors=[
        1.0,1.0,1.0,1.0,
        1.0,0.0,0.0,1.0,
        0.0,1.0,0.0,1.0,
        0.0,0.0,1.0,1.0,
    ]
    const textureCoordinates=[
        1.0,0.0,
        0.0,0.0,
        1.0,1.0,
        0.0,1.0,
    ]
    const normals=[
        0.0,0.0,1.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,1.0,0.0
    ]
    const mode=epicCanvas.gl.TRIANGLE_STRIP
    const shape={vertices,colors,textureCoordinates,mode,normals}
    if(initBuffers)
        epicCanvas.initBuffers(shape)
    return shape
}
