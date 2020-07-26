# EpicCanvas
3D WebGL drawArrays Library

Why not focus on drawElements? drawArrays in my humble opinion is easier to use when creating custom shapes on the fly. Unless you use a 3D model software like blender, keeping track of all indices is tedious.

# Create a canvas
Easy.
```js
const width=640
const height=480
const mySuperEpicCanvas=new EpicCanvas(width,height,"body")
```
EpicCanvas constructor takes 3 arguments:
* width: canvas width
* height: canvas height
* container selector: the canvas element created will be appended as a child to this container.

This will create an EpicCanvas object which contains the following important properties:
* canvas: a canvas
* gl: a webGL context
* and more! simply *** EPIC ***

# Loading Textures
Textures can be loaded into the EpicCanvas with either one of these methods:
* loadTexture(url): loads one texture
* loadTextures([url1,url2,...,urln]): loads many textures

Textures are pushed sequentially into the EpicCanvas.textures array.
Textures can be used even when not fully loaded. A blue pixel will be used during loading time.



# Loading 3D Model
3D models can be loaded in the EpicCanvas using this method:
* loadObj(url): this is an async method that will load the obj model into the EpicCanvas.models array.

Supported models are only .obj files with triangular faces only.
Also to be noted that the models cannot be used until fully loaded.
Some code like this can be used to wait for loading phase to be completed: 
```js
const mySuperEpicCanvas=new EpicCanvas(640,480,"body")
await mySuperEpicCanvas.loadObj(url)
```

# Clear Screen method
clearScreen(): clears the entire screen.

The clearing color can be changed as follows:
```js
const mySuperEpicCanvas=new EpicCanvas(640,480,"body")
mySuperEpicCanvas.clearColor=[1.0,1.0,1.0,1.0]
mySuperEpicCanvas.clearScreen()
```
Default clearing color is black.

# Custom Shapes
Custom shapes can be made on the fly. A shape object can be created and must include the following:
* vertices: An array of 3D coordinates (4D actually including the w value)
* colors: An array of RGBA values, 4 float values per vertex.
* textureCoordinates: An array of u,v values. 2 float values for each vertex.
* mode: GL drawing mode, anything like:
  * gl.TRIANGLES
  * gl.TRIANGLE_FAN
  * gl.TRIANGLE_STRIP
  * gl.LINES
  * gl.LINE_STRIP
  * gl.POINTS


The shape object can then have gl buffers appended to its properties using the initBuffers method of the EpicCanvas.

Here is an example of a custom shape function:
```js
function square(epicCanvas){
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
    const mode=epicCanvas.gl.TRIANGLE_STRIP
    const shape={vertices,colors,textureCoordinates,mode}
    epicCanvas.initBuffers(shape)
    return shape
}
```
# Shaders
Shader programs can be initiated with the EpicCanvas method initShader.
InitShader takes 2 arguments:
* vertex shader source: A string of the vertex shader source code.
* fragment shader source: A string of the fragment shader source code.
The initShader method returns a shaderProgram that can be used to get a programInfo object, like follows:
```js
const program=mySuperEpicCanvas.initShaderProgram(vertexSource,fragmentSource)
const programInfo=getProgramInfo(mySuperEpicCanvas.gl,program)
```
The programInfo object is later needed to pass on to the drawShape function.
getProgramInfo takes 2 arguments:
* gl: the webGL context
* shaderProgram: the shader program

# Drawing Shapes
To draw a custom shape or a loaded model, simply use the drawShape function (global window function for now). drawShape takes 3 arguments:
* epicCanvas: The canvas to draw on.
* programInfo: Program info object. Contains info about the attributes and uniforms locations. see getProgramInfo. 
* shape: The shape to be drawn.
Examples:
```js
drawShape(mySuperEpicCanvas,programInfo,customShape)
drawShape(mySuperEpicCanvas,programInfo,mySuperEpicCanvas.models[0])
```
As you can imagine, different shapes can be drawn using different shader programs.

# Dependencies
The projection and modelView matrices are computed using gl-matrix.js.
A similar script tag must be included:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
```

# Other Special Considerations
Values that will be passed on to the GPU are floats. It is best to keep the u,v texture coordinates and colors between 0.0 and 1.0.

Vertices positions are also floats. For best results, it is best to keep the x,y,z absolute values within 0.0 and 1.0, and keep the w value at 1.0.

This library is in early development and more changes are coming.
