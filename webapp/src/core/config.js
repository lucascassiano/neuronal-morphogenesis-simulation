import * as THREE from "three"

const themes = {
    default: "dark",
    dark: {
        scene: {
            background: "#000000"
        },
        neuron: {
            color: "#fafafa",
        },
        dendrites: {
            color: "#fafafa"
        }
    },
    light: {
        scene: {
            background: "white"
        },
        neuron: {
            color: "black",
        },
        dendrites: {
            color: "black"
        }
    },
};

class Config {
    constructor() {
        this.theme = themes.dark;
        this.neuron = {
            color: this.theme.neuron.color
        }
        this.dendrites = {
            color: new THREE.Color(this.theme.dendrites.color)
        }
        this.scene = {
            background: this.theme.scene.background
        }
    }
}

const config = new Config();

export default config;
