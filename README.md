# EpicCanvas
3D WebGL drawArrays Library

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
* and more!

*** EPIC ***

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
Custom shapes can be made on the fly. An object must be created and must include the following:
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
    const mode=epic.Canvas.gl.TRIANGLE_STRIP
    const shape={vertices,colors,textureCoordinates,mode}
    epicCanvas.initBuffers(shape)
    return shape
}
```
# Dependencies
The projection and modelView matrices are computed using gl-matrix.js.
A similar script tag must be included:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
```

# Other Special Considerations
Values that will be passed on to the GPU are floats. It is best to keep the u,v texture coordinates and colors between 0.0 and 1.0.

