import { WebGLRenderer } from 'three';
import { Sprite } from '../entities/Sprite';
import { BatchManager } from './BatchManager';
import { RenderStats } from './RenderStats';

/**
 * Renderer class responsible for efficient rendering of game objects
 * using batch rendering techniques for improved performance.
 */
export class Renderer {
    private readonly gl: WebGLRenderer;
    private readonly batchManager: BatchManager;
    private readonly stats: RenderStats;
    private readonly MAX_BATCH_SIZE = 1000; // Maximum sprites per batch
    
    /**
     * Creates a new Renderer instance
     * @param canvas - The canvas element to render to
     * @param width - Canvas width
     * @param height - Canvas height
     */
    constructor(canvas: HTMLCanvasElement, width: number, height: number) {
        try {
            this.gl = new WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true
            });
            this.gl.setSize(width, height);
            this.batchManager = new BatchManager(this.MAX_BATCH_SIZE);
            this.stats = new RenderStats();
        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            throw new Error('Renderer initialization failed');
        }
    }

    /**
     * Begins a new render batch
     */
    public beginBatch(): void {
        try {
            this.batchManager.begin();
            this.stats.beginFrame();
        } catch (error) {
            console.error('Error beginning batch:', error);
        }
    }

    /**
     * Adds a sprite to the current batch
     * @param sprite - The sprite to render
     */
    public drawSprite(sprite: Sprite): void {
        try {
            if (this.batchManager.wouldExceedBatchSize()) {
                this.flush();
            }
            
            this.batchManager.addSprite(sprite);
            this.stats.incrementSpriteCount();
        } catch (error) {
            console.error('Error drawing sprite:', error);
        }
    }

    /**
     * Flushes the current batch to the GPU
     */
    public flush(): void {
        try {
            if (this.batchManager.getCurrentBatchSize() > 0) {
                this.batchManager.flush(this.gl);
                this.stats.incrementBatchCount();
            }
        } catch (error) {
            console.error('Error flushing batch:', error);
        }
    }

    /**
     * Ends the current render batch and displays the frame
     */
    public endBatch(): void {
        try {
            this.flush();
            this.gl.render();
            this.stats.endFrame();
        } catch (error) {
            console.error('Error ending batch:', error);
        }
    }

    /**
     * Resizes the renderer
     * @param width - New width
     * @param height - New height
     */
    public resize(width: number, height: number): void {
        try {
            this.gl.setSize(width, height);
        } catch (error) {
            console.error('Error resizing renderer:', error);
        }
    }

    /**
     * Gets the current render statistics
     * @returns Current render statistics
     */
    public getStats(): RenderStats {
        return this.stats;
    }

    /**
     * Cleans up renderer resources
     */
    public dispose(): void {
        try {
            this.batchManager.dispose();
            this.gl.dispose();
        } catch (error) {
            console.error('Error disposing renderer:', error);
        }
    }
}