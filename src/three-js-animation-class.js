const { THREE } = window;

class ThreeAnimation {
  constructor(canvasId) {
    window.s3dAnim = {};
    window.s3dObjects = {};
    window.s3dGroups = {};
    this.canvasId = canvasId;
    this.animate = this.controlledAnimate.bind(this);
    this.prepareAnim = this.prepareAnim.bind(this);
    this.initAnimation = this.initAnimation.bind(this);
    this.controlledAnimate = this.controlledAnimate.bind(this);
    this.stopAnim = {};
  }

  static destruct() {
    delete window.s3dAnim;
    delete window.s3dObjects;
    delete window.s3dGroups;
  }

  // Animation

  static getFrameDifference(start, end, duration) {
    if (start > end) return (start - end) / duration;
    else return (end - start) / duration;
  }

  initAnimation(item, name, specs) {
    this.stopAnim[name] = specs.duration;
    const call = function () {
      this.controlledRequestAnimationFrame(window.s3dAnim[name]);
    }.bind(this);
    window.s3dAnim[name] = this.prepareAnim(item, specs, call, name);
    window.s3dAnim[name]();
  }

  prepareAnim(item, specs, call, name) {
    const _classThis = this;
    return function () {
      _classThis.renderer.render(_classThis.scene, _classThis.camera);
      const { start, end } = specs;

      Object.keys(end).forEach(function (property) {
        Object.keys(end[property]).forEach(function (key) {
          const startProp = start[property];
          const endProp = end[property];

          if (startProp[key] > endProp[key]) {
            if (item[property][key] > endProp[key]) {
              const amount = ThreeAnimation.getFrameDifference(
                startProp[key],
                endProp[key],
                specs.duration
              );
              item[property][key] -= amount;
            }
          } else {
            if (item[property][key] < endProp[key]) {
              const amount = ThreeAnimation.getFrameDifference(
                startProp[key],
                endProp[key],
                specs.duration
              );
              item[property][key] += amount;
            }
          }
        });
      });

      if (_classThis.stopAnim[name]--) call();
    };
  }

  // API methods

  addObj(obj, group, withAxis) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      var loader = new THREE.GLTFLoader(_this.manager);
      loader.load(obj.path, (gltf) => {
        const root = gltf.scene;

        const pr = obj.initialProperties;
        const s = pr.scale;
        const p = pr.position;
        const r = pr.rotation;

        root.scale.set(s["x"], s["y"], s["z"]);
        root.position.set(p["x"], p["y"], p["z"]);
        root.rotation.set(r["x"], r["y"], r["z"]);
        root.name = obj.name;

        if (withAxis) {
          var helper = new THREE.BoundingBoxHelper(root, 0xff0000);
          helper.update();

          var worldAxis = new THREE.AxesHelper(1);
          root.add(worldAxis);

          var plane = new THREE.GridHelper(10, 100);
          _this.scene.add(plane);
        }

        window.s3dObjects[obj.name] = root;

        if (obj.positionB) {
          const specs = {
            duration: obj.duration,
            start: pr,
            end: obj.positionB,
          };
          _this.initAnimation(root, obj.name, specs);
        }

        if (group) group.add(root);
        else _this.scene.add(root);
        resolve(true);
      });
    });
  }

  addGroup(objects, name) {
    let group = new THREE.Group();
    const promises = [];
    const _this = this;
    return new Promise(function (resolve, reject) {
      objects.forEach(function (item, index, arr) {
        promises.push(_this.addObj(item, group));
        if (arr.length - 1 === index) {
          Promise.all(promises).then(function (values) {
            window.s3dGroups[name] = group;
            _this.scene.add(group);
            resolve(true);
          });
        }
      });
    });
  }

  removeObj(obj) {
    delete window.s3dObjects[obj.name];
    this.scene.remove(obj);
    this.controlledAnimate();
  }

  calibrateCameraPosition() {
    this.camera.position.set(0, 0, 3);
    this.cameraTarget = new THREE.Vector3(0, -0.25, 0);
    this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
  }

  // GENERAL

  init() {
    this.manager = new THREE.LoadingManager();
    this.manager.onLoad = function () {};

    this.container = document.getElementById(this.canvasId);
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 15);
    this.camera.position.set(0, -1, 3);
    this.cameraTarget = new THREE.Vector3(0, -0.25, 0);
    this.scene = new THREE.Scene();

    // Lights
    this.scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
    this.scene.background = new THREE.Color(0xd3d3d3);

    addShadowedLight(1, 1, 1, 0xffffff, 1.35, this);
    addShadowedLight(0.5, 1, -1, 0xffffff, 1, this);
    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);

    function addShadowedLight(x, y, z, color, intensity, _this) {
      var directionalLight = new THREE.DirectionalLight(color, intensity);
      directionalLight.position.set(x, y, z);
      _this.scene.add(directionalLight);
      directionalLight.castShadow = true;
      var d = 1;
      directionalLight.shadow.camera.left = -d;
      directionalLight.shadow.camera.right = d;
      directionalLight.shadow.camera.top = d;
      directionalLight.shadow.camera.bottom = -d;
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 4;
      directionalLight.shadow.bias = -0.002;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.controlledAnimate);
    this.render();
  }

  controlledRequestAnimationFrame(func) {
    setTimeout(function () {
      requestAnimationFrame(func);
    }, 1000 / 60);
  }

  controlledAnimate() {
    const _this = this;
    setTimeout(function () {
      requestAnimationFrame(_this.controlledAnimate);
      _this.render();
    }, 1000 / 60);
  }

  render() {
    this.camera.lookAt(this.cameraTarget);
    this.renderer.render(this.scene, this.camera);
  }
}
