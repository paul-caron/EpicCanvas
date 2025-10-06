# EpicCanvas
3D WebGL drawArrays Library (and also 4D in parts)

Why focus on drawArrays? drawArrays in my humble opinion is easier to use when creating custom shapes on the fly. Unless you use a 3D model software like blender, keeping track of all indices is tedious.
In addition, most other 3D libraries likely use drawElements, so this one is for those who seek the freedom and advantages of drawArrays.

New first true release: Ancho Chipotle

Awesome features:
- basic camera
- textures with whole set of 2D texture filtering options, and super sexy smooth anisotropic filtering as well.
- dynamic perspective
- lighting capabilities
- 4D is the standard for any shape vertex
- loading .stl models
- loading .obj models (experimental at this point)
- several primitive shapes (more coming)
- 3D and 4D shape transforms
- variety of different shaders available for color, texture and lighting
- cubemaps

# Create a canvas
Easy.
```js
const width = 640
const height = 480
const epicCanvas = new EpicCanvas(width,height,"body")
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
* loadTexture(url, options): loads one texture
* loadTextures([url1,url2,...,urln]): loads many textures

Textures are pushed sequentially into the EpicCanvas.textures array.
Textures can be used even when not fully loaded. A blue pixel will be used during loading time.

EpicCanvas.loadTexture(url, options) returns a handle to that texture, which can be used later when setting the texture being drawn on a shape.

The filtering options object may be omitted (optional) for default filtering settings, or can be adjusted as such:
```js
const options = {
    minFilter: "nearest", //or "linear"
    magFilter: "nearest", //or "linear"
    mipmapFilter: "nearest", //or "linear"
    anisotropy: 1.0 , // anisotropic filtering range factor from 0.00 to 1.0
}

epicCanvas.loadTexture(url, options)
```

# Set Texture
It is possible to alternate between textures. The EpicCanvas.setTexture(texture) method is there for that purpose.

Set the texture before calling drawShape:
```js
const texture1 = epicCanvas.loadTexure(url1)
const texture2 = epicCanvas.loadTexture(url2)

epicCanvas.setTexture(texture1)
epicCanvas.drawShape(programInfo, shape1)

epicCanvas.setTexture(texture2)
epicCanvas.drawShape(programInfo, shape2)
```

# Update Texture

A texture that has already been loaded can be updated with the updateTexture method.
Pass it the texture handle you would like to update and a URL.
```js
epicCanvas.updateTexture(texture, url)
```

# Render Onto A 2D Texture
Sometimes you would like to modify a texture, like for adding shadows perhaps. The renderToTexture method is there to help. The parameters:

* texture: The texture to modify
* width: Width of the texture
* height: Height of the texture
* rendering function: The function to render stuff onto the texture
* ... all the rendering function parameters.

Example
```js
const renderingFunction = () => {
    epicCanvas.clearScreen()
    epicCanvas.drawShape(program, shape)
}
//create empty texture
let texture = epicCanvas.loadTexture(null)
//render onto the previously empty texture
epicCanvas.renderToTexture(texture, textureWidth, textureHeight, renderingFunction)
```

# Copy A Texture
The content of one 2D texture can be written over the content of another, using copyTexture method.
The parameters are:
* from: The texture to copy from
* to: The texture to copy to
* from_type: The texture type that is copied from
* to_type: The texture type that is copied to
* width: Texture width
* height: Texture height

```js
epicCanvas.copyTexture(from, to, from_type, to_type, width, height)
```

The texture types can be any of the following:
* gl.TEXTURE_2D
* gl.TEXTURE_CUBE_MAP_POSITIVE_X
* gl.TEXTURE_CUBE_MAP_NEGATIVE_X
* gl.TEXTURE_CUBE_MAP_POSITIVE_Y
* gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
* gl.TEXTURE_CUBE_MAP_POSITIVE_Z
* gl.TEXTURE_CUBE_MAP_NEGATIVE_Z

# Loading OBJ 3D Model
OBJ 3D models can be loaded in the EpicCanvas using this method:
* loadObj(url): this is an async method that will load the obj model into the EpicCanvas.models array.

Supported models are only .obj files with triangular faces only.
Also to be noted that the models cannot be used until fully loaded.
Some code like this can be used to wait for loading phase to be completed: 
```js
const epicCanvas = new EpicCanvas(640,480,"body")
await epicCanvas.loadObj(url)
```

# Loading STL 3D Model
STL 3D models can be loaded with loadSTL method. It returns a promise that resolves into a drawable shape.
Simply call it with a URL as parameter.
```js
const model = epicCanvas.loadSTL(url)
model.then(shape => {
    epicCanvas.drawShape(program, shape)
})
```


# Loading PLY 3D Model
PLY (ascii) 3D models can be loaded with loadPLY method. It returns a promise that resolves into a drawable shape.
Simply call it with a URL as parameter.
```js
const model = epicCanvas.loadPLY(url)
model.then(shape => {
    epicCanvas.drawShape(program, shape)
})
```


# Loading a Cubemap
Loading a cubemap is easy provided you have exactly six urls of images that are square and power of two (2,4,8,16,32,64,...512,..etc)
Put all the urls in an array of six, as such:
```js
const cubemapsURLs = [url1,url2,url3,url4,url5,url6]
```
Then load the cubemap like this
```js
const cubemap = await epicCanvas.loadCubeMap(cubemapURLs, options = {})
```
The cubemap images with be assigned in this order:
* gl.TEXTURE_CUBE_MAP_POSITIVE_X
* gl.TEXTURE_CUBE_MAP_NEGATIVE_X
* gl.TEXTURE_CUBE_MAP_POSITIVE_Y
* gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
* gl.TEXTURE_CUBE_MAP_POSITIVE_Z
* gl.TEXTURE_CUBE_MAP_NEGATIVE_Z

# Render Drawing Onto Cubemap Face
Sometimes you would like to modify a cubemap, like for adding shadows perhaps.
The renderToCubeMapFace method is there to help.
The parameters:
* cubemap: The cubemap to modify
* face: The cubemap face to modify
* width: Width of the cubemap face
* height: Height of the cubemap face
* rendering function: The function to render stuff onto the cubemap face
* ... all the rendering function parameters.

Example
```js
const cubeMap = await epicCanvas.loadCubeMap(urls)
const renderingFunction = () => {
    epicCanvas.clearScreen()
    epicCanvas.drawShape(program, shape)
}

epicCanvas.renderToCubeMapFace(cubeMap, epicCanvas.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, textureWidth, textureHeight, renderingFunction)
```


# Set a Cubemap
To set the active cubemap, use setCubeMap method. That way you can alternate between different cubemaps.
```js
epicCanvas.setCubeMap(cubemap)
```

# Clear Screen method
clearScreen(): clears the entire screen.

The clearing color can be changed as follows:
```js
const epicCanvas=new EpicCanvas(640,480,"body")
epicCanvas.clearColor = [1.0,1.0,1.0,1.0]
epicCanvas.clearScreen()
```
Default clearing color is black.

# Custom Shapes
Custom shapes can be made on the fly. A shape object can be created and must include the following:
* vertices: An array of 4D coordinates (simply set w to 1.0 for 3D)
* colors: An array of RGBA values, 4 float values per vertex.
* textureCoordinates: An array of u,v values. 2 float values for each vertex.
* normals: An array of normal vectors, directions perpenticular to the shape's faces
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
    const normals=[
        0.0,0.0,1.0,1.0,
        0.0,0.0,1.0,1.0,
        0.0,0.0,1.0,1.0,
        0.0,0.0,1.0,1.0
    ]
    const mode=epicCanvas.gl.TRIANGLE_STRIP
    const shape={vertices,colors,textureCoordinates,mode,normals}
    epicCanvas.initBuffers(shape)
    return shape
}
```

The EpicCanvas repo also contains some primitive shapes ready to use.

# EpicShape
The EpicShape class constructs a drawable shape object for you, from one or more other shape objects. This is like bundling many objects into one and this has the power to increase performance by having only one call to drawShape rather than multiple calls.

The EpicShape class constructs an object given three or more parameters:
* The EpicCanvas
* The drawing mode (eg: gl.TRIANGLES, gl.LINES, etc)
* The shape(s)

```js
const sq1 = Square(epicCanvas)
const sq2 = Square(epicCanvas)

const epicShape = new EpicShape(epicCanvas, ec.gl.TRIANGLES, sq1, sq2)
```

You also may want to not initialise any buffers (dont call epicCanvas.initBuffers) for your smaller shapes before passing then to EpicShape constructor, again to improve performance. That way, buffers only exist in the EpicShape object and not in every smaller objects.

# Transformations
Three types of transformations can be done:
* translation: slide something in a direction.
* rotation: turn something around an axis.
* scaling: enlarge or shrink something.

Transformations on the model or view matrix:
* EpicCanvas.translateMatrix(mat4)
* EpicCanvas.rotateMatrix(mat4)
* EpicCanvas.scaleMatrix(mat4)

Transformations on the shapes:
* translateX(shape, dx)
* translateY(shape, dy)
* translateZ(shape, dz)
* rotateX(shape, angle)
* rotateY(shape, angle)
* rotateZ(shape, angle)
* scale(shape, x, y, z)

After transforming a shape, it is highly recommended to reload the buffers data. For this purpose, the EpicCanvas contains a method called reloadBufferData.
```js
epicCanvas.reloadBufferData(shape)
```
# Camera
Three cameras methods are available:
* EpicCanvas.lookAt(eyePosistionVec3, centerVec3, upVec3)
* EpicCanvas.lookFront(eyePositionVec3, yawAngle)
* EpicCanvas.lookPitchYaw(eyePositionVec3, pitch, yaw)

Calling these camera methods will modify the view matrix.

Keep in mind, yaw angle for lookFront should most often be at -Math.PI/2 if you want to look in the negative Z direction.

# Lighting
Basic lighting is provided through three different ways:
* ambient lighting
* directional lighting
* point lighting (single point light available)

To set the ambient lighting color, pass it an array of 3 colors, from 0 to 1.0.
```js
const red = 0.0
const green = 0.5
const blue = 1.0
epicCanvas.ambientColor = [red, green, blue]
```

To set the directional light, you can adjust its color and direction by passing it arrays of 3 values.
```js
//set color
const red = 1.0
const green = 1.0
const blue = 1.0
epicCanvas.directionalColor = [red, green, blue]

//set direction
const x = 0
const y = 0
const z = 1
epicCanvas.directionalVector = [x, y, z]
```

To set the point light, give it arrays of 3 for the color and for the position
```js
epicCanvas.pointLightColor = [red, green, blue]
epicCanvas.pointLightPosition = [x, y, z]
```

# Dynamic Perspective
It is possible to adjust the perspective parameters on the fly.
Simply change them through assignment like this.
```js
epicCanvas.fieldOfView = Math.PI / 3
epicCanvas.zNear = 0.1
epicCanvas.zFar = 100.0
epicCanvas.aspectRatio = width / height
```

# Shaders
Shaders need be compiled via makeProgram method of the EpicCanvas.

makeProgram takes 2 arguments:
* vertex shader source: A string of the vertex shader source code.
* fragment shader source: A string of the fragment shader source code.

```js
const program = epicCanvas.makeProgram(vertexSource, fragmentSource)
```
The program object is later needed to pass on to the drawShape function. It contains the program and all the variables (attributes and uniforms) locations.

The EpicCanvas repository contains vertex and fragment shaders, ready to be used. Some use vertex colors, others use texture coordinates, with and without basic lighting.

# Drawing Shapes
To draw a custom shape or a loaded model, simply use the drawShape function (global window function for now). drawShape takes 3 arguments:
* epicCanvas: The canvas to draw on.
* program: Program object. Contains info about the attributes and uniforms locations. see makeProgram. 
* shape: The shape to be drawn.
Examples:
```js
epicCanvas.drawShape(program, customShape)
epicCanvas.drawShape(program, epicCanvas.models[0])
```
As you can imagine, different shapes can be drawn using different shader programs.

# Coordinates System
EpicCanvas has a coordinate system setup so that when you look in the negative Z direction, from a (0,0,0) position:
* positive X is at the right of the screen
* negative X is at the left of the screen
* positive Y is at the top of the screen
* negative Y is at the bottom of the screen

# Automatic Normals
To find and set the normals of a shape that has vertices arranged for gl.TRIANGLES mode, we can use the setNormals function.

Works only for gl.TRIANGLES mode and assuming the vertices order follow the right hand rule.
```js
setNormals(shape)
// now shape has normals set based on its vertices
```

# Window
Webgl viewports are bit confusing for some. EpicCanvas wishes to help remedy this with the window method.

The window method creates a function that when called will call for a "scissored viewport", which means that the viewport area only will be cleared and written over.

The method functions a bit different than gl.viewports method.
* The window method takes in ratios of the width and height of the canvas.
* The window method has origin in left upper corner (not left lower corner)

The method takes in the following arguments:
* startWidthRatio: a number from 0.0-1.0
* startHeightRatio: a number from 0.0-1.0
* widthRatio: a number from 0.0-1.0
* heightRatio: a number from 0.0-1.0

Example
```js
//for x=0,y=0, width=0.5*canvas.width, height=0.5*canvas.height
const leftUpper = window(0,0,0.5,0.5)
leftUpper() //changes the active window to left upper quadrant

const fullscreen = window(0,0,1,1)
fullscreen() //changes the active window to fullscreen
```

# Dependencies
The projection and modelView matrices are computed using gl-matrix.js.
A similar script tag must be included:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"></script>
```

# Other Special Considerations
Values that will be passed on to the GPU are floats. It is best to keep the u,v texture coordinates and colors between 0.0 and 1.0.

Vertices positions are also floats.


This library is in early development and more changes are coming. No warranty given. Using this library is at your own risk.
