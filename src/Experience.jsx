import { OrbitControls } from "@react-three/drei";

export default function Experience() {
    return <>

        <OrbitControls makeDefault />
        
        <mesh>
            <torusGeometry />
            <meshStandardMaterial />
        </mesh>
    </>
}