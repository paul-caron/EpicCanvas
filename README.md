# EpicCanvas API Reference

A summary of methods and properties available in the `EpicCanvas` class.

---

## Constructor

```js
new EpicCanvas(width, height, containerSelector)
```
Creates a new EpicCanvas and appends the canvas to the specified container.

---

## Core Properties

- **canvas**  
  The HTMLCanvasElement created.

- **gl**  
  The WebGL context.

- **cameraPosition**  
  Current camera position as a `[x, y, z]` array.

---

## Core Methods

### Texture Methods

- **loadTexture(url, options?)**  
  Loads an image as a texture, returns a texture handle.

- **loadTextures([url1, url2, ...])**  
  Loads multiple textures, returns array of handles.

- **createTexture(width, height)**  
  Creates an empty texture of given size.

- **setTexture(texture)**  
  Sets the active texture for drawing.

- **createFramebuffer(texture, width, height)**  
  Creates a framebuffer using the given texture.

- **renderToTexture(texture, width, height, renderFunc, ...args)**  
  Renders to a texture using the provided function.

---

### Cubemap Methods

- **loadCubeMap([url1, url2, url3, url4, url5, url6], options?)**  
  Loads a cubemap from six image URLs.

- **createEmptyCubeMap(width)**  
  Creates a default blue cubemap.

- **renderToCubeMapFace(cubemap, face, width, height, renderFunc, ...args)**  
  Renders to a specific face of a cubemap.

- **setCubeMap(cubemap)**  
  Sets the active cubemap.

---

### Model Loading

- **loadObj(url)**  
  Loads an OBJ model (triangular faces only), async.

- **loadSTL(url)**  
  Loads an STL model, returns a promise for a drawable shape.

- **loadPLY(url)**  
  Loads a PLY (ascii) model, returns a promise for a drawable shape.

---

### Drawing

- **drawShape(program, shape)**  
  Draws a shape/model using the provided shader program.

- **clearScreen()**  
  Clears the entire canvas.

---

### Shape & Buffer Methods

- **initBuffers(shape)**  
  Initializes WebGL buffers for a shape object.

- **reloadBufferData(shape)**  
  Reloads buffer data after modifying a shape.

---

### Window/View Methods

- **window(startWidthRatio, startHeightRatio, widthRatio, heightRatio)**  
  Returns a function to set a scissored viewport region.

---

### Camera Methods

- **lookAt(eye, center, up)**  
  Sets the view matrix to look from eye to center.

- **lookFront(eye, yaw)**  
  Sets view matrix with yaw angle.

- **lookPitchYaw(eye, pitch, yaw)**  
  Sets view matrix with pitch and yaw angles.

- **cameraPosition**  
  Gets or sets the camera position.

---

### Lighting Properties

- **ambientColor = [r, g, b]**  
  Sets ambient light color.

- **directionalColor = [r, g, b]**  
  Sets directional light color.

- **directionalVector = [x, y, z]**  
  Sets directional light direction.

- **pointLightColor = [r, g, b]**  
  Sets point light color.

- **pointLightPosition = [x, y, z]**  
  Sets point light position.

---

### Perspective Properties

- **fieldOfView, zNear, zFar, aspectRatio**  
  Perspective parameters for rendering.

---

### Shaders

- **makeProgram(vertexSource, fragmentSource)**  
  Compiles and links shaders. Returns a program object.

---

### Utilities

- **setNormals(shape)**  
  Calculates & sets normals for a shape (gl.TRIANGLES mode).

- **getWorldPosition(shape, vertexIndex?)**  
  Returns the world coordinates of the shape’s origin or a specific vertex (after transforms).

- **makeShapeLookAt(shape, eye, center, up)**  
  Sets the model matrix of the shape so that it "looks at" a target position, similar to camera lookAt but for models.

---

## Transformation Methods

EpicCanvas provides transformation methods for model matrix, view matrix, and direct modification of vertex data.

### Model Matrix Transformations  
_Apply transformations through the model matrix for rendering._

- **translateModelMatrix(shape, [x, y, z])**  
  Applies translation to the model matrix.

- **rotateModelMatrix(shape, angle, [x, y, z])**  
  Applies rotation (angle in radians) around axis `[x, y, z]`.

- **scaleModelMatrix(shape, [x, y, z])**  
  Applies scaling to the model matrix.

### View Matrix Transformations  
_Apply transformations through the view matrix for rendering._

- **translateViewMatrix([x, y, z])**  
  Translates the view matrix.

- **rotateViewMatrix(angle, [x, y, z])**  
  Rotates the view matrix (angle in radians, axis as array).

- **scaleViewMatrix([x, y, z])**  
  Scales the view matrix.

### Direct Vertex Modification Methods  
_Modify the underlying vertex data directly (requires reloadBufferData after use)._

- **center(shape)**  
  Centers the shape’s vertices at the origin.

- **scaleToUnitSize(shape)**  
  Scales the shape so its largest dimension is 1.

- **translateX(shape, dx)**  
  Moves vertices in X.

- **translateY(shape, dy)**  
  Moves vertices in Y.

- **translateZ(shape, dz)**  
  Moves vertices in Z.

- **rotateX(shape, angle)**  
  Rotates vertices around X.

- **rotateY(shape, angle)**  
  Rotates vertices around Y.

- **rotateZ(shape, angle)**  
  Rotates vertices around Z.

- **scale(shape, x, y, z)**  
  Scales vertices.

---

## Dependencies

This library uses [gl-matrix.js](https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js) for matrix math.

---

## Notes

- All coordinates, colors, and texture values should be floats between 0.0 and 1.0.
- This library is in early development. API may change.
