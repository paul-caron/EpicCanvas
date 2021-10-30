
/*
Author: Paul Caron
Date: July 24th 2020
Special thanks to mozilla docs for the webgl tutorial
https://developer.mozilla.org/fr/docs/Web/API/WebGL_API
*/

class EpicCanvas{
constructor(width,height,container){
    this.models=[]
    this.textures=[]
    this.canvas
    this.gl
    this.matrices
    this.createCanvas(width,height,container)
    this.clearColor=[0.0,0.0,0.0,1.0]
    this.ambientColor=[0,0,0]
    this.directionalColor=[0,0,0]
    this.directionalVector=[0,0,1]
    this.pointLightPosition=[0,0,0]
    this.pointLightColor=[0,0,0]
    this._fieldOfView=60*Math.PI/180
    this._aspectRatio=this.gl.canvas.clientWidth/
                      this.gl.canvas.clientHeight
    this._zNear=0.1
    this._zFar=100.0
    this.matrices=this.getMatrices()
}
createCanvas(width,height,container){
    this.canvas=document.createElement("canvas")
    this.canvas.width=width
    this.canvas.height=height
    this.gl=this.canvas.getContext("webgl")
    if(!this.gl){
        alert("Sorry. Webgl is not supported by your browser.")
        return
    }
    document.querySelector(container)
            .appendChild(this.canvas)
}
getMatrices(){
    const projectionMatrix=mat4.create()
    mat4.perspective(
        projectionMatrix,
        this._fieldOfView,
        this._aspectRatio,
        this._zNear,
        this._zFar)
        
    const modelViewMatrix=mat4.create()
    const modelMatrix = mat4.create()
    const viewMatrix = mat4.create()
    const normalMatrix=mat4.create()
    return {projectionMatrix, modelViewMatrix, modelMatrix, viewMatrix, normalMatrix}
}
updateModelViewMatrix(){
    mat4.multiply(
        this.matrices.modelViewMatrix,
        this.matrices.viewMatrix,
        this.matrices.modelMatrix)
}
rotateMatrix(m,angle,vec3){
    let update = false
    if(m == this.matrices.viewMatrix || m == this.matrices.modelMatrix){
        update = true
    }
    mat4.rotate(m,m,angle,vec3)
    if(update) this.updateModelViewMatrix()
}
translateMatrix(m,vec3){
    let update = false
    if(m == this.matrices.viewMatrix || m == this.matrices.modelMatrix){
        update = true
    }
    mat4.translate(m,m,vec3)
    if(update) this.updateModelViewMatrix()
}
scaleMatrix(m,vec3){
    let update = false
    if(m == this.matrices.viewMatrix || m == this.matrices.modelMatrix){
        update = true
    }
    mat4.scale(m,m,vec3)
    if(update) this.updateModelViewMatrix()
}
set fieldOfView(angle){
    this._fieldOfView = angle
    mat4.perspective(
        this.matrices.projectionMatrix,
        this._fieldOfView,
        this._aspectRatio,
        this._zNear,
        this._zFar)
}
set zNear(newZNear){
    this._zNear = newZNear
    mat4.perspective(
        this.matrices.projectionMatrix,
        this._fieldOfView,
        this._aspectRatio,
        this._zNear,
        this._zFar)
}
set zFar(newZFar){
    this._zFar = newZFar
    mat4.perspective(
        this.matrices.projectionMatrix,
        this._fieldOfView,
        this._aspectRatio,
        this._zNear,
        this._zFar)
}
set aspectRatio(newAspectRatio){
    this._aspectRatio = newAspectRatio
    mat4.perspective(
        this.matrices.projectionMatrix,
        this._fieldOfView,
        this._aspectRatio,
        this._zNear,
        this._zFar)
}
clearScreen(){
    this.gl.clearColor(...this.clearColor)
    this.gl.clearDepth(1.0)
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT|    
                  this.gl.DEPTH_BUFFER_BIT)
}
loadTextures(URLs){
    for(const u of URLs){
        this.loadTexture(u)
    }
}
loadTexture(url, options = {}){
    const {minFilter, magFilter, mipmapFilter, anisotropy} = options
    const texture=this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D,texture)
    const level=0
    const internalFormat=this.gl.RGBA
    const width=1
    const height=1
    const border=0
    const srcFormat=this.gl.RGBA
    const srcType=this.gl.UNSIGNED_BYTE
    const pixel=new Uint8Array([0,0,255,255])
    this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    )
    const image=new Image()
    image.crossOrigin=""
    image.onload=()=>{
        this.gl.bindTexture(this.gl.TEXTURE_2D,texture)
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        )
        if(isPowerOf2(image.width)&&isPowerOf2(image.height)){
            this.gl.generateMipmap(this.gl.TEXTURE_2D)
            if(mipmapFilter != "nearest"){
                if(minFilter != "nearest"){
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.LINEAR_MIPMAP_LINEAR
                    )
                }else{
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.NEAREST_MIPMAP_LINEAR
                    )
                }
            }else{
                if(minFilter != "nearest"){
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.LINEAR_MIPMAP_NEAREST
                    )
                }else{
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.NEAREST_MIPMAP_NEAREST
                    )
                }
            }
            if(magFilter != "nearest"){
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MAG_FILTER,
                    this.gl.LINEAR
                )
            }else{
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MAG_FILTER,
                    this.gl.NEAREST
                )
            }
            if(anisotropy){
                const ext = (this.gl.getExtension('EXT_texture_filter_anisotropic') || this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') );
                if (ext){
                    const max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
                    const anisotropyValue = max * anisotropy
                    this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropyValue)
                }
            }
        }else{
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_S,
                this.gl.CLAMP_TO_EDGE
            )
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_WRAP_T,
                this.gl.CLAMP_TO_EDGE
            )
            if(minFilter != "nearest"){
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MIN_FILTER,
                    this.gl.LINEAR
                )
            }else{
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MIN_FILTER,
                    this.gl.NEAREST
                )
            }
            if(magFilter != "nearest"){
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MAG_FILTER,
                    this.gl.LINEAR
                )
            }else{
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MAG_FILTER,
                    this.gl.NEAREST
                )
            }
        }
    }
    image.src=url
    this.textures.push(texture)
    function isPowerOf2(value){
        return (value&(value-1))==0;
    }
    return texture
}
updateTexture(texture, url){
    function powerOfTwo(value){
        return (value&(value-1))==0;
    }
    const img = new Image()
    img.crossOrigin=""
    img.onload = (()=>{
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D, 0, 0, 0, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, img
        )
        if(powerOfTwo(img.width)&&powerOfTwo(img.height)){
            this.gl.generateMipmap(this.gl.TEXTURE_2D)
        }
        else{
            this.gl.texParameteri(this.gl.TEXTURE_2D,
                                this.gl.TEXTURE_WRAP_S,
                                this.gl.CLAMP_TO_EDGE )
            this.gl.texParameteri(this.gl.TEXTURE_2D,
                                this.gl.TEXTURE_WRAP_T,
                                this.gl.CLAMP_TO_EDGE )
            this.gl.texParameteri(this.gl.TEXTURE_2D,
                                this.gl.TEXTURE_MIN_FILTER,
                                this.gl.LINEAR )
        }
    })
    img.src = url
}

setTexture(texture){
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        texture
    )
}




async loadObj(url){
    const response=await fetch(url)
    const text=await response.text()
    this.pushObj(text)
}
pushObj(text){
    const vertices=[]
    const lines=text.split("\n")
    const vlines=lines.filter(line=>line.trim().startsWith("v "))
    const flines=lines.filter(line=>line.trim().startsWith("f "))
    flines.forEach(line=>{
        const indices=line.trim().split(" ")
        indices.shift()
        for(const i of indices){
            let vl=vlines[i-1].trim()
            vl=vl.split(" ")
            vl.shift()
            for(const v of vl)
                vertices.push(parseFloat(v))
            vertices.push(1.0)
        }
    })
    const colors=new Array(vertices.length)
    for(let i=0;i<colors.length;i+=4){
        colors[i]=(vertices[i]+1)*0.5
        colors[i+1]=(vertices[i+1]+1)*0.5
        colors[i+2]=(vertices[i+2]+1)*0.5
        colors[i+3]=1.0
    }
    const textureCoordinates=new Array(vertices.length/2)
    for(let i=0;i<colors.length;i+=2){
        textureCoordinates[i]=(vertices[i]+1)*0.25+(-vertices[i+2]+1)*0.25
        textureCoordinates[i+1]=(vertices[i+1]+1)*0.25+(-vertices[i+2]+1)*0.25
    }
    const mode=this.gl.TRIANGLES
    const shape={vertices,colors,textureCoordinates,mode}
    this.initBuffers(shape)
    this.models.push(shape)
}
initBuffers(shape){
    const {vertices,colors,textureCoordinates,normals}=shape
    const positionBuffer=this.gl.createBuffer() 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,positionBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(vertices),this.gl.STATIC_DRAW)
    const colorBuffer=this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,colorBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(colors),this.gl.STATIC_DRAW)
    const textureCoordBuffer=this.gl.createBuffer() 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,textureCoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(textureCoordinates),this.gl.STATIC_DRAW)
    const normalsBuffer=this.gl.createBuffer() 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,normalsBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(normals),this.gl.STATIC_DRAW)
   shape.buffers={position:positionBuffer,color:colorBuffer, textureCoord:textureCoordBuffer,normals:normalsBuffer}
}
reloadBufferData(shape){
    const {vertices,colors,textureCoordinates,buffers,normals}=shape
    const positionBuffer=buffers.position
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,positionBuffer) 
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(vertices),this.gl.STATIC_DRAW)
    const colorBuffer=buffers.color 
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,colorBuffer) 
    this.gl.bufferData( this.gl.ARRAY_BUFFER,new Float32Array(colors),this.gl.STATIC_DRAW)
    const textureCoordBuffer=buffers.textureCoord 
     this.gl.bindBuffer(this.gl.ARRAY_BUFFER,textureCoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(textureCoordinates),this.gl.STATIC_DRAW)
    const normalsBuffer=buffers.normals
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER,normalsBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(normals),this.gl.STATIC_DRAW)
}

_initShaderProgram(vsSource,fsSource){
    const vertexShader=this._loadShader(this.gl.VERTEX_SHADER,vsSource)
    const fragmentShader=this._loadShader(this.gl.FRAGMENT_SHADER,fsSource)
    const shaderProgram=this.gl.createProgram()
    this.gl.attachShader(shaderProgram,vertexShader) 
    this.gl.attachShader(shaderProgram,fragmentShader)
    this.gl.linkProgram(shaderProgram)
    if(!this.gl.getProgramParameter(shaderProgram,this.gl.LINK_STATUS)) {
         alert("Unable to initialise shader: " + this.gl.getProgramInfoLog(shaderProgram))
         return null
    }
    return shaderProgram;
}
_loadShader(type,source){
    const shader=this.gl.createShader(type)
    this.gl.shaderSource(shader,source)
    this.gl.compileShader(shader);
    if(!this.gl.getShaderParameter(shader,this.gl.COMPILE_STATUS)) {
         alert('An error occurred compiling the shaders: '+this.gl.getShaderInfoLog(shader))
         this.gl.deleteShader(shader)
         return null
    }
    return shader
}



getProgramInfo(vsSource, fsSource){
    const shaderProgram = this._initShaderProgram(vsSource,fsSource)
    const gl = this.gl
    return {
    program:shaderProgram,
    attribLocations:{
        vertexPosition:gl.getAttribLocation(
            shaderProgram,
            'aVertexPosition'
        ),
        vertexColor:gl.getAttribLocation(
            shaderProgram,'aVertexColor'
        ),
        textureCoord:gl.getAttribLocation(
            shaderProgram,'aTextureCoord'
        ),
        vertexNormal:gl.getAttribLocation(
            shaderProgram,'aVertexNormal'
        )
    },
    uniformLocations:{
        projectionMatrix:gl.getUniformLocation(
            shaderProgram,'uProjectionMatrix'
        ),
        modelViewMatrix:gl.getUniformLocation(
            shaderProgram,'uModelViewMatrix'
        ),
        normalMatrix:gl.getUniformLocation(
            shaderProgram,'uNormalMatrix'
        ),
        sampler:gl.getUniformLocation(
            shaderProgram,'uSampler'
        ),
        ambientLight:gl.getUniformLocation(
            shaderProgram, 'ambientLight'
        ),
        directionalLightColor:gl.getUniformLocation(
            shaderProgram, 'directionalLightColor'
        ),
        directionalVector:gl.getUniformLocation(
            shaderProgram, 'directionalVector'
        ),
        pointLightPosition:gl.getUniformLocation(
            shaderProgram, 'pointLightPosition'),
        pointLightColor:gl.getUniformLocation(
            shaderProgram, 'pointLightColor'
        ),
    },
}
}







}

function drawShape(epicCanvas,programInfo,shape){
    const {gl,matrices}=epicCanvas
    const {projectionMatrix,modelViewMatrix,normalMatrix}=matrices
    const {buffers,mode}=shape
    {
        const numComponents=4
        const type=gl.FLOAT
        const normalize=false
        const stride=0
        const offset=0 
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.position) 
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset
        )
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition
        )
    }
    if(programInfo.attribLocations.vertexColor!=-1)
    {
        const numComponents=4
        const type=gl.FLOAT
        const normalize=false
        const stride=0
        const offset=0 
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.color)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset
        )
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor
        )
    }
    if(programInfo.attribLocations.textureCoord!=-1)
    {
        const numComponents=2
        const type=gl.FLOAT
        const normalize=false
        const stride=0
        const offset=0
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.textureCoord)
        gl.vertexAttribPointer(
            programInfo.attribLocations.textureCoord,
            numComponents,
            type,
            normalize,
            stride,
            offset
        )
        gl.enableVertexAttribArray(
            programInfo.attribLocations.textureCoord
        )
    }
    if(programInfo.attribLocations.vertexNormal!=-1)
    {
        const numComponents=4
        const type=gl.FLOAT
        const normalize=false
        const stride=0
        const offset=0
        gl.bindBuffer(gl.ARRAY_BUFFER,buffers.normals)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset
        )
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal
        )
    }
    gl.useProgram(programInfo.program) 
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,       
        false,
        projectionMatrix
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix, 
        false,
        modelViewMatrix
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
    )
    gl.uniform3fv(
        programInfo.uniformLocations.ambientLight,
        new Float32Array(epicCanvas.ambientColor)
    )
    gl.uniform3fv(
        programInfo.uniformLocations.directionalLightColor, 
        new Float32Array(epicCanvas.directionalColor)
    )
    gl.uniform3fv(
        programInfo.uniformLocations.directionalVector,
        new Float32Array(epicCanvas.directionalVector)
    )
    gl.uniform3fv(
        programInfo.uniformLocations.pointLightPosition, 
        new Float32Array(epicCanvas.pointLightPosition)
    )
    gl.uniform3fv(
        programInfo.uniformLocations.pointLightColor,
        new Float32Array(epicCanvas.pointLightColor)
    )
    {
        const offset=0
        const vertexCount=shape.vertices.length/4
        gl.drawArrays(mode,offset,vertexCount)
    }
}



function translate(shape,x,y,z){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i]+=x
        shape.vertices[i+1]+=y
        shape.vertices[i+2]+=z
    }
}

function translateX(shape,translation){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i]+=translation
    }
}

function translateY(shape,translation){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i+1]+=translation
    }
}

function translateZ(shape,translation){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i+2]+=translation
    }
}

function rotateX(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const y=shape.vertices[i+1]
        const z=shape.vertices[i+2]
        shape.vertices[i+1]=y*cosA-z*sinA
        shape.vertices[i+2]=y*sinA+z*cosA
    }
    for(let i=0;i<shape.normals.length;i+=4){
        const y=shape.normals[i+1]
        const z=shape.normals[i+2]
        shape.normals[i+1]=y*cosA-z*sinA
        shape.normals[i+2]=y*sinA+z*cosA
    }
}

function rotateY(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const x=shape.vertices[i]
        const z=shape.vertices[i+2]
        shape.vertices[i]=x*cosA+z*sinA
        shape.vertices[i+2]=-x*sinA+z*cosA
    }
    for(let i=0;i<shape.normals.length;i+=4){
        const x=shape.normals[i]
        const z=shape.normals[i+2]
        shape.normals[i]=x*cosA+z*sinA 
        shape.normals[i+2]=-x*sinA+z*cosA
    }
}

function rotateZ(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const x=shape.vertices[i]
        const y=shape.vertices[i+1]
        shape.vertices[i]=x*cosA-y*sinA
        shape.vertices[i+1]=x*sinA+y*cosA
    }
    for(let i=0;i<shape.normals.length;i+=4){
        const x=shape.normals[i]
        const y=shape.normals[i+1]
        shape.normals[i]=x*cosA-y*sinA
        shape.normals[i+1]=x*sinA+y*cosA
    }
}

function rotateXW(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const x=shape.vertices[i]
        const w=shape.vertices[i+3]
        shape.vertices[i]=x*cosA+w*sinA
        shape.vertices[i+3]=-x*sinA+w*cosA
    }
}

function rotateYW(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const y=shape.vertices[i+1]
        const w=shape.vertices[i+3]
        shape.vertices[i+1]=y*cosA-w*sinA
        shape.vertices[i+3]=y*sinA+w*cosA
    }
}

function rotateZW(shape,angle){
    const cosA=Math.cos(angle)
    const sinA=Math.sin(angle)
    for(let i=0;i<shape.vertices.length;i+=4){
        const z=shape.vertices[i+2]
        const w=shape.vertices[i+3]
        shape.vertices[i+2]=z*cosA-w*sinA
        shape.vertices[i+3]=z*sinA+w*cosA
    }
}

function translateW(shape,translation){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i+3]+=translation
    }
}

function scale(shape,scaleX,scaleY,scaleZ){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i]*=scaleX
        shape.vertices[i+1]*=scaleY
        shape.vertices[i+2]*=scaleZ
    }
}







