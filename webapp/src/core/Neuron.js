//https://medium.com/@jason.webb/space-colonization-algorithm-in-javascript-6f683b743dc5#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjhkOTI5YzYzZmYxMDgyYmJiOGM5OWY5OTRmYTNmZjRhZGFkYTJkMTEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2MzI3MDE4OTIsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwNzk0MzQxNDQ5NDQxMDA4NjQ0NiIsImVtYWlsIjoibHVjYXNjYXNzaWFubzIxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoiTHVjYXMgQ2Fzc2lhbm8iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2dGaTdFcmhYYXpVUXNNWW16N0VQTXY1RHdDaDBHeEVocDdKSGcwTDNnPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ikx1Y2FzIiwiZmFtaWx5X25hbWUiOiJDYXNzaWFubyIsImlhdCI6MTYzMjcwMjE5MiwiZXhwIjoxNjMyNzA1NzkyLCJqdGkiOiJiZTk4MjlmMzc4ZWE0YThmZjZkODYxY2UwMTNkMGUwOTkxZmZmYjJjIn0.m7_EIP44IXphEIkxFM9qUJE10mvpNre7HSsmHr53FHFWWjaqnIalkn4UDPXtsuJSKUpfbvNPopNJD9XH6wi4wPDfYyHGHZ8Vz62mf8cFaVtRh0IMG-ItvHBxcu5MxKAztdESK7adOoJgiMP-tBBp-_NWwAWYsL6MZ2ZprGm_KR0Fs_a4GahXKeBk5zG_cG9oT-Nhr8_TBuARl190HMcyTYsW6ba2bDbd3MghM6TThwrywGdrnHSOjFrPpBwe1LdNXs4M87t8uOeH1uVaj3essmBqcBCyC77CUibpc0ee2D8hayqE2a86wvvmdJQ91dR2JtgG1IUCoxjNKymAE1372w
import * as THREE from "three";

import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

import config from "./config";

export default class Neuron {
    constructor(id) {
        this.id = id;
        this.internalType = "NEURON";

        this.children = [];
        this.dendrite = new THREE.Object3D();

        this.object = new THREE.Object3D();

        console.log(`new node ${this.id}`);

        this.object.add(this.dendrite);

        this.updateMesh();
    }

    initBaseMesh() {
        // const geometry = new THREE.ConeGeometry(0.05, 0.05 * Math.sqrt(2), 3);
        const geometry = new THREE.SphereGeometry(0.05, 12, 12);


        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(config.neuron.color),
            transparent: true,
            opacity: 1,//0.25,
            // wireframe: true
        });



        const cone = new THREE.Mesh(geometry, this.material);

        this.object.add(cone);
        // this.object.add(cone2);
    }

    updateMesh() {
        this.initBaseMesh(); //pyramid

        //init attractors
        const geometry = new THREE.BufferGeometry();

        const pMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 4,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false,
            vertexColors: true,
        });
        const material = new THREE.LineBasicMaterial({ vertexColors: true });

        const positions = [];
        const colors = [];

        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();

        this.attractorsCloud = new THREE.Points(geometry, pMaterial);

        this.lineSegments = new THREE.LineSegments(geometry, material);
        this.lineSegments.visible = false;
        this.object.add(this.lineSegments);

        this.object.add(this.attractorsCloud);

        //init Dentrites
        this.initDentrites();
    }

    addAttractorPoint(position) {
        const { x, y, z } = position;

        const positions = Array.from(
            this.attractorsCloud.geometry.attributes.position.array
        );
        const colors = Array.from(
            this.attractorsCloud.geometry.attributes.color.array
        );

        const addVertex = (x, y, z) => {
            positions.push(x, y, z);
            colors.push(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1);
        };
        addVertex(x, y, z);

        this.attractorsCloud.geometry.setDrawRange(0, positions.length);

        this.attractorsCloud.geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );
        this.attractorsCloud.geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        this.attractorsCloud.geometry.attributes.position.needsUpdate = true;
    }

    /**
     *
     * @param {add many positions at once} positions
     */
    addAttractorsList(positions) {
        const colors = [];

        for (let i = 0; i < positions.length; i++) {
            colors.push(Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 0.15);
        }

        this.attractorsCloud.geometry.setDrawRange(0, positions.length);

        this.attractorsCloud.geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        this.attractorsCloud.geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(colors, 3)
        );

        this.attractorsCloud.geometry.computeBoundingSphere();
        this.attractorsCloud.geometry.attributes.position.needsUpdate = true;
    }

    initDentrites() {
        const geometry = new THREE.BufferGeometry();

        const pMaterial = new THREE.PointsMaterial({
            color: config.dendrites.color,
            size: 3,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false,
            opacity: 0.25,
        });

        // const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.1 });
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute([0, 0, 0], 3)
        );

        geometry.computeBoundingSphere();

        this.dendritePoints = new THREE.Points(geometry, pMaterial);
        // this.dendriteLines = new THREE.LineSegments(geometry, material);

        this.dendriteLines = new THREE.Group();

        this.dendrite.add(this.dendritePoints);
        this.dendrite.add(this.dendriteLines);
    }

    addDentrite(start, end) {
        this.addNode(start, end)
    }

    addNode(start, end, thickness) {
        const positions = Array.from(
            this.dendritePoints.geometry.attributes.position.array
        );

        positions.push(start.x, start.y, start.z);
        positions.push(end.x, end.y, end.z);

        this.dendritePoints.geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );
        this.dendritePoints.geometry.setDrawRange(0, positions.length);

        this.dendritePoints.geometry.computeBoundingSphere();

        this.dendritePoints.geometry.attributes.position.needsUpdate = true;

        //adding a dendrite line (experimental)
        const lineGeometry = new LineGeometry();
        const linePositions = [];
        linePositions.push(start.x, start.y, start.z);
        linePositions.push(end.x, end.y, end.z);

        lineGeometry.setPositions(linePositions);
        // lineGeometry.setColors(colors);

        const matLine = new LineMaterial({
            color: config.dendrites.color,
            // linewidth: 0.01,
            sizeAttenuation: false,

            linewidth: thickness * 0.05, // in world units with size attenuation, pixels otherwise
        });

        const line = new Line2(lineGeometry, matLine);
        // line.computeLineDistances();
        // line.scale.set(1, 1, 1);
        this.dendriteLines.add(line);
    }

    growDentrite() { }
}
