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
width: canvas width
height: canvas height
container selector: the canvas element created will be appended as a child to this container.

This will create an EpicCanvas object which contains the following important properties:
-canvas: a canvas
-gl: a webGL context
