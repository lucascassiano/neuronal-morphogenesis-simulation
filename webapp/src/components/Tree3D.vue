<template>
  <div id="container">
    THREE3D
    <canvas id="canvas"></canvas>
    <div id="menu">
      <div @click="initWebSocket()">Connect WebSocket</div>
      <div @click="sendWebSocketMsg('simulation', 'start')">
        Start Simuation
      </div>
      <div @click="addNeuron(-1, 1, 1)">Add Node</div>
      <div @click="helpers.grid.visible = !helpers.grid.visible">
        toggle grid
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Network from "@/core/Network.js";
import WebscoketClient from "@/client";
import config from "@/core/config.js";
import AttractorsField from "@/core/AttractorsField.js";
import VectorsField from "@/core/VectorsField.js";
let network;
let attractorsFields = [];

export default {
  name: "Tree2D",
  props: {
    msg: String,
  },
  setup: () => {
    console.log("starting..");
    let canvas;
    let camera;
    let renderer;
    let scene;
    let ws;

    const helpers = {
      grid: null,
    };

    network = new Network();

    const init = () => {
      canvas = document.querySelector("#canvas");
      console.log(canvas.clientWidth);

      //renderer
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: "high-performance",
      });

      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.physicallyCorrectLights = false;

      //set scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(config.scene.background);

      //helpers
      // helpers.grid = new THREE.GridHelper(2, 20);
      helpers.grid = new THREE.Object3D();
      const xzGrid = new THREE.GridHelper(2, 20);
      const xyGrid = new THREE.GridHelper(2, 20);
      xyGrid.rotation.x = Math.PI / 2;
      helpers.grid.add(xzGrid);
      helpers.grid.add(xyGrid);

      scene.add(helpers.grid);

      const axesHelper = new THREE.AxesHelper(0.1);
      scene.add(axesHelper);

      //camera
      camera = new THREE.PerspectiveCamera(
        10,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(10, 10, 10);

      //controls
      new OrbitControls(camera, renderer.domElement);

      //lights
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      scene.add(directionalLight);

      //render
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      //init scene
      scene.add(network.object);

      //EXPERIMENTAL
      const vf = new VectorsField();
      console.log(vf);
      scene.add( vf.object);
    };

    const onWindowResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    const initWebSocket = () => {
      const address = "ws://127.0.0.1:8765/";
      ws = new WebscoketClient(address, false);
      ws.onReceived = (data) => {
        data = JSON.parse(data);
        // console.log(data.cmd);
        // execute commands from simulation engine
        /* eslint-disable no-case-declarations*/
        switch (data.cmd) {
          case "ADD_NEURON":
            network.addNeuron(data.id, data.position);
            break;
          case "ADD_ATTRACTOR":
            let neuron = network.getNeuron(data.id);
            neuron.addAttractorPoint(data.position);
            break;
          case "ADD_ATTRACTORS_LIST":
            network.getNeuron(data.id).addAttractorsList(data.attractors);
            break;
          case "ADD_NODE":
            network
              .getNeuron(data.parentNeuron)
              .addNode(data.start, data.end, data.thickness);
            break;
          case "ADD_DENTRITE":
            network
              .getNeuron(data.parentNeuron)
              .addDentrite(data.start, data.end);
            break;
          case "ADD_ATTRACTORS_FIELD":
            console.log("add attractors field");
            // alert("attractors field");
            const af = new AttractorsField(
              data.position,
              data.diameter,
              data.attractors
            );
            scene.add(af.object);
            attractorsFields.push(af);

            break;
          case "CLEAN":
            network.clean();
            for (const af of attractorsFields) af.clean();
            break;
          // break;
          // default:
          //   continue;
        }
      };
    };

    const sendWebSocketMsg = (msgType, data) => {
      ws.send(msgType, data);
    };

    const addNeuron = (id, position) => {
      console.log("adding neuron", position);
      network.addNeuron(id, position.x, position.y, position.z);
    };

    const onWindowReload = () => {
      network.clean();
      return "clean";
    };

    onMounted(() => {
      init(); //init 3D scene
      initWebSocket(); //initialize webSocket
      window.addEventListener("resize", onWindowResize); //3d responsiveness
      window.addEventListener("beforeunload", onWindowReload);
    });

    return { initWebSocket, sendWebSocketMsg, addNeuron, helpers };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#canvas {
  top: 0;
  left: 0;
  position: absolute;
  width: 100vw;
  height: 100vh;
}

#menu {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 8pt;
  div {
    background: black;
    color: white;
    padding: 5px 12px;
    border-radius: 1px;
    margin-bottom: 6px;
    border: solid 1px rgba(white, 0.25);
    user-select: none;
  }

  div:hover {
    background: #333;
    cursor: pointer;
  }
  div:active {
    background: #666;
  }
}
</style>
