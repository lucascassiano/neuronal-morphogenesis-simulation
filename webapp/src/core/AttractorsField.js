/*
inspired by: https://github.com/jasonwebb/2d-space-colonization-experiments/blob/master/core/Network.js
*/

import * as THREE from "three";

export default class AttractorField {
    constructor(position, diameter = 1, attractors = [], color = 0xffffff) {
        this.attractors = attractors; // attractors influence node growth

        this.object = new THREE.Object3D(); //main mesh container

        // add array of points
        const geometry = new THREE.BufferGeometry();
        const pointMaterial = new THREE.PointsMaterial({
            color: color,
            size: 4,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false,
            opacity: 0.12,
        });
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(attractors, 3)
        );
        geometry.computeBoundingSphere();
        this.attractorsPoints = new THREE.Points(geometry, pointMaterial);
        this.attractorsPoints.position.set(position.x, position.y, position.z);
        this.object.add(this.attractorsPoints);

        // add volumetric spheric
        const sphereGeometry = new THREE.SphereGeometry(diameter / 2, 32, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: color,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.1,
        });

        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(position.x, position.y, position.z);
        this.object.add(sphere);

    }

    clean() {
        this.object.clear();
    }
}
