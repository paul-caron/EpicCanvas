const Octahedron = (ec) => {
const vertices = [
//top

//front
-1,0,1,1,
1,0,1,1,
0,Math.sqrt(2),0,1,

//left
-1,0,-1,1,
-1,0,1,1,
0,Math.sqrt(2),0,1,

//back
1,0,-1,1,
-1,0,-1,1,
0,Math.sqrt(2),0,1,

//right
1,0,1,1,
1,0,-1,1,
0,Math.sqrt(2),0,1,

//bottom
//front
-1,0,1,1,
1,0,1,1,
0,-Math.sqrt(2),0,1,

//left
-1,0,-1,1,
-1,0,1,1,
0,-Math.sqrt(2),0,1,

//back
1,0,-1,1,
-1,0,-1,1,
0,-Math.sqrt(2),0,1,

//right
1,0,1,1,
1,0,-1,1,
0,-Math.sqrt(2),0,1,

]
const colors = (() => {
    const cols = []
    for(let i=0;i<8;++i){
        const r = Math.random()
        const g = Math.random()
        const b = Math.random()
        for(let j=0;j<3;++j){
            cols.push(r,g,b,1.0)
        }
    }
    return cols
})()
const textureCoordinates = (()=>{
    const tcs = []
    for(let i=0;i<vertices.length;i+=4){
        const [x,y,z] = vertices.slice(i,i+3)
        if(i<vertices.length/2)
        tcs.push((x+1)/2, (z+1)/2)
        else
        tcs.push((1-x)/2, (z+1)/2)
    }
    return tcs
})()
const normals = (()=>{
    const n = 2.526112945
    const cosN = Math.cos(n)
    const sinN = Math.sin(n)
    const norms = []
    for(let i=0;i<8;++i){
        const x = i%2?i%4==3?-cosN:cosN:0
        const y = sinN
        const z = i%2?0:i%4==0?-cosN:cosN
        for(let j=0;j<3;++j){
            if(i<4)
            norms.push(x,y,z,1.0)
            else
            norms.push(x,-y,z,1.0)
        }
    }
    return norms
})()
const mode = ec.gl.TRIANGLES
const shape = {mode,vertices,colors,textureCoordinates,normals}
ec.initBuffers(shape)
return shape
}

