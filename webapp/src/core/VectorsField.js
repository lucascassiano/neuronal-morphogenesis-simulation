/*
inspired by: https://github.com/jasonwebb/2d-space-colonization-experiments/blob/master/core/Network.js
*/

import * as THREE from "three";

export default class VectorsField {
    constructor(position = new THREE.Vector3(0, 0, 0), color = 0x00fa55) {
        this.object = new THREE.Object3D(); //main mesh container

        // const geometryc = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const materialc = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(geometryc, materialc);
        // cube.position.set(position.x, position.y, position.z);
        // this.object.add(cube);

        const vertexShader = `
        attribute float alpha;
        attribute float size;
        attribute vec3 color;

        varying float vAlpha;
        varying float vSize;
        varying vec3 vColor;

        void main() {
    
            vAlpha = alpha;
            vSize = size;
            vColor = color;

            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    
            gl_PointSize = vSize;
    
            gl_Position = projectionMatrix * mvPosition;
    
        }
        `;


        const fragmentShader = `

        varying float vAlpha;
        varying vec3 vColor;

        void main() {
    
            gl_FragColor = vec4( vColor.rgb, vAlpha );
    
        }
        `;

        // uniforms
        const uniforms = {

            // color: { value: new THREE.Color(0x00fa55) },

        };

        // point cloud material
        var shaderMaterial = new THREE.ShaderMaterial({

            uniforms: uniforms,
            vertexShader,
            fragmentShader,
            transparent: true

        });

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const alphas = [];
        const sizes = [];
        const spaceSize = 2;
        const gap = 0.1; // gap between points
        const halfSpace = spaceSize * 0.5 - (gap * 0.5);
        const colors = []
        const _color = new THREE.Color(color);
        for (let i = 0; i < spaceSize; i += gap)
            for (let j = 0; j < spaceSize; j += gap)
                for (let k = 0; k < spaceSize; k += gap) {
                    const x = i - halfSpace;
                    const y = j - halfSpace;
                    const z = k - halfSpace;
                    vertices.push(x, y, z);
                    const size = Math.sin(x) * 4 + 6;

                    alphas.push(Math.random());
                    sizes.push(size);
                    // colors.push(new THREE.Color("hsl(94, 100%, 50%)"));
                    // const c = new THREE.Color(`hsl(${Math.sin(x)*240}, 100%, 50%)`)
                    // colors.push(c.r, c.g, c.b);
                    colors.push(_color.r, _color.g, _color.b)

                }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        this.points = new THREE.Points(geometry, shaderMaterial);
        this.points.position.set(position.x, position.y, position.z);
        // this.object.add(this.points);

        // field space
        const box = new THREE.Box3();
        box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(spaceSize, spaceSize, spaceSize));
        const helper = new THREE.Box3Helper(box, color);

        this.object.add(helper);
    }

    clean() {
        this.object.clear();
    }
}
