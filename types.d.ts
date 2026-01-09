declare module '@mkkellogg/gaussian-splats-3d' {
    import { Object3D } from 'three';

    export class DropInViewer extends Object3D {
        constructor(options?: any);
        addSplatScenes(scenes: any[], showLoadingUI?: boolean): Promise<any>;
        dispose(): void;
    }
}
