import * as THREE from 'three'
import snoise from '../r3f-gist/shader/cginc/noise/simplexNoise'
import pnoise from '../r3f-gist/shader/cginc/noise/perlinClassic3D'

function getPoint(v, size, data, offset) {
    v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
    if (v.length() > 1) return getPoint(v, size, data, offset)
    return v.normalize().multiplyScalar(size).toArray(data, offset)
}

function getSphere(count, size, p = new THREE.Vector4()) {
    const data = new Float32Array(count * 4)
    for (let i = 0; i < count * 4; i += 4) getPoint(p, size, data, i)
    return data
}

export default class SimulationMaterial extends THREE.ShaderMaterial {
    constructor(w, h) {
        const positionsTexture = new THREE.DataTexture(getSphere(w * h, 128), w, h, THREE.RGBAFormat, THREE.FloatType)
        positionsTexture.needsUpdate = true

        super({
            vertexShader: `varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
            fragmentShader: /* glsl */`

            ${snoise}
            ${pnoise}
            
            uniform sampler2D positions;
            uniform float uCurlFreq;
            uniform float uTime;
            varying vec2 vUv;

            void main() {
                float t = uTime * 0.015;
                vec3 pos = texture2D(positions, vUv).rgb; // basic simulation: displays the particles in place
                vec3 curlPos = texture2D(positions, vUv).rgb;
                pos = curlNoise(pos * uCurlFreq + t);
                curlPos = curlNoise(curlPos * uCurlFreq + t);
                curlPos += curlNoise(curlPos * uCurlFreq * 2.0) * 0.5;
                curlPos += curlNoise(curlPos * uCurlFreq * 4.0) * 0.25;
                curlPos += curlNoise(curlPos * uCurlFreq * 8.0) * 0.125;
                curlPos += curlNoise(pos * uCurlFreq * 16.0) * 0.0625;
                gl_FragColor = vec4(mix(pos, curlPos, perlinClassic3D(pos + t)), 1.0);
            }`,

            uniforms: {
                positions: { value: positionsTexture },
                uTime: { value: 0 },
                uCurlFreq: { value: 0.25 }
            }
        })
    }
}