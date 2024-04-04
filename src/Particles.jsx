import * as THREE from 'three'
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import './shaders/simulationMaterial'
import './shaders/dofPointsMaterial'
import FBOCompute from './r3f-gist/gpgpu/FBOCompute';

export default function Particles({ speed, fov, aperture, focus, curl, size = 512, ...props }) {
    const fbo = useRef()
    const simRef = useRef()
    const renderRef = useRef()

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
        simRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed
        simRef.current.uniforms.uCurlFreq.value = THREE.MathUtils.lerp(simRef.current.uniforms.uCurlFreq.value, curl, 0.1)

        renderRef.current.uniforms.positions.value = fbo.current.getTarget()
        renderRef.current.uniforms.uTime.value = state.clock.elapsedTime
        renderRef.current.uniforms.uFocus.value = THREE.MathUtils.lerp(renderRef.current.uniforms.uFocus.value, focus, 0.1)
        renderRef.current.uniforms.uFov.value = THREE.MathUtils.lerp(renderRef.current.uniforms.uFov.value, fov, 0.1)
        renderRef.current.uniforms.uBlur.value = THREE.MathUtils.lerp(renderRef.current.uniforms.uBlur.value, (5.6 - aperture) * 9, 0.1)
    })

    return (<>
        <FBOCompute ref={fbo} width={size} height={size}>
            <simulationMaterial width={size} height={size} ref={simRef} />
        </FBOCompute>

        {/* The result of which is forwarded into a pointcloud via data-texture */}
        <points {...props}>
            <dofPointsMaterial ref={renderRef} />
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
            </bufferGeometry>
        </points>
    </>)
}