/**
 * @file QuadTree.ts
 * @description Implements a QuadTree data structure for efficient spatial partitioning
 * and collision detection using Axis-Aligned Bounding Boxes (AABB).
 * @module engine/QuadTree
 */

// Types and interfaces
interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CollisionObject {
    id: string;
    bounds: Bounds;
}

/**
 * Configuration constants for QuadTree
 */
const CONFIG = {
    MAX_OBJECTS: 10,    // Maximum objects per node before splitting
    MAX_LEVELS: 5,      // Maximum depth of the tree
    MIN_SIZE: 16        // Minimum node size in pixels
} as const;

/**
 * QuadTree node class for spatial partitioning and collision detection
 */
export class QuadTree {
    private bounds: Bounds;
    private objects: CollisionObject[];
    private nodes: QuadTree[];
    private level: number;

    /**
     * Creates a new QuadTree node
     * @param bounds - The boundary rectangle of this node
     * @param level - The depth level of this node (0 = root)
     */
    constructor(bounds: Bounds, level: number = 0) {
        if (!this.validateBounds(bounds)) {
            throw new Error('Invalid bounds provided to QuadTree');
        }

        this.bounds = bounds;
        this.objects = [];
        this.nodes = [];
        this.level = level;
    }

    /**
     * Validates the bounds object
     * @param bounds - The bounds to validate
     * @returns boolean indicating if bounds are valid
     */
    private validateBounds(bounds: Bounds): boolean {
        return (
            bounds.width > 0 &&
            bounds.height > 0 &&
            Number.isFinite(bounds.x) &&
            Number.isFinite(bounds.y)
        );
    }

    /**
     * Clears the QuadTree, removing all objects and subnodes
     */
    public clear(): void {
        this.objects = [];
        
        for (const node of this.nodes) {
            node.clear();
        }
        this.nodes = [];
    }

    /**
     * Splits the node into four subnodes
     */
    private split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        // Don't split if resulting nodes would be too small
        if (subWidth < CONFIG.MIN_SIZE || subHeight < CONFIG.MIN_SIZE) {
            return;
        }

        this.nodes = [
            new QuadTree({ x: x, y: y, width: subWidth, height: subHeight }, this.level + 1),
            new QuadTree({ x: x + subWidth, y: y, width: subWidth, height: subHeight }, this.level + 1),
            new QuadTree({ x: x, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1),
            new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1)
        ];
    }

    /**
     * Determines which node an object belongs to
     * @param bounds - The bounds of the object to check
     * @returns Index of the node (-1 if object doesn't completely fit in a node)
     */
    private getIndex(bounds: Bounds): number {
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        const topQuadrant = bounds.y < horizontalMidpoint && bounds.y + bounds.height < horizontalMidpoint;
        const bottomQuadrant = bounds.y > horizontalMidpoint;

        if (bounds.x < verticalMidpoint && bounds.x + bounds.width < verticalMidpoint) {
            if (topQuadrant) return 0;
            if (bottomQuadrant) return 2;
        }
        else if (bounds.x > verticalMidpoint) {
            if (topQuadrant) return 1;
            if (bottomQuadrant) return 3;
        }

        return -1;
    }

    /**
     * Inserts an object into the QuadTree
     * @param object - The collision object to insert
     */
    public insert(object: CollisionObject): void {
        if (!object || !object.bounds) {
            throw new Error('Invalid object provided for insertion');
        }

        // If we have subnodes, insert the object into the appropriate subnode
        if (this.nodes.length) {
            const index = this.getIndex(object.bounds);
            
            if (index !== -1) {
                this.nodes[index].insert(object);
                return;
            }
        }

        this.objects.push(object);

        // Split if we exceed the capacity and haven't reached max levels
        if (this.objects.length > CONFIG.MAX_OBJECTS && this.level < CONFIG.MAX_LEVELS) {
            if (this.nodes.length === 0) {
                this.split();
            }

            // Redistribute existing objects
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i].bounds);
                if (index !== -1) {
                    const [object] = this.objects.splice(i, 1);
                    this.nodes[index].insert(object);
                } else {
                    i++;
                }
            }
        }
    }

    /**
     * Retrieves all objects that could collide with the given bounds
     * @param bounds - The bounds to check for potential collisions
     * @returns Array of objects that might collide with the given bounds
     */
    public retrieve(bounds: Bounds): CollisionObject[] {
        const result: CollisionObject[] = [];
        const index = this.getIndex(bounds);

        // Add objects from this level
        result.push(...this.objects);

        // If we have subnodes and the object fits in one, add objects from that node
        if (this.nodes.length) {
            if (index !== -1) {
                result.push(...this.nodes[index].retrieve(bounds));
            } else {
                // Object overlaps multiple nodes, check all
                for (const node of this.nodes) {
                    result.push(...node.retrieve(bounds));
                }
            }
        }

        return result;
    }

    /**
     * Checks if two bounds intersect (AABB collision detection)
     * @param boundsA - First bounds
     * @param boundsB - Second bounds
     * @returns boolean indicating if the bounds intersect
     */
    public static checkCollision(boundsA: Bounds, boundsB: Bounds): boolean {
        return !(
            boundsA.x + boundsA.width < boundsB.x ||
            boundsA.x > boundsB.x + boundsB.width ||
            boundsA.y + boundsA.height < boundsB.y ||
            boundsA.y > boundsB.y + boundsB.height
        );
    }
}