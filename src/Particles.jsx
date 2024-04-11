import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import './shaders/simulationMaterial'
import './r3f-gist/shader/custom/particles/DofPointsMaterial'
import SimulationMaterial from './shaders/simulationMaterial';
import DofPointsMaterial from './r3f-gist/shader/custom/particles/DofPointsMaterial';
import GPGPU from './r3f-gist/gpgpu/GPGPU';

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


export default function Particles({ speed, fov, aperture, focus, curl, size = 512, ...props }) {
    const geoRef = useRef()
    const renderMat = new DofPointsMaterial()
    const { gl } = useThree()

    // Normalize points
    const particles = useMemo(() => {
        const length = size * size
        const particles = new Float32Array(length * 3)
        for (let i = 0; i < length; i++) {
            let i3 = i * 3
            particles[i3 + 0] = (i % size) / size
            particles[i3 + 1] = i / size / size
        }
        return particles
    }, [size])


    const gpgpu = useMemo(() => {
        const gpgpu = new GPGPU(gl, size, size)

        gpgpu.addVariable('positions', new Float32Array(size * size * 4), new SimulationMaterial())

        const initPosTex = new THREE.DataTexture(getSphere(size * size, 128), size, size, THREE.RGBAFormat, THREE.FloatType)
        initPosTex.needsUpdate = true

        gpgpu.setUniform('positions', 'uTime', 0)
        gpgpu.setUniform('positions', 'uInitPos', initPosTex)

        gpgpu.init()

        return gpgpu
    }, [size])


    useFrame((state) => {
        gpgpu.setUniform('positions', 'uTime', state.clock.elapsedTime * speed)
        gpgpu.setUniform('positions', 'uCurlFreq', THREE.MathUtils.lerp(gpgpu.getUniform('positions', 'uCurlFreq').value, curl, 0.1))

        gpgpu.compute()

        renderMat.uniforms.positions.value = gpgpu.getCurrentRenderTarget('positions')
        renderMat.uniforms.uTime.value = state.clock.elapsedTime
        renderMat.uniforms.uFocus.value = THREE.MathUtils.lerp(renderMat.uniforms.uFocus.value, focus, 0.1)
        renderMat.uniforms.uFov.value = THREE.MathUtils.lerp(renderMat.uniforms.uFov.value, fov, 0.1)
        renderMat.uniforms.uBlur.value = THREE.MathUtils.lerp(renderMat.uniforms.uBlur.value, (5.6 - aperture) * 9, 0.1)
    })

    return (<>
        {/* The result of which is forwarded into a pointcloud via data-texture */}
        <points {...props} material={renderMat}>
            <bufferGeometry ref={geoRef}>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
        </points>
    </>)
}