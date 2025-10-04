
/*
Author: Paul Caron
Date: July 24th 2020 to now....
Special thanks to mozilla docs for the webgl tutorial
https://developer.mozilla.org/fr/docs/Web/API/WebGL_API
*/

class EpicShape{
    constructor(ec, mode, ...shapes){
        this.vertices = []
        for(let shape of shapes){
            this.vertices.push(...shape.vertices)
        }
        this.textureCoordinates = []
        for(let shape of shapes){
            this.textureCoordinates.push(...shape.textureCoordinates)
        }
        this.colors = []
        for(let shape of shapes){
            this.colors.push(...shape.colors)
        }
        this.normals = []
        for(let shape of shapes){
            this.normals.push(...shape.normals)
        }
        this.mode = mode
        ec.initBuffers(this)
    }
}

class PLYProperties{
    constructor(){
        //properties of elements pushed in order
        this.vertex = {}
        this.face = {}
        this.edge = {}
        this.vertex.order = []
        this.face.order = []
        this.edge.order = []
        this.vertex.types = []
        this.face.types = []
        this.edge.types = []
        this.vertex.values = []
        this.face.values = []
        this.edge.values = []
    }
}

class PLYElements{
    constructor(){
        //number of elements
        this.vertex = 0
        this.face = 0
        this.edge = 0
        this.material = 0
        //parsing order of elements, usually vertex first than faces
        this.order = []
    }
}

class PLY {
    constructor(){
        this.format
        this.comment = []
        this.element = new PLYElements()
        this.property = new PLYProperties()
    }
    parseHeaderLine(line){
        const words = line.split(" ")
        if(words[0] == "format"){
            this.format = (words.slice(1)).join(" ")
        }
        else if(words[0] == "comment"){
            this.comment.push((words.slice(1)).join(" "))
        }
        else if(words[0] == "element"){
            this[words[0]][words[1]] = parseInt(words[2])
            this.currentlyParsedElement = words[1]
            this[words[0]].order.push(words[1])
        }
        else if(words[0] == "property"){
            
            this.property[this.currentlyParsedElement].order.push(words[words.length-1])
            this.property[this.currentlyParsedElement].types.push(...words.slice(1,words.length-1))
        }
    }
    parseDataASCII(dataLines){
        let dataLinesIndex = 0
        for(let element of this.element.order){
            for(let i=0;i<this.element[element];++i){
                const data = dataLines[dataLinesIndex].split(" ")
                this.property[element].values.push({})
                const value = this.property[element].values[i]
                for(let j=0;j<data.length;++j){
                    //if type not list
                    const type = this.property[element].types[j]
                    if(type!="list")
                    value[this.property[element].order[j]] = parseFloat(data[j])
                    //if type is list
                    else{
                        value[this.property[element].order[j]] = data.slice(j).map(v=>parseInt(v))
                        break
                    }
                }
                dataLinesIndex++
            }
        }
    }
    parse(text){
        let lines = text.split("\n")
        
        lines = lines.map(line=>line.trim())
        if(!lines[0].toLowerCase().startsWith("ply")){
            alert("PLY file not valid")
            throw("PLY file not valid")
        }
        
        let i=1;
        for(;!lines[i].startsWith("end_header")&&i<lines.length;++i){
            const line = lines[i]
            this.parseHeaderLine(line)
        }
        this.parseDataASCII(lines.slice(i+1))
        const shape = {
            vertices : [],
            colors : [],
            textureCoordinates : [],
            normals : [],
        }
        
        
        for(let face of this.property.face.values){
            const [n,...vertex_indices] = face.vertex_indices
            //triangle point abc
            const A = vertex_indices[0]
            let B = vertex_indices[1]
            for(let i=2;i<=n-1;++i){
                const vertexA = this.property.vertex.values[A]
                const vertexB = this.property.vertex.values[B]
                const vertexC = this.property.vertex.values[vertex_indices[i]]
                shape.vertices.push(vertexA.x,vertexA.y,vertexA.z,1)
                shape.vertices.push(vertexB.x,vertexB.y,vertexB.z,1)
                shape.vertices.push(vertexC.x,vertexC.y,vertexC.z,1)
                
                
                if(vertexA.red != undefined){
                    shape.colors.push(
                        vertexA.red/255,
                        vertexA.green/255,
                        vertexA.blue/255)
                    shape.colors.push(vertexA.alpha?
                                      vertexA.alpha/255:
                                      1.0)
                    shape.colors.push(
                        vertexB.red/255,
                        vertexB.green/255,
                        vertexB.blue/255)
                    shape.colors.push(vertexB.alpha?
                                      vertexB.alpha/255:
                                      1.0)
                    shape.colors.push(
                        vertexC.red/255,
                        vertexC.green/255,
                        vertexC.blue/255)
                    shape.colors.push(vertexC.alpha?
                                      vertexC.alpha/255:
                                      1.0)
                }
                else{
                    shape.colors.push(1,1,1,1,
                                      1,1,1,1,
                                      1,1,1,1)
                }
                
                B = vertex_indices[i]
                
            }
        }
        return shape
    }
}


class EpicCanvas{
constructor(width,height,container){
    this.models=[]
    this.textures=[]
    this.canvas
    this.gl
    this.matrices
    this.cameraPosition = [0,0,0]
    this.createCanvas(width,height,container)
    this.clearColor=[0.0,0.0,0.0,1.0]
    this.ambientColor=[0,0,0]
    this.directionalColor=[0,0,0]
    this.directionalVector=[0,0,1]
    this.pointLightPosition=[0,0,0]
    this.pointLightColor=[0,0,0]
    this.pointSize = 1
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
lookAt(eyePositionVec3, centerVec3, upVec3){
    this.cameraPosition = [...eyePositionVec3]
    mat4.lookAt(this.matrices.viewMatrix, eyePositionVec3, centerVec3, upVec3)
    this.updateModelViewMatrix()
}
lookFront(eyePositionVec3, yawAngle){
    this.cameraPosition = [...eyePositionVec3]
    const directionVec3 = vec3.create()
    directionVec3[0] = Math.cos(yawAngle)
    directionVec3[1] = 0
    directionVec3[2] = Math.sin(yawAngle)
    vec3.add(directionVec3,directionVec3,eyePositionVec3)
    this.lookAt(eyePositionVec3,directionVec3,[0,1,0])
}
lookPitchYaw(eyePositionVec3, pitch, yaw){
    this.cameraPosition = [...eyePositionVec3]
    const center = [...eyePositionVec3]
    const xzRadius = Math.cos(pitch)
    center[1] += Math.sin(pitch)
    center[0] += Math.cos(yaw)*xzRadius
    center[2] += Math.sin(yaw)*xzRadius
    
    const up = [0,0,0]
    const upPitch = pitch + Math.PI/2
    const xzUpRadius = Math.cos(upPitch)
    
    up[1] = Math.sin(upPitch)
    up[0] = Math.cos(yaw)*xzUpRadius
    up[2] = Math.sin(yaw)*xzUpRadius
    this.lookAt(eyePositionVec3,center,up)
    
    return [center, up]
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



loadTexture(url, options = {}) {
    const {minFilter = "linear", magFilter = "linear", mipmapFilter, anisotropy} = options;
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    const level = 0;
    const internalFormat = this.gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = this.gl.RGBA;
    const srcType = this.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
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
    );
    // Set default texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl[minFilter.toUpperCase()]);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl[magFilter.toUpperCase()]);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    if (url && typeof url === "string") {
        const image = new Image();
        image.crossOrigin = "";
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            );
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                if (mipmapFilter != "nearest") {
                    if (minFilter != "nearest") {
                        this.gl.texParameteri(
                            this.gl.TEXTURE_2D,
                            this.gl.TEXTURE_MIN_FILTER,
                            this.gl.LINEAR_MIPMAP_LINEAR
                        );
                    } else {
                        this.gl.texParameteri(
                            this.gl.TEXTURE_2D,
                            this.gl.TEXTURE_MIN_FILTER,
                            this.gl.NEAREST_MIPMAP_LINEAR
                        );
                    }
                } else {
                    if (minFilter != "nearest") {
                        this.gl.texParameteri(
                            this.gl.TEXTURE_2D,
                            this.gl.TEXTURE_MIN_FILTER,
                            this.gl.LINEAR_MIPMAP_NEAREST
                        );
                    } else {
                        this.gl.texParameteri(
                            this.gl.TEXTURE_2D,
                            this.gl.TEXTURE_MIN_FILTER,
                            this.gl.NEAREST_MIPMAP_NEAREST
                        );
                    }
                }
                if (magFilter != "nearest") {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MAG_FILTER,
                        this.gl.LINEAR
                    );
                } else {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MAG_FILTER,
                        this.gl.NEAREST
                    );
                }
                if (anisotropy) {
                    const ext = (this.gl.getExtension('EXT_texture_filter_anisotropic') || 
                                 this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || 
                                 this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));
                    if (ext) {
                        const max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                        const anisotropyValue = max * anisotropy;
                        this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropyValue);
                    }
                }
            } else {
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_WRAP_S,
                    this.gl.CLAMP_TO_EDGE
                );
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_WRAP_T,
                    this.gl.CLAMP_TO_EDGE
                );
                if (minFilter != "nearest") {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.LINEAR
                    );
                } else {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MIN_FILTER,
                        this.gl.NEAREST
                    );
                }
                if (magFilter != "nearest") {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MAG_FILTER,
                        this.gl.LINEAR
                    );
                } else {
                    this.gl.texParameteri(
                        this.gl.TEXTURE_2D,
                        this.gl.TEXTURE_MAG_FILTER,
                        this.gl.NEAREST
                    );
                }
            }
        };
        image.onerror = () => {
            console.error(`Failed to load image from URL: ${url}`);
        };
        image.src = url;
    }
    this.textures.push(texture);
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    return texture;
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

renderToTexture(texture, textureWidth, textureHeight, drawFunction, ...drawFunctionParameters) {
    if (textureWidth <= 0 || textureHeight <= 0) {
        throw new Error("Texture dimensions must be positive");
    }
    const maxSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    if (textureWidth > maxSize || textureHeight > maxSize) {
        throw new Error(`Texture dimensions (${textureWidth}x${textureHeight}) exceed maximum size (${maxSize})`);
    }

    // Resize the texture
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0, // level
        this.gl.RGBA, // internalFormat
        textureWidth,
        textureHeight,
        0, // border
        this.gl.RGBA, // srcFormat
        this.gl.UNSIGNED_BYTE, // srcType
        null // No initial data
    );

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    // Create and set up framebuffer
    const fb = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0;
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, texture, 0);

    // Check framebuffer status
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        throw new Error(`Framebuffer is not complete: ${status}`);
    }

    // Set up depth buffer
    const depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, textureWidth, textureHeight);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer);

    // Render to the texture
    this.gl.viewport(0, 0, textureWidth, textureHeight);
    drawFunction(...drawFunctionParameters);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Clean up
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.deleteFramebuffer(fb);
    this.gl.deleteRenderbuffer(depthBuffer);

    // Generate mipmaps if power-of-2
    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
    if (isPowerOf2(textureWidth) && isPowerOf2(textureHeight)) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
}

/*

renderToTexture(texture, textureWidth, textureHeight, drawFunction, ...drawFunctionParameters){
    //framebuffer
    const fb = this.gl.createFramebuffer()
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0; 
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, texture, 0) 
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    
    //depth buffer
    const depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, textureWidth, textureHeight);
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer);
    
    //render
    this.gl.viewport(0,0,textureWidth,textureHeight)
    drawFunction(...drawFunctionParameters)
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height)
    
    //clean
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    this.gl.deleteFramebuffer(fb)
    this.gl.deleteRenderbuffer(depthBuffer)
    
    function isPowerOf2(value){
        return (value&(value-1)) == 0
    }
    //regenerate mips
    if(isPowerOf2(textureWidth)&& isPowerOf2(textureHeight)){
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
        this.gl.generateMipmap(this.gl.TEXTURE_2D)
    }
}*/


setTexture(texture){
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        texture
    )
}

copyTexture(from, to, from_type, to_type, width, height){
    const fb = this.gl.createFramebuffer()
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, from_type, from, 0)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    
    const target = to_type
    const level = 0
    const internalFormat = this.gl.RGBA
    const x = 0
    const y = 0
    const border = 0
    
    this.gl.bindTexture(to_type, to)
    this.gl.copyTexImage2D(target, level, internalFormat, x, y, width, height, border)
    
    function isPowerOf2(value){
        return (value&(value-1)) == 0
    }
    
    if(isPowerOf2(width)&&isPowerOf2(height)){
        this.gl.generateMipmap(to_type)
    }
    
    this.gl.bindTexture(to_type, null)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    this.gl.deleteFramebuffer(fb)
}

loadCubeMap (urls) {
    if(urls.length != 6) return
    const gl = this.gl
    const texture = gl.createTexture() 
    gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture)
    let nImagesLoaded = 0
    const images = urls.map(url => new Image())
    const faces = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,    
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, ]
    faces.forEach((face)=>{
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        // setup each face with null, so it s renderable
        gl.texImage2D(face, level, internalFormat, width, height, 0, format, type, null);
    })
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    for(let i=0;i<6;++i){
        images[i].crossOrigin = ""
        images[i].onload = () => {
            const img = images[i]
            const level = 0
            const internalFormat = gl.RGBA
            const format = gl.RGBA
            const type = gl.UNSIGNED_BYTE
            const face = faces[i]
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
            gl.texImage2D (face, level, internalFormat, format, type, img);
            nImagesLoaded += 1
            if(nImagesLoaded == 6){
                gl.bindTexture(gl.TEXTURE_CUBE_MAP,texture)
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            }
        }
        images[i].src = urls[i]
    }
    return texture
}

updateCubeMapFace (cubemap, face, url){
    const gl = this.gl
    const img = new Image()
    img.crossOrigin = ""
    img.onload = () => {
        const format = gl.RGBA
        const type = gl.UNSIGNED_BYTE
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemap)
        gl.texSubImage2D (face, 0,0,0,format, type, img)
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
    }
    img.src = url
}

renderToCubeMapFace(cubemap, face, faceWidth, faceHeight, drawFunction, ...drawFunctionParameters){
    //framebuffer
    const fb = this.gl.createFramebuffer()
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    const attachmentPoint = this.gl.COLOR_ATTACHMENT0
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, face, cubemap, 0)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb)
    
    //depth buffer
    const depthBuffer = this.gl.createRenderbuffer()
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, faceWidth, faceHeight)
    this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthBuffer)
    
    //render
    this.gl.viewport(0,0,faceWidth,faceHeight)
    drawFunction(...drawFunctionParameters)
    this.gl.viewport(0,0, this.canvas.width, this.canvas.height)
    
    //clean
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    this.gl.deleteRenderbuffer(depthBuffer)
    this.gl.deleteFramebuffer(fb)
    
    //regenerate mips
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, cubemap)
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP)
    
}

setCubeMap(cubemap){
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, cubemap)
}

loadSTL(url){
    return new Promise((resolve, reject)=>{
    fetch(url)
    .then(response => response.blob())
    .then(blob => blob.arrayBuffer())
    .then(array => {
        const shape = {
            vertices : [],
            colors : [],
            textureCoordinates : [],
            normals : [],
            mode : this.gl.TRIANGLES,
        }
        const text = new TextDecoder().decode(array)
        const magic = text.slice(0,6)
        //ascii stl
        if(magic.trim() == "solid"){
            const splitted = text.split(" ")
            const nums = splitted.filter(a=>!isNaN(parseFloat(a)))
            const values = nums.map(parseFloat)
            for(let i=0;i<values.length;i+=12){
                let normal = values.slice(i,i+3)
                let a = values.slice(i+3,i+6)
                let b = values.slice(i+6,i+9)
                let c = values.slice(i+9,i+12)
                shape.normals.push(...normal,1,...normal,1,...normal,1)
                shape.vertices.push(...a,1,...b,1,...c,1)
            }
            shape.colors = shape.normals.map(v=>1.0)
        }
        //binary stl
        else{
            const u8ToU32bits = (arr4)=>{
                const a = arr4[0]
                const b = arr4[1]
                const c = arr4[2]
                const d = arr4[3]
                return a+(b<<8)+(c<<16)+(d<<24)
            }
            const bytes = new Uint8Array(array)
            
            const header = text.slice(0,80)
            shape.header = header
            
            const nTriangles = u8ToU32bits(bytes.slice(80,84))
            shape.nTriangles = nTriangles
            
            const data = bytes.slice(84)
            //4 bytes per value, 12 values per facet, 2 bytes attributes
            const values = []
            for(let i=0;i<nTriangles*50;i+=50){
                const facetBytes = data.slice(i,i+48)
                const dv = new DataView(facetBytes.buffer,
                    facetBytes.byteOffset,
                    facetBytes.byteLength
                )
                const facetFloats = [
                    dv.getFloat32(0,true),
                    dv.getFloat32(4,true),
                    dv.getFloat32(8,true),
                    
                    dv.getFloat32(12,true),
                    dv.getFloat32(16,true),
                    dv.getFloat32(20,true),
                    
                    dv.getFloat32(24,true),
                    dv.getFloat32(28,true),
                    dv.getFloat32(32,true),
                    
                    dv.getFloat32(36, true),
                    dv.getFloat32(40,true),
                    dv.getFloat32(44,true),
                    
                ]
                
                values.push(...facetFloats)
            }
            
            for(let i=0;i<values.length;i+=12){
                let normal = values.slice(i,i+3)
                let a = values.slice(i+3,i+6)
                let b = values.slice(i+6,i+9)
                let c = values.slice(i+9,i+12)
                shape.normals.push(...normal,1,...normal,1,...normal,1)
                shape.vertices.push(...a,1,...b,1,...c,1)
            }
            shape.colors = shape.normals.map(v=>1.0)
        }
        //calculate normals for all zero blank normals
        for(let i=0;i<shape.normals.length;i+=12){
            const [x,y,z] = shape.normals.slice(i,i+3)
            if(x==0&&y==0&&z==0){
                const pointA = [...shape.vertices.slice(i,i+4)]
                const pointB = [...shape.vertices.slice(i+4,i+8)]
                const pointC = [...shape.vertices.slice(i+8,i+12)]
                const AB = [pointB[0]-pointA[0], pointB[1]-pointA[1],pointB[2]-pointA[2]]
                const AC = [pointC[0]-pointA[0], pointC[1]-pointA[1],pointC[2]-pointA[2]]
                //cross product
                const N = [0,0,0,1]
                N[0] = ((AB[1]*AC[2]) - (AB[2]*AC[1]))
                N[1] = ((AB[2]*AC[0]) - (AB[0]*AC[2]))
                N[2] = ((AB[0]*AC[1]) - (AB[1]*AC[0]))
                //normalize
                const d = Math.sqrt(N[0]**2+N[1]**2+N[2]**2)
                N[0] /= d
                N[1] /= d
                N[2] /= d
                for(let j=0;j<3;++j){
                    shape.normals[i+j*4] = N[0]
                    shape.normals[i+1+j*4] = N[1]
                    shape.normals[i+2+j*4] = N[2]
                }
            }
        }
        this.initBuffers(shape)
        ///
        resolve(shape)
    })
    .catch(e=>{
        console.log(e)
        reject(e)
    })
    })
}

loadPLY(url){
    return new Promise((resolve, reject) => {
        fetch(url)
        .then(response => response.text())
        .then(text => {
            const ply = new PLY()
            return ply.parse(text)
        })
        .then(shape=>{
            shape.mode = this.gl.TRIANGLES
            this.initBuffers(shape)
            resolve(shape)
        })
    })
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
        modelMatrix:gl.getUniformLocation(
            shaderProgram,'uModelMatrix'
        ),
        viewMatrix:gl.getUniformLocation(
            shaderProgram,'uViewMatrix'
        ),
        normalMatrix:gl.getUniformLocation(
            shaderProgram,'uNormalMatrix'
        ),
        cameraPosition:gl.getUniformLocation(
            shaderProgram,'uCameraPosition'
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
        pointSize: gl.getUniformLocation(
            shaderProgram, 'uPointSize'
        ),
    },
}
}



window(startWidthRatio, startHeightRatio, widthRatio, heightRatio){
    const x = this.canvas.width * startWidthRatio 
    const y = this.canvas.height - (this.canvas.height * startHeightRatio  + heightRatio * this.canvas.height)
    const dx = this.canvas.width * widthRatio
    const dy = this.canvas.height * heightRatio
    this.gl.enable(this.gl.SCISSOR_TEST)
    const viewportFunc = () => {
        this.gl.viewport(x, y, dx, dy)
        this.gl.scissor(x, y, dx, dy)
    }
    return viewportFunc
}




drawShape(programInfo,shape){
    const epicCanvas = this
    const {gl,matrices}=epicCanvas
    const {projectionMatrix,modelViewMatrix,modelMatrix,viewMatrix,normalMatrix}=matrices
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
        programInfo.uniformLocations.modelMatrix, 
        false,
        modelMatrix
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix, 
        false,
        viewMatrix
    )
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
    )
    gl.uniform3fv(
        programInfo.uniformLocations.cameraPosition,
        new Float32Array(epicCanvas.cameraPosition)
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
    gl.uniform1f(
        programInfo.uniformLocations.pointSize,
        epicCanvas.pointSize
    )
    
    {
        const offset=0
        const vertexCount=shape.vertices.length/4
        gl.drawArrays(mode,offset,vertexCount)
    }
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
    for(let i=0;i<shape.normals.length;i+=4){
        shape.normals[i]/=scaleX
        shape.normals[i+1]/=scaleY
        shape.normals[i+2]/=scaleZ
        const h = Math.sqrt(
            shape.normals[i]**2 +
            shape.normals[i+1]**2 +
            shape.normals[i+2]**2
        )
        shape.normals[i]/=h
        shape.normals[i+1]/=h
        shape.normals[i+2]/=h
    }
}

function setNormals(shape){
    // to find and set normals based on triangle vertices
    // works only for gl.TRIANGLES mode
    shape.normals = []    
    for(let i= 0;i<shape.vertices.length;i+=4*3){
        const pointA = [...shape.vertices.slice(i,i+4)]
        const pointB = [...shape.vertices.slice(i+4,i+8)]
        const pointC = [...shape.vertices.slice(i+8,i+12)]
        const AB = [pointB[0]-pointA[0], pointB[1]-pointA[1],pointB[2]-pointA[2]]
        const AC = [pointC[0]-pointA[0], pointC[1]-pointA[1],pointC[2]-pointA[2]]
        //cross product
        const N = [0,0,0,1]
        N[0] = ((AB[1]*AC[2]) - (AB[2]*AC[1]))
        N[1] = ((AB[2]*AC[0]) - (AB[0]*AC[2]))
        N[2] = ((AB[0]*AC[1]) - (AB[1]*AC[0]))
        //normalize
        const d = Math.sqrt(N[0]**2+N[1]**2+N[2]**2)
        N[0] /= d
        N[1] /= d
        N[2] /= d
        for(let j=0;j<3;++j)
            shape.normals.push(...N)
    }
}

function center(shape){
    let [xMax,yMax,zMax] = shape.vertices.slice(0,3)
    let [xMin,yMin,zMin] = shape.vertices.slice(0,3)
    for(let i=0;i<shape.vertices.length;i+=4){
        const [x,y,z] = shape.vertices.slice(i,i+3)
        if(x<xMin) xMin = x
        if(y<yMin) yMin = y
        if(z<zMin) zMin = z
        if(x>xMax) xMax = x
        if(y>yMax) yMax = y
        if(z>zMax) zMax = z
    }
    const xCenter = (xMax + xMin)/2
    translateX(shape, -xCenter)
    const yCenter = (yMax + yMin)/2
    translateY(shape, -yCenter)
    const zCenter = (zMax + zMin)/2
    translateZ(shape, -zCenter)
}

function scaleToUnitSize(shape){
    let max = 0
    for(let i=0;i<shape.vertices.length;i+=4){
        const slice = shape.vertices.slice(i,i+3)
        let h =0
        for(let v of slice) h+=v**2
        h=Math.sqrt(h)
        if(h>max) max = h
    }
    scale(shape, 1/max, 1/max, 1/max)
}


