
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

    this.gl.clearDepth(1.0)
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.depthFunc(this.gl.LEQUAL)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA)
    
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
        
   // const modelMatrix = mat4.create()
    const viewMatrix = mat4.create()
   // const normalMatrix=mat4.create()
    return {projectionMatrix, viewMatrix}
}
setLightProjectionMatrix(w=10, h=10, near=0.1, far=20){
    const lightProjectionMatrix = mat4.create()
    mat4.ortho(lightProjectionMatrix, -w, w, -h, h, near, far)
    this.matrices.lightProjectionMatrix = lightProjectionMatrix
}
setLightViewMatrix(pos, target, up){
    const lightViewMatrix = mat4.create()
    mat4.lookAt(lightViewMatrix, pos, target, up)
    this.matrices.lightViewMatrix = lightViewMatrix
}
/*
updateNormalMatrix(){
    let normalMatrix3x3 = mat3.create();
    mat3.fromMat4(normalMatrix3x3, this.matrices.modelMatrix);
    let inverseMatrix3x3 = mat3.create();
    mat3.invert(inverseMatrix3x3, normalMatrix3x3);
    let normalMatrix3x3Final = mat3.create();
    mat3.transpose(normalMatrix3x3Final, inverseMatrix3x3);
    let normalMatrix4x4 = mat4.create();
    normalMatrix4x4[0] = normalMatrix3x3Final[0];
    normalMatrix4x4[1] = normalMatrix3x3Final[1];
    normalMatrix4x4[2] = normalMatrix3x3Final[2];
    normalMatrix4x4[4] = normalMatrix3x3Final[3];
    normalMatrix4x4[5] = normalMatrix3x3Final[4];
    normalMatrix4x4[6] = normalMatrix3x3Final[5];
    normalMatrix4x4[8] = normalMatrix3x3Final[6];
    normalMatrix4x4[9] = normalMatrix3x3Final[7];
    normalMatrix4x4[10] = normalMatrix3x3Final[8];
    this.matrices.normalMatrix = normalMatrix4x4;
}*/
updateCameraPosition() {
  let invView = mat4.create()
  mat4.invert(invView, this.matrices.viewMatrix)
  this.cameraPosition = [invView[12], invView[13], invView[14] ]
}

lookAt(eyePositionVec3, centerVec3, upVec3){
    this.cameraPosition = [...eyePositionVec3]
    mat4.lookAt(this.matrices.viewMatrix, eyePositionVec3, centerVec3, upVec3)
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
/*
rotateMatrix(m,angle,vec3){
    let update = false
    mat4.rotate(m,m,angle,vec3)
    if(m == this.matrices.viewMatrix ){
        this.updateCameraPosition()
    }
    if(m == this.matrices.modelMatrix ){
        this.updateNormalMatrix()
    }
}
translateMatrix(m,vec3){
    let update = false
    mat4.translate(m,m,vec3)
    if(m == this.matrices.viewMatrix ){
        this.updateCameraPosition()
    }
}
scaleMatrix(m,vec3){
    let update = false
    mat4.scale(m,m,vec3)
    if(m == this.matrices.viewMatrix ){
        this.updateCameraPosition()
    }
    if(m == this.matrices.modelMatrix ){
        this.updateNormalMatrix()
    }
}*/
    
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
    this.gl.clear(this.gl.COLOR_BUFFER_BIT|    
                  this.gl.DEPTH_BUFFER_BIT)
}

bindFramebuffer(framebuffer){
   const gl = this.gl;
   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
}

unbindFramebuffer(framebuffer){
   const gl = this.gl;
   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}
    
regenerateMipmaps(texture, width, height) {
    if (!texture) {
        throw new Error("Texture is required");
    }

    const gl = this.gl;
    
    // Internal power-of-2 check
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
    
    // Check if texture is power-of-2
    let isPOT = false;
    
    if (width && height) {
        // Validate provided dimensions
        if (width <= 0 || height <= 0) {
            throw new Error("Width and height must be positive");
        }
        isPOT = isPowerOf2(width) && isPowerOf2(height);
    } else {
        // Query texture size and check POT
        gl.bindTexture(gl.TEXTURE_2D, texture);
        width = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WIDTH);
        height = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_HEIGHT);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        if (width <= 0 || height <= 0) {
            throw new Error("Texture has invalid dimensions");
        }
        isPOT = isPowerOf2(width) && isPowerOf2(height);
    }
    
    if (!isPOT) {
        console.warn(`Cannot generate mipmaps for non-POT texture ${width}x${height}`);
        return false;
    }
    
    // Ensure proper min filter for mipmaps
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    // Generate mipmaps
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return true;
}

createDepthTexture(width, height) {
    const gl = this.gl
    gl.getExtension('WEBGL_depth_texture')
    let depthTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return depthTexture
}

createDepthFramebuffer(depthTexture){
    const gl = this.gl
    let framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return framebuffer
}

loadTextures(URLs){
    for(const u of URLs){
        this.loadTexture(u)
    }
}

createTexture(width, height, options = {}) {
    if (width <= 0 || height <= 0) {
        throw new Error("Texture dimensions must be positive");
    }

    const maxSize = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    if (width > maxSize || height > maxSize) {
        throw new Error(`Texture dimensions (${width}x${height}) exceed maximum size (${maxSize})`);
    }

    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
    // Default parameters for render targets
    const defaults = {
        wrapS: this.gl.CLAMP_TO_EDGE,
        wrapT: this.gl.CLAMP_TO_EDGE,
        minFilter: this.gl.LINEAR,
        magFilter: this.gl.LINEAR
    };
    
    const params = { ...defaults, ...options };
    
    // Allocate empty texture storage
    this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        width,
        height,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        null
    );
    
    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, params.minFilter);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, params.magFilter);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, params.wrapS);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, params.wrapT);
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
}

createFramebuffer(texture, width, height) {
    if (!texture) throw new Error("Texture is required");
    if (width <= 0 || height <= 0) throw new Error("Dimensions must be positive");

    const framebuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    
    // Color attachment
    this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER,
        this.gl.COLOR_ATTACHMENT0,
        this.gl.TEXTURE_2D,
        texture,
        0
    );

    // ALWAYS create depth buffer
    const depthBuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthBuffer);
    this.gl.renderbufferStorage(
        this.gl.RENDERBUFFER,
        this.gl.DEPTH_COMPONENT16,
        width,
        height
    );
    this.gl.framebufferRenderbuffer(
        this.gl.FRAMEBUFFER,
        this.gl.DEPTH_ATTACHMENT,
        this.gl.RENDERBUFFER,
        depthBuffer
    );
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

    // Validate
    const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    
    if (status !== this.gl.FRAMEBUFFER_COMPLETE) {
        this.gl.deleteFramebuffer(framebuffer);
        this.gl.deleteRenderbuffer(depthBuffer);
        throw new Error(`Framebuffer incomplete: ${status}`);
    }

    // Return ONLY framebuffer - depthBuffer managed internally
    return framebuffer;
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



setTexture(texture){
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(
        this.gl.TEXTURE_2D,
        texture
    )
}

/*
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
*/

createEmptyCubeMap(width) {
    // Create the cubemap texture
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

    // Define the six faces of the cubemap
    const faces = [
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    // Create blue pixel data (RGBA)
    const pixelData = new Uint8Array(width * width * 4);
    for (let i = 0; i < pixelData.length; i += 4) {
        pixelData[i] = 0;     // R
        pixelData[i + 1] = 0; // G
        pixelData[i + 2] = 255; // B
        pixelData[i + 3] = 255; // A
    }

    // Set up each face with the blue pixel data
    for (let i = 0; i < faces.length; i++) {
        this.gl.texImage2D(
            faces[i],
            0, // level
            this.gl.RGBA, // internal format
            width,
            width,
            0, // border
            this.gl.RGBA, // format
            this.gl.UNSIGNED_BYTE, // type
            pixelData
        );
    }

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    // Note: TEXTURE_WRAP_R is not available in WebGL 1.0, but cubemaps are typically clamped

    // Unbind the texture
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);

    return texture;
}
loadCubeMap(urls, options = {}) {
    if (urls.length !== 6) {
        return Promise.reject(new Error("loadCubeMap requires exactly 6 URLs for cube map faces"));
    }

    const { minFilter = "linear", magFilter = "linear", mipmapFilter, anisotropy } = options;
    const gl = this.gl;

    return new Promise((resolve, reject) => {
        let nImagesLoaded = 0;
        let isPowerOfTwo = true;
        const images = urls.map(() => new Image());
        const errors = [];
        let texture = null;

        const faces = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        ];

        const checkCompletion = () => {
            if (nImagesLoaded + errors.length === 6) {
                if (errors.length > 0) {
                    reject(new Error(`Failed to load cube map: ${errors.join("; ")}`));
                } else {
                    // All images loaded, set texture parameters
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

                    // Set texture parameters
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[minFilter.toUpperCase()]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl[magFilter.toUpperCase()]);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                    // Handle anisotropic filtering
                    if (anisotropy) {
                        const ext = (
                            gl.getExtension('EXT_texture_filter_anisotropic') ||
                            gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                            gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
                        );
                        if (ext) {
                            const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                            const anisotropyValue = Math.min(max, anisotropy);
                            gl.texParameterf(gl.TEXTURE_CUBE_MAP, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropyValue);
                        }
                    }

                    // Generate mipmaps and set filtering for power-of-two images
                    if (isPowerOfTwo) {
                        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                        if (mipmapFilter !== "nearest") {
                            if (minFilter !== "nearest") {
                                gl.texParameteri(
                                    gl.TEXTURE_CUBE_MAP,
                                    gl.TEXTURE_MIN_FILTER,
                                    gl.LINEAR_MIPMAP_LINEAR
                                );
                            } else {
                                gl.texParameteri(
                                    gl.TEXTURE_CUBE_MAP,
                                    gl.TEXTURE_MIN_FILTER,
                                    gl.NEAREST_MIPMAP_LINEAR
                                );
                            }
                        } else {
                            if (minFilter !== "nearest") {
                                gl.texParameteri(
                                    gl.TEXTURE_CUBE_MAP,
                                    gl.TEXTURE_MIN_FILTER,
                                    gl.LINEAR_MIPMAP_NEAREST
                                );
                            } else {
                                gl.texParameteri(
                                    gl.TEXTURE_CUBE_MAP,
                                    gl.TEXTURE_MIN_FILTER,
                                    gl.NEAREST_MIPMAP_NEAREST
                                );
                            }
                        }
                    } else {
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl[minFilter.toUpperCase()]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl[magFilter.toUpperCase()]);
                    }

                    // Store texture in textures array
                    this.textures.push(texture);
                    resolve(texture);
                }
            }
        };

        images.forEach((img, i) => {
            img.crossOrigin = "";
            img.onload = () => {
                // Create texture on first image load
                if (!texture) {
                    texture = gl.createTexture();
                }

                // Bind and set texture data
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(
                    faces[i],
                    0, // level
                    gl.RGBA, // internalFormat
                    gl.RGBA, // format
                    gl.UNSIGNED_BYTE, // type
                    img
                );

                // Check if image is power-of-two and square
                if (!isPowerOf2(img.width) || !isPowerOf2(img.height) || img.width !== img.height) {
                    isPowerOfTwo = false;
                }

                nImagesLoaded += 1;
                checkCompletion();
            };

            img.onerror = () => {
                errors.push(`Failed to load cube map face from URL: ${urls[i]}`);
                checkCompletion();
            };

            img.src = urls[i];
        });
    });

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
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
loadSTL(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                return response.blob();
            })
            .then(blob => blob.arrayBuffer())
            .then(array => {
                const shape = {
                    vertices: [],
                    colors: [],
                    textureCoordinates: [],
                    normals: [],
                    mode: this.gl.TRIANGLES,
                };
                const bytes = new Uint8Array(array);
                const dataView = new DataView(array);

                // Check for ASCII vs. binary
                const firstFive = new TextDecoder().decode(bytes.slice(0, 5)).trim().toLowerCase();
                if (firstFive === "solid" ) {
                    // ASCII STL
                    const text = new TextDecoder().decode(array);
                    const lines = text.split("\n").map(line => line.trim());
                    let currentNormal = [];
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].startsWith("facet normal")) {
                            currentNormal = lines[i].split(" ").slice(2).map(parseFloat);
                            if (currentNormal.length !== 3 || currentNormal.some(isNaN)) {
                                throw new Error(`Invalid normal at line ${i + 1}: ${lines[i]}`);
                            }
                            currentNormal.push(0); // Extend to 4D with w=0
                        } else if (lines[i].startsWith("vertex")) {
                            const coords = lines[i].split(" ").slice(1).map(parseFloat);
                            if (coords.length !== 3 || coords.some(isNaN)) {
                                throw new Error(`Invalid vertex at line ${i + 1}: ${lines[i]}`);
                            }
                            shape.vertices.push(...coords, 1);
                            shape.normals.push(...currentNormal);
                        }
                    }
                    shape.colors = new Array(shape.vertices.length).fill(1.0);
                } else {
                    // Binary STL
                    const nTriangles = dataView.getUint32(80, true); // Little-endian
                    shape.nTriangles = nTriangles;

                    // Validate file size
                    const expectedSize = nTriangles * 50 + 84;
                    if (expectedSize !== bytes.length) {
                        console.warn(`Expected ${expectedSize} bytes, got ${bytes.length}`);
                    }

                    // Parse triangles (50 bytes each)
                    for (let i = 0; i < nTriangles; i++) {
                        const offset = 84 + i * 50;
                        const normal = [
                            dataView.getFloat32(offset, true),
                            dataView.getFloat32(offset + 4, true),
                            dataView.getFloat32(offset + 8, true),
                            0 // Extend to 4D with w=0
                        ];
                        const vertex1 = [
                            dataView.getFloat32(offset + 12, true),
                            dataView.getFloat32(offset + 16, true),
                            dataView.getFloat32(offset + 20, true),
                        ];
                        const vertex2 = [
                            dataView.getFloat32(offset + 24, true),
                            dataView.getFloat32(offset + 28, true),
                            dataView.getFloat32(offset + 32, true),
                        ];
                        const vertex3 = [
                            dataView.getFloat32(offset + 36, true),
                            dataView.getFloat32(offset + 40, true),
                            dataView.getFloat32(offset + 44, true),
                        ];
                        shape.vertices.push(...vertex1, 1, ...vertex2, 1, ...vertex3, 1);
                        shape.normals.push(...normal, ...normal, ...normal); // 3D normals
                    }
                    shape.colors = new Array(shape.vertices.length).fill(1.0);
                }

                // Validate output
                if (shape.vertices.length === 0) {
                    throw new Error("No vertices parsed");
                }
                if (shape.vertices.length / 4 !== shape.normals.length / 4) {
                    throw new Error("Vertex and normal count mismatch");
                }

                this.initBuffers(shape);
                resolve(shape);
            })
            .catch(e => {
                console.error("STL Load Error:", e);
                reject(e);
            });
    });
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
    return this.pushObj(text)
}
pushObj(text) {
    const vertices = [];
    const textureCoordinates = [];
    const normals = [];

    const v = [];   // vertex positions
    const vt = [];  // texture coordinates
    const vn = [];  // vertex normals

    const lines = text.split("\n");

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 0) continue;

        switch (parts[0]) {
            case "v":
                v.push(parts.slice(1).map(Number));
                break;
            case "vt":
                vt.push(parts.slice(1).map(Number));
                break;
            case "vn":
                vn.push(parts.slice(1).map(Number));
                break;
            case "f":
                const faceVerts = parts.slice(1);

                // Triangulate if face has more than 3 vertices (quads, n-gons)
                for (let i = 1; i < faceVerts.length - 1; i++) {
                    const triangle = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];

                    for (const vert of triangle) {
                        const [viStr, vtiStr, vniStr] = vert.split("/");

                        const vi = parseInt(viStr, 10) - 1;
                        const position = v[vi] || [0, 0, 0];
                        vertices.push(...position.slice(0, 3), 1.0); // ensure 4D vertex

                        if (vtiStr !== undefined && vtiStr !== "") {
                            const vti = parseInt(vtiStr, 10) - 1;
                            const tex = vt[vti] || [0, 0];
                            textureCoordinates.push(...tex.slice(0, 2));
                        } else {
                            textureCoordinates.push(0, 0); // fallback
                        }

                        if (vniStr !== undefined && vniStr !== "") {
                            const vni = parseInt(vniStr, 10) - 1;
                            const normal = vn[vni] || [0, 0, 1];
                            normals.push(...normal.slice(0, 3), 0.0); // 4D normal
                        } else {
                            normals.push(0, 0, 1, 0.0); // fallback normal
                        }
                    }
                }
                break;
        }
    }

    // Fallback per-vertex color (based on position, just for visualization)
    const colors = [];
    for (let i = 0; i < vertices.length; i += 4) {
        colors.push(
            (vertices[i] + 1) * 0.5,
            (vertices[i + 1] + 1) * 0.5,
            (vertices[i + 2] + 1) * 0.5,
            1.0
        );
    }

    const mode = this.gl.TRIANGLES;

    const shape = {
        vertices,
        textureCoordinates,
        normals,
        colors,
        mode
    };

    this.initBuffers(shape);
    this.models.push(shape);
    return shape;
}

initShapeMatrices(shape){
    shape.matrices = {}
    shape.matrices.modelMatrix = mat4.create()
    shape.matrices.normalMatrix = mat4.create()
}

initBuffers(shape){
    this.initShapeMatrices(shape)
    shape.shininess = 112.0;
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



makeProgram(vsSource, fsSource){
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
            shaderProgram, 'uAmbientLight'
        ),
        directionalLightColor:gl.getUniformLocation(
            shaderProgram, 'uDirectionalLightColor'
        ),
        directionalVector:gl.getUniformLocation(
            shaderProgram, 'uDirectionalVector'
        ),
        pointLightPosition:gl.getUniformLocation(
            shaderProgram, 'uPointLightPosition'
        ),
        pointLightColor:gl.getUniformLocation(
            shaderProgram, 'uPointLightColor'
        ),
        pointSize: gl.getUniformLocation(
            shaderProgram, 'uPointSize'
        ),
        cubeMap: gl.getUniformLocation(
            shaderProgram, 'uCubeMap'
        ),
        shadowMap: gl.getUniformLocation(
            shaderProgram, 'uShadowMap'
        ),
        lightViewMatrix: gl.getUniformLocation(
            shaderProgram, 'uLightViewMatrix'
        ),
        lightProjectionMatrix: gl.getUniformLocation(
            shaderProgram, 'uLightProjectionMatrix'
        ),
        shininess: gl.getUniformLocation(
            shaderProgram, 'uShininess'
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
    const {projectionMatrix,viewMatrix}=matrices
    const {modelMatrix, normalMatrix} = shape.matrices
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
    if(programInfo.attribLocations.vertexColor && programInfo.attribLocations.vertexColor!=-1)
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
    if( programInfo.attribLocations.textureCoord &&   programInfo.attribLocations.textureCoord!=-1)
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
    if( programInfo.attribLocations.vertexNormal &&   programInfo.attribLocations.vertexNormal!=-1)
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
    if(  programInfo.uniformLocations.projectionMatrix  &&   programInfo.uniformLocations.projectionMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,       
        false,
        projectionMatrix
      )
    }
    if(  programInfo.uniformLocations.modelMatrix &&   programInfo.uniformLocations.modelMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix, 
        false,
        modelMatrix
      )
    }
    if(  programInfo.uniformLocations.viewMatrix &&  programInfo.uniformLocations.viewMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix, 
        false,
        viewMatrix
      )
    }
    if( programInfo.uniformLocations.normalMatrix  &&  programInfo.uniformLocations.normalMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
      )
    }
    if(  programInfo.uniformLocations.cameraPosition &&  programInfo.uniformLocations.cameraPosition!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.cameraPosition,
        new Float32Array(epicCanvas.cameraPosition)
      )
    }
    if(   programInfo.uniformLocations.ambientLight &&  programInfo.uniformLocations.ambientLight!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.ambientLight,
        new Float32Array(epicCanvas.ambientColor)
      )
    }
    if(  programInfo.uniformLocations.directionalLightColor   &&   programInfo.uniformLocations.directionalLightColor!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.directionalLightColor, 
        new Float32Array(epicCanvas.directionalColor)
      )
    }
    if( programInfo.uniformLocations.directionalVector  &&    programInfo.uniformLocations.directionalVector!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.directionalVector,
        new Float32Array(epicCanvas.directionalVector)
      )
    }
    if( programInfo.uniformLocations.pointLightPosition &&   programInfo.uniformLocations.pointLightPosition!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.pointLightPosition, 
        new Float32Array(epicCanvas.pointLightPosition)
      )
    }
    if( programInfo.uniformLocations.pointLightColor  &&    programInfo.uniformLocations.pointLightColor!=-1)
    {
      gl.uniform3fv(
        programInfo.uniformLocations.pointLightColor,
        new Float32Array(epicCanvas.pointLightColor)
      )
    }
    if( programInfo.uniformLocations.pointSize   &&  programInfo.uniformLocations.pointSize!=-1)
    {
      gl.uniform1f(
        programInfo.uniformLocations.pointSize,
        epicCanvas.pointSize
      )
    }
    if(  programInfo.uniformLocations.shininess  &&  programInfo.uniformLocations.shininess!=-1)
    {
      gl.uniform1f(
        programInfo.uniformLocations.shininess,
        shape.shininess
      )
    }
    if(programInfo.uniformLocations.lightViewMatrix && programInfo.uniformLocations.lightViewMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.lightViewMatrix,
        false,
        epicCanvas.matrices.lightViewMatrix
      )
    }
    
    if(programInfo.uniformLocations.lightProjectionMatrix && programInfo.uniformLocations.lightProjectionMatrix!=-1)
    {
      gl.uniformMatrix4fv(
        programInfo.uniformLocations.lightProjectionMatrix,
        false,
        epicCanvas.matrices.lightProjectionMatrix
      )
    }
    
    {
        const offset=0
        const vertexCount=shape.vertices.length/4
        gl.drawArrays(mode,offset,vertexCount)
    }
}

getCameraForward() {
    const viewMatrix = this.matrices.viewMatrix
    
    // Fast extraction: negate row 2 (Z-axis) of view matrix
    const forward = vec3.fromValues(
        viewMatrix[8],  // m20
        viewMatrix[9],  // m21  
        -viewMatrix[10]  // m22
    );
    
    // Normalize in-place
    vec3.normalize(forward, forward);
    return Array.from(forward)
}

rotateShapeOnItself(shape, angle, axis) {
    const currentModel = shape.matrices.modelMatrix;
    
    // Extract current translation (world position)
    const translation = [currentModel[12], currentModel[13], currentModel[14]];
    
    // Step 1: Translate to origin (undo world position)
    const invTranslationMatrix = mat4.create();
    mat4.fromTranslation(invTranslationMatrix, [-translation[0], -translation[1], -translation[2]]);
    
    // Step 2: Create rotation matrix around local origin
    const rotationMatrix = mat4.create();
    mat4.fromRotation(rotationMatrix, angle, axis);
    
    // Step 3: Translate back to world position
    const translationMatrix = mat4.create();
    mat4.fromTranslation(translationMatrix, translation);
    
    // Step 4: Apply transformation: translateBack * rotate * translateToOrigin * existingModel
    const temp1 = mat4.create();
    mat4.multiply(temp1, invTranslationMatrix, shape.matrices.modelMatrix);
    
    const temp2 = mat4.create();
    mat4.multiply(temp2, rotationMatrix, temp1);
    
    mat4.multiply(shape.matrices.modelMatrix, translationMatrix, temp2);
    
    // Update normal matrix
    mat4.invert(shape.matrices.normalMatrix, shape.matrices.modelMatrix);
    mat4.transpose(shape.matrices.normalMatrix, shape.matrices.normalMatrix);
}
       

moveShapeTo(shape, worldPosition) {
    const currentModel = shape.matrices.modelMatrix;
    const currentPosition = [currentModel[12], currentModel[13], currentModel[14]];
    
    // Calculate translation delta (same as your translate approach)
    const deltaTranslation = vec3.create();
    vec3.sub(deltaTranslation, worldPosition, currentPosition);
    
    // Create translation matrix with delta
    const translationMatrix = mat4.create();
    mat4.fromTranslation(translationMatrix, deltaTranslation);
    
    // Apply translation using your pattern: newTranslation * existingModel
    mat4.multiply(shape.matrices.modelMatrix, translationMatrix, shape.matrices.modelMatrix);
    
    // Update normal matrix (same as your translate function)
    mat4.invert(shape.matrices.normalMatrix, shape.matrices.modelMatrix);
    mat4.transpose(shape.matrices.normalMatrix, shape.matrices.normalMatrix);
}




makeShapeLookAt(shape, targetPosition, upVector = [0, 1, 0]) {
    const currentModel = shape.matrices.modelMatrix;
    const currentPosition = [currentModel[12], currentModel[13], currentModel[14]];
    
    // Extract non-uniform scales from current model
    const sx = vec3.length([currentModel[0], currentModel[4], currentModel[8]]);
    const sy = vec3.length([currentModel[1], currentModel[5], currentModel[9]]);
    const sz = vec3.length([currentModel[2], currentModel[6], currentModel[10]]);
    
    // Create scale matrix
    const scaleMatrix = mat4.create();
    mat4.fromScaling(scaleMatrix, [sx, sy, sz]);
    
    // Calculate direction vector
    const direction = vec3.create();
    vec3.sub(direction, targetPosition, currentPosition);
    vec3.normalize(direction, direction);
    
    // Create look-at view matrix from origin to direction
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, 0], direction, upVector);
    
    // Invert to get object-to-world rotation matrix
    const rotationMatrix = mat4.create();
    mat4.invert(rotationMatrix, viewMatrix);
    rotationMatrix[12] = 0; // Remove translation
    rotationMatrix[13] = 0;
    rotationMatrix[14] = 0;
    
    // Create translation back to current position (to match your translateModelMatrix pattern)
    const translationMatrix = mat4.create();
    mat4.fromTranslation(translationMatrix, currentPosition);
    
    // Rebuild model matrix: translation * rotation * scale
    // This matches your translateModelMatrix post-multiplication pattern
    const tempMatrix = mat4.create();
    mat4.multiply(tempMatrix, rotationMatrix, scaleMatrix); // rotation * scale
    mat4.multiply(shape.matrices.modelMatrix, translationMatrix, tempMatrix); // translation * (rotation * scale)
    
    // Update normal matrix (same as your translate function)
    mat4.invert(shape.matrices.normalMatrix, shape.matrices.modelMatrix);
    mat4.transpose(shape.matrices.normalMatrix, shape.matrices.normalMatrix);
}






getWorldPosition(shape) {
    // For origin transformation, result is just the last column of model matrix
    const modelMatrix = shape.matrices.modelMatrix;
    return [
        modelMatrix[12], // tx
        modelMatrix[13], // ty
        modelMatrix[14], // tz
        modelMatrix[15]  // tw (usually 1)
    ];
}

rotateViewMatrix(angleInRadians, axis) {
    const { viewMatrix } = this.matrices;
    
    // Create a temporary matrix for rotation
    const rotationMatrix = mat4.create();
    
    // Apply rotation to the rotation matrix based on axis and angle
    mat4.rotate(rotationMatrix, mat4.create(), angleInRadians, axis);
    
    // Update modelMatrix by multiplying with rotation
    mat4.multiply(viewMatrix, rotationMatrix, viewMatrix);
    
    this.updateCameraPosition()
}


translateViewMatrix(translation) {
    const { viewMatrix } = this.matrices;
    
    // Create a temporary matrix for translation
    const translationMatrix = mat4.create();
    
    // Apply translation to the translation matrix
    mat4.translate(translationMatrix, mat4.create(), translation);
    
    // Update modelMatrix by multiplying with translation
    mat4.multiply(viewMatrix, translationMatrix, viewMatrix);
    
    this.updateCameraPosition()
}

scaleViewMatrix(scale) {
    const { viewMatrix } = this.matrices;
    
    // Create a temporary matrix for scaling
    const scaleMatrix = mat4.create()
    
    // Apply scaling to the scale matrix
    mat4.scale(scaleMatrix, mat4.create(), scale)
    
    // Update modelMatrix by multiplying with scale
    mat4.multiply(viewMatrix, scaleMatrix, viewMatrix)
    
    this.updateCameraPosition()
}

rotateModelMatrix(shape, angleInRadians, axis) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for rotation
    const rotationMatrix = mat4.create();
    
    // Apply rotation to the rotation matrix based on axis and angle
    mat4.rotate(rotationMatrix, mat4.create(), angleInRadians, axis);
    
    // Update modelMatrix by multiplying with rotation
    mat4.multiply(modelMatrix, rotationMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
}


translateModelMatrix(shape, translation) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for translation
    const translationMatrix = mat4.create();
    
    // Apply translation to the translation matrix
    mat4.translate(translationMatrix, mat4.create(), translation);
    
    // Update modelMatrix by multiplying with translation
    mat4.multiply(modelMatrix, translationMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
}

scaleModelMatrix(shape, scale) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for scaling
    const scaleMatrix = mat4.create();
    
    // Apply scaling to the scale matrix
    mat4.scale(scaleMatrix, mat4.create(), scale);
    
    // Update modelMatrix by multiplying with scale
    mat4.multiply(modelMatrix, scaleMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
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
        const N = [0,0,0,0]
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



/*
//deprecated transform functions, moved to EpicCanvas class
function rotateModelMatrix(shape, angleInRadians, axis) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for rotation
    const rotationMatrix = mat4.create();
    
    // Apply rotation to the rotation matrix based on axis and angle
    mat4.rotate(rotationMatrix, mat4.create(), angleInRadians, axis);
    
    // Update modelMatrix by multiplying with rotation
    mat4.multiply(modelMatrix, rotationMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
}


function translateModelMatrix(shape, translation) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for translation
    const translationMatrix = mat4.create();
    
    // Apply translation to the translation matrix
    mat4.translate(translationMatrix, mat4.create(), translation);
    
    // Update modelMatrix by multiplying with translation
    mat4.multiply(modelMatrix, translationMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
}

function scaleModelMatrix(shape, scale) {
    const { modelMatrix, normalMatrix } = shape.matrices;
    
    // Create a temporary matrix for scaling
    const scaleMatrix = mat4.create();
    
    // Apply scaling to the scale matrix
    mat4.scale(scaleMatrix, mat4.create(), scale);
    
    // Update modelMatrix by multiplying with scale
    mat4.multiply(modelMatrix, scaleMatrix, modelMatrix);
    
    // Update normalMatrix (inverse transpose of modelMatrix)
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    // Update the shape's matrices
    shape.matrices.modelMatrix = modelMatrix;
    shape.matrices.normalMatrix = normalMatrix;
}*/
