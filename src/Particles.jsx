import * as THREE from 'three'
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import './shaders/simulationMaterial'
import './shaders/dofPointsMaterial'
import FBOCompute from './r3f-gist/gpgpu/FBOCompute';
import SimulationMaterial from './shaders/simulationMaterial';
import DofPointsMaterial from './shaders/dofPointsMaterial';

export default function Particles({ speed, fov, aperture, focus, curl, size = 512, ...props }) {
    const fbo = useRef()
    const geoRef = useRef()
    const simMat = new SimulationMaterial(size, size);
    const renderMat = new DofPointsMaterial()

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

    useFrame((state) => {
        fbo.current.update(state)
        simMat.uniforms.uTime.value = state.clock.elapsedTime * speed
        simMat.uniforms.uCurlFreq.value = THREE.MathUtils.lerp(simMat.uniforms.uCurlFreq.value, curl, 0.1)

        renderMat.uniforms.positions.value = fbo.current.getTarget()
        renderMat.uniforms.uTime.value = state.clock.elapsedTime
        renderMat.uniforms.uFocus.value = THREE.MathUtils.lerp(renderMat.uniforms.uFocus.value, focus, 0.1)
        renderMat.uniforms.uFov.value = THREE.MathUtils.lerp(renderMat.uniforms.uFov.value, fov, 0.1)
        renderMat.uniforms.uBlur.value = THREE.MathUtils.lerp(renderMat.uniforms.uBlur.value, (5.6 - aperture) * 9, 0.1)
    })

    return (<>
        <FBOCompute ref={fbo} width={size} height={size} simMat={simMat} />

        {/* The result of which is forwarded into a pointcloud via data-texture */}
        <points {...props} material={renderMat}>
            <bufferGeometry ref={geoRef}>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
        </points>
    </>)
}