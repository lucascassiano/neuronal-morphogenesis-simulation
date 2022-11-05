/*
inspired by: https://github.com/jasonwebb/2d-space-colonization-experiments/blob/master/core/Network.js
*/

import * as THREE from "three";
import Node from "./Node";
import Neuron from "./Neuron";

export default class Network {
  constructor() {
    this.attractors = []; // attractors influence node growth
    this.nodes = []; // nodes are connected to form branches
    this.neurons = [];

    this.bounds = []; // array of Path objects that branches cannot grow outside of
    this.obstacles = []; // array of Path objects that branches must avoid

    this.object = new THREE.Object3D(); //main mesh container
    // this.updateMesh()
  }

  clean() {
    this.object.clear();
  }

  addNode(pos = { x: 0, y: 0, z: 0 }) {
    const node = new Node(pos.x, pos.y, pos.z);
    this.nodes.push(node);
  }

  addNeuron(id, position) {
    const neuron = new Neuron(id);
    const { x, y, z } = position;

    // set position
    neuron.object.position.set(x, y, z);

    this.neurons.push(neuron);
    this.object.add(neuron.object);
  }

  getNeuron(id) {
    const neuron = this.neurons.find((n) => {
      return n.id == id;
    });
    return neuron;
  }

  setup() {}

  update() {}
}
