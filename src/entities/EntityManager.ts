import { Entity } from './Entity';
import { Vector2D } from '../types/Vector2D';
import { QueryableEntityMap } from '../types/QueryableEntityMap';
import { EntityType } from '../types/EntityType';
import { Performance } from '../utils/Performance';

/**
 * Manages game entities with optimized performance for large-scale entity handling
 */
export class EntityManager {
    private entities: Map<string, Entity>;
    private spatialHash: Map<string, Set<string>>;
    private readonly CELL_SIZE: number = 100; // Size of spatial partitioning cells
    private entityTypeCache: Map<EntityType, Set<string>>;
    private updateQueue: Set<string>;
    private perfMonitor: Performance;

    constructor() {
        this.entities = new Map();
        this.spatialHash = new Map();
        this.entityTypeCache = new Map();
        this.updateQueue = new Set();
        this.perfMonitor = new Performance();
    }

    /**
     * Adds an entity to the manager
     * @param entity Entity to add
     * @throws Error if entity with same ID already exists
     */
    public addEntity(entity: Entity): void {
        if (this.entities.has(entity.id)) {
            throw new Error(`Entity with ID ${entity.id} already exists`);
        }

        this.entities.set(entity.id, entity);
        this.addToSpatialHash(entity);
        this.updateEntityTypeCache(entity);
        this.updateQueue.add(entity.id);
    }

    /**
     * Removes an entity from the manager
     * @param entityId ID of entity to remove
     */
    public removeEntity(entityId: string): void {
        const entity = this.entities.get(entityId);
        if (!entity) return;

        this.removeFromSpatialHash(entity);
        this.removeFromEntityTypeCache(entity);
        this.entities.delete(entityId);
        this.updateQueue.delete(entityId);
    }

    /**
     * Updates all entities efficiently using spatial partitioning
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        this.perfMonitor.startMeasurement('entityUpdate');

        // Process only entities that need updates
        for (const entityId of this.updateQueue) {
            const entity = this.entities.get(entityId);
            if (!entity) continue;

            const oldPosition = { ...entity.position };
            entity.update(deltaTime);

            // Update spatial hash only if position changed
            if (this.hasPositionChanged(oldPosition, entity.position)) {
                this.updateEntityPosition(entity, oldPosition);
            }
        }

        this.perfMonitor.endMeasurement('entityUpdate');
    }

    /**
     * Queries entities within a specified radius
     * @param position Center position for query
     * @param radius Radius to search within
     * @returns Array of entities within radius
     */
    public queryRadius(position: Vector2D, radius: number): Entity[] {
        const cellsToCheck = this.getCellsInRadius(position, radius);
        const nearbyEntities = new Set<Entity>();

        for (const cell of cellsToCheck) {
            const entitiesInCell = this.spatialHash.get(cell);
            if (!entitiesInCell) continue;

            for (const entityId of entitiesInCell) {
                const entity = this.entities.get(entityId);
                if (!entity) continue;

                if (this.isWithinRadius(position, entity.position, radius)) {
                    nearbyEntities.add(entity);
                }
            }
        }

        return Array.from(nearbyEntities);
    }

    /**
     * Gets all entities of a specific type
     * @param type Entity type to query
     * @returns Array of entities of specified type
     */
    public getEntitiesByType(type: EntityType): Entity[] {
        const entityIds = this.entityTypeCache.get(type);
        if (!entityIds) return [];

        return Array.from(entityIds)
            .map(id => this.entities.get(id))
            .filter((entity): entity is Entity => entity !== undefined);
    }

    private addToSpatialHash(entity: Entity): void {
        const cell = this.getCellKey(entity.position);
        if (!this.spatialHash.has(cell)) {
            this.spatialHash.set(cell, new Set());
        }
        this.spatialHash.get(cell)?.add(entity.id);
    }

    private removeFromSpatialHash(entity: Entity): void {
        const cell = this.getCellKey(entity.position);
        this.spatialHash.get(cell)?.delete(entity.id);
    }

    private updateEntityPosition(entity: Entity, oldPosition: Vector2D): void {
        const oldCell = this.getCellKey(oldPosition);
        const newCell = this.getCellKey(entity.position);

        if (oldCell !== newCell) {
            this.spatialHash.get(oldCell)?.delete(entity.id);
            this.addToSpatialHash(entity);
        }
    }

    private updateEntityTypeCache(entity: Entity): void {
        if (!this.entityTypeCache.has(entity.type)) {
            this.entityTypeCache.set(entity.type, new Set());
        }
        this.entityTypeCache.get(entity.type)?.add(entity.id);
    }

    private removeFromEntityTypeCache(entity: Entity): void {
        this.entityTypeCache.get(entity.type)?.delete(entity.id);
    }

    private getCellKey(position: Vector2D): string {
        const x = Math.floor(position.x / this.CELL_SIZE);
        const y = Math.floor(position.y / this.CELL_SIZE);
        return `${x},${y}`;
    }

    private getCellsInRadius(position: Vector2D, radius: number): string[] {
        const cells: string[] = [];
        const cellRadius = Math.ceil(radius / this.CELL_SIZE);

        const centerX = Math.floor(position.x / this.CELL_SIZE);
        const centerY = Math.floor(position.y / this.CELL_SIZE);

        for (let x = -cellRadius; x <= cellRadius; x++) {
            for (let y = -cellRadius; y <= cellRadius; y++) {
                cells.push(`${centerX + x},${centerY + y}`);
            }
        }

        return cells;
    }

    private isWithinRadius(pos1: Vector2D, pos2: Vector2D, radius: number): boolean {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return (dx * dx + dy * dy) <= radius * radius;
    }

    private hasPositionChanged(pos1: Vector2D, pos2: Vector2D): boolean {
        return pos1.x !== pos2.x || pos1.y !== pos2.y;
    }

    /**
     * Gets performance metrics for the entity manager
     * @returns Object containing performance metrics
     */
    public getPerformanceMetrics() {
        return this.perfMonitor.getMetrics();
    }
}