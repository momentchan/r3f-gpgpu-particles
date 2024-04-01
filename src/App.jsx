import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Utilities from "./r3f-gist/utility/Utilities";
import Particles from "./Particles";
import { useControls } from "leva";

export default function App() {
    const props = useControls({
        focus: { value: 5.1, min: 3, max: 7, step: 0.01 },
        speed: { value: 100, min: 0.1, max: 100, step: 0.1 },
        aperture: { value: 1.8, min: 1, max: 5.6, step: 0.1 },
        fov: { value: 20, min: 0, max: 200 },
        curl: { value: 0.25, min: 0.01, max: 0.5, step: 0.01 }
    })

    return <>
        <Canvas
            camera={{
                fov: 25,
                position: [0, 0, 6]
            }}
            gl={{
                preserveDrawingBuffer: true,
                antialias: true,
                alpha: true
            }}
        >
            <color attach='background' args={['#181820']} />

            <OrbitControls makeDefault />

            <Particles {...props} />

            <Utilities />

        </Canvas>
    </>
}