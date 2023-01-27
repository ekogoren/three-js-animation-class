# Three JS Animation Class

Three JS Animation Class is a helper class to render 3D models and groups using three.js and easily animate their position, rotation and scale using two sets of parameters.

## usage
Make sure you load three.js and GLFT.js first like in the example.
To init the scene instantiate the class and call init with the id of your HTML container:
```js
const threeAnimation = new ThreeAnimation("animation");
threeAnimation.init();
```
A threeAnimation Object should have a unique name, a path to a glb file, initial properties and positionB, for example:
```js
const telescopeDescendAndRotate = {
        path: "./models/telescope.glb",
        name: "telescope",
        initialProperties: {
          scale: {
            x: 20.050000000000008,
            y: 20.01,
            z: 20,
          },
          position: {
            x: 0.02,
            y: 1.11,
            z: 0,
          },
          rotation: {
            x: 0.2,
            y: 3.16,
            z: 0,
          },
        },
        duration: 100,
        positionB: {
          scale: {
            x: 20.050000000000008,
            y: 20.01,
            z: 20,
          },
          position: {
            x: 0.02,
            y: -0.49,
            z: 0,
          },
          rotation: {
            x: 0.8,
            y: 3.86,
            z: 0,
          },
        },
      };
```
We can add this model to the scene using the addObj method:
```js
threeAnimation.addObj(telescopeDescendAndRotate);
```
A group of models can be added as an array of object, group name as second parameter:
```js
threeAnimation.addGroup(models,'modelGroup');
```
To remove an objet from the scene use 'removeObj'
```js
threeAnimation.removeObj(model);
```