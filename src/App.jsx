import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'

export default function App() {
    return <>
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6]
            }}>

            <OrbitControls makeDefault />

            <mesh>
                <torusGeometry />
                <meshStandardMaterial />
            </mesh>

        </Canvas>
    </>
}