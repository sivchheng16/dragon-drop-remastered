import dragonImg from '../assets/images/dragon.png';
import wallImg from '../assets/images/wall.png';
import foodImg from '../assets/images/food.png';
import skyImg from '../assets/images/sky.png';
import grassImg from '../assets/images/grass.png';
import stoneFloorImg from '../assets/images/stone_floor.png';
import stoneWallImg from '../assets/images/stone_wall.png';
import cloudImg from '../assets/images/cloud.png';
import lavaImg from '../assets/images/lava.png';
import obsidianFloorImg from '../assets/images/obsidian_floor.png';
import obsidianWallImg from '../assets/images/obsidian_wall.png';
import crackedFloorImg from '../assets/images/cracked_floor.png';
import goldFloorImg from '../assets/images/gold_floor.png';
import knightImg from '../assets/images/knight.png';
import wingsImg from '../assets/images/wings.png';

export const ASSET_MANIFEST = {
    dragon: dragonImg,
    wall: wallImg,
    food: foodImg,
    sky: skyImg,
    grass: grassImg,
    stoneFloor: stoneFloorImg,
    stoneWall: stoneWallImg,
    cloud: cloudImg,
    lava: lavaImg,
    obsidianFloor: obsidianFloorImg,
    obsidianWall: obsidianWallImg,
    crackedFloor: crackedFloorImg,
    goldFloor: goldFloorImg,
    knight: knightImg,
    wings: wingsImg,
};

export type AssetKey = keyof typeof ASSET_MANIFEST;

export class AssetLoader {
    private static instance: AssetLoader;
    private assets: Map<AssetKey, HTMLImageElement> = new Map();
    private totalAssets = 0;
    private loadedAssets = 0;

    private constructor() { }

    public static getInstance(): AssetLoader {
        if (!AssetLoader.instance) {
            AssetLoader.instance = new AssetLoader();
        }
        return AssetLoader.instance;
    }

    public async loadAll(onProgress: (progress: number) => void): Promise<void> {
        this.assets.clear();
        this.loadedAssets = 0;
        const keys = Object.keys(ASSET_MANIFEST) as AssetKey[];
        this.totalAssets = keys.length;

        const promises = keys.map(key => this.loadImage(key, ASSET_MANIFEST[key], onProgress));

        await Promise.all(promises);
    }

    private loadImage(key: AssetKey, src: string, onProgress: (progress: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.assets.set(key, img);
                this.loadedAssets++;
                onProgress(this.loadedAssets / this.totalAssets);
                resolve();
            };
            img.onerror = (e) => {
                console.error(`Failed to load asset: ${src}`, e);
                // Resolve anyway to not block game, maybe set a fallback or ignore
                resolve();
            };
        });
    }

    public get(key: AssetKey): HTMLImageElement {
        const img = this.assets.get(key);
        if (!img) {
            console.warn(`Asset not found: ${key}, returning empty image`);
            return new Image();
        }
        return img;
    }
}
