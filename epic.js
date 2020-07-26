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
        document.querySelector(container).appendChild(this.canvas)
    }
    getMatrices(){
        const fieldOfView=60*Math.PI/180
        const aspect=this.gl.canvas.clientWidth/this.gl.canvas.clientHeight
        const zNear=0.1
        const zFar=100.0
        const projectionMatrix=mat4.create()
        mat4.perspective(
            projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar
        )
        const modelViewMatrix=mat4.create()
        return {projectionMatrix,modelViewMatrix}
    }
    clearScreen(){
        this.gl.clearColor(...this.clearColor)
        this.gl.clearDepth(1.0)
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LEQUAL)
        this.gl.enable(this.gl.BLEND)
        this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT|this.gl.DEPTH_BUFFER_BIT)
    }
    loadTextures(URLs){
        for(const u of URLs){
            this.loadTexture(u)
        }
    }
    loadTexture(url){
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
            if(isPowerOf2(image.width)
            &&isPowerOf2(image.height)){
                this.gl.generateMipmap(this.gl.TEXTURE_2D)
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
                this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.LINEAR
                )
            }
        }
        image.src=url
        this.textures.push(texture)
        function isPowerOf2(value){
            return (value&(value-1))==0;
        }
        return texture
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
        const {vertices,colors,textureCoordinates}=shape
        const positionBuffer=this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,positionBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        this.gl.STATIC_DRAW
        )
        const colorBuffer=this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,colorBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(colors),
        this.gl.STATIC_DRAW
        )
        const textureCoordBuffer=this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,textureCoordBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        this.gl.STATIC_DRAW
        )
        shape.buffers={
        position:positionBuffer,
        color:colorBuffer,
        textureCoord:textureCoordBuffer,
        }
    }
    reloadBufferData(shape){
        const {vertices,colors,textureCoordinates,buffers}=shape
        const positionBuffer=buffers.position
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,positionBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        this.gl.STATIC_DRAW
        )
        const colorBuffer=buffers.color
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,colorBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(colors),
        this.gl.STATIC_DRAW
        )
        const textureCoordBuffer=buffers.textureCoord
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,textureCoordBuffer)
        this.gl.bufferData(
        this.gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        this.gl.STATIC_DRAW
        )
    }
    initShaderProgram(vsSource,fsSource){
        const vertexShader=this.loadShader(this.gl.VERTEX_SHADER,vsSource)
        const fragmentShader=this.loadShader(this.gl.FRAGMENT_SHADER,fsSource)
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
    loadShader(type,source){
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
    for(let i=0;i<shape.vertices.length;i+=4){
        const y=shape.vertices[i+1]
        const z=shape.vertices[i+2]
        const cosA=Math.cos(angle)
        const sinA=Math.sin(angle)
        shape.vertices[i+1]=y*cosA-z*sinA
        shape.vertices[i+2]=y*sinA+z*cosA
    }
}

function rotateY(shape,angle){
    for(let i=0;i<shape.vertices.length;i+=4){
        const x=shape.vertices[i]
        const z=shape.vertices[i+2]
        const cosA=Math.cos(angle)
        const sinA=Math.sin(angle)
        shape.vertices[i]=x*cosA+z*sinA
        shape.vertices[i+2]=-x*sinA+z*cosA
    }
}

function rotateZ(shape,angle){
    for(let i=0;i<shape.vertices.length;i+=4){
        const x=shape.vertices[i]
        const y=shape.vertices[i+1]
        const cosA=Math.cos(angle)
        const sinA=Math.sin(angle)
        shape.vertices[i]=x*cosA-y*sinA
        shape.vertices[i+1]=x*sinA+y*cosA
    }
}

function scale(shape,scaleX,scaleY,scaleZ){
    for(let i=0;i<shape.vertices.length;i+=4){
        shape.vertices[i]*=scaleX
        shape.vertices[i+1]*=scaleY
        shape.vertices[i+2]*=scaleZ
    }
}







