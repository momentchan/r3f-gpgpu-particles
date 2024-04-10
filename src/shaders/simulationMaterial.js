import * as THREE from 'three'
import snoise from '../r3f-gist/shader/cginc/noise/simplexNoise'
import pnoise from '../r3f-gist/shader/cginc/noise/perlinClassic3D'

export default class SimulationMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            fragmentShader: /* glsl */`

            ${snoise}
            ${pnoise}
            
            uniform float uCurlFreq;
            uniform float uTime;
            uniform sampler2D uInitPos;

            void main() {
                float t = uTime * 0.015;
                vec2 uv = gl_FragCoord.xy / resolution.xy;
                vec3 pos = texture2D(uInitPos, uv).rgb; // basic simulation: displays the particles in place
                vec3 curlPos = texture2D(uInitPos, uv).rgb;
                pos = curlNoise(pos * uCurlFreq + t);
                curlPos = curlNoise(curlPos * uCurlFreq + t);
                curlPos += curlNoise(curlPos * uCurlFreq * 2.0) * 0.5;
                curlPos += curlNoise(curlPos * uCurlFreq * 4.0) * 0.25;
                curlPos += curlNoise(curlPos * uCurlFreq * 8.0) * 0.125;
                curlPos += curlNoise(pos * uCurlFreq * 16.0) * 0.0625;
                gl_FragColor = vec4(mix(pos, curlPos, perlinClassic3D(pos + t)), 1.0);
            }`,

            uniforms: {
                uTime: { value: 0 },
                uCurlFreq: { value: 0.25 },
                uInitPos: { value: null }
            }
        })
    }
}