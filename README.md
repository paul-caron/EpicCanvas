# EpicCanvas
WebGL drawArrays Library

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

# Load textures
Textures can be loaded into the EpicCanvas with either one of these methods:
* loadTexture(url): loads one texture
* loadTextures([url1,url2,...,urln]): loads many textures

Textures are pushed sequentially into the EpicCanvas.textures array.
Textures can be used even when not fully loaded. A blue pixel will be used during loading time.



# Load Model
3D models can be loaded in the EpicCanvas using this method:
* loadObj(url): this is an async method that will load the obj model into the EpicCanvas.models array.

Supported models are only .obj files with triangular faces only.
Also to be noted that the models cannot be used until fully loaded.
Some code like this can be used to wait for loading phase to be completed: 
```js
const mySuperEpicCanvas=EpicCanvas(640,480,"body")
await mySuperEpicCanvas.loadObj(url)
```

