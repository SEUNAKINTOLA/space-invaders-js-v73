/**
 * @file Collision.ts
 * @description Implements AABB (Axis-Aligned Bounding Box) collision detection system
 * for game objects. Provides utilities for checking collisions between rectangles
 * and managing collision bounds.
 * 
 * @module engine/Collision
 * @version 1.0.0
 */

// Types and Interfaces
/**
 * Represents a 2D point in space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a bounding box for collision detection
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Result of a collision check containing detailed information
 */
export interface CollisionResult {
  colliding: boolean;
  overlap?: {
    x: number;
    y: number;
  };
  direction?: {
    horizontal: 'left' | 'right' | 'none';
    vertical: 'top' | 'bottom' | 'none';
  };
}

/**
 * Class handling collision detection operations
 */
export class CollisionSystem {
  /**
   * Checks if two bounding boxes are colliding
   * @param boxA First bounding box
   * @param boxB Second bounding box
   * @returns CollisionResult with collision details
   * @throws {Error} If invalid bounding box parameters are provided
   */
  public static checkCollision(boxA: BoundingBox, boxB: BoundingBox): CollisionResult {
    try {
      this.validateBoundingBox(boxA);
      this.validateBoundingBox(boxB);

      // Check for collision
      const colliding = !(
        boxA.x + boxA.width < boxB.x ||
        boxB.x + boxB.width < boxA.x ||
        boxA.y + boxA.height < boxB.y ||
        boxB.y + boxB.height < boxA.y
      );

      if (!colliding) {
        return { colliding: false };
      }

      // Calculate overlap
      const overlapX = Math.min(boxA.x + boxA.width, boxB.x + boxB.width) -
                      Math.max(boxA.x, boxB.x);
      const overlapY = Math.min(boxA.y + boxA.height, boxB.y + boxB.height) -
                      Math.max(boxA.y, boxB.y);

      // Determine collision direction
      const direction = {
        horizontal: this.getHorizontalDirection(boxA, boxB),
        vertical: this.getVerticalDirection(boxA, boxB)
      };

      return {
        colliding: true,
        overlap: { x: overlapX, y: overlapY },
        direction
      };
    } catch (error) {
      throw new Error(`Collision check failed: ${error.message}`);
    }
  }

  /**
   * Checks if a point is inside a bounding box
   * @param point Point to check
   * @param box Bounding box
   * @returns boolean indicating if point is inside box
   */
  public static isPointInBox(point: Point, box: BoundingBox): boolean {
    try {
      this.validatePoint(point);
      this.validateBoundingBox(box);

      return (
        point.x >= box.x &&
        point.x <= box.x + box.width &&
        point.y >= box.y &&
        point.y <= box.y + box.height
      );
    } catch (error) {
      throw new Error(`Point in box check failed: ${error.message}`);
    }
  }

  /**
   * Creates a bounding box from position and dimensions
   * @param x X coordinate
   * @param y Y coordinate
   * @param width Width of box
   * @param height Height of box
   * @returns BoundingBox object
   */
  public static createBoundingBox(
    x: number,
    y: number,
    width: number,
    height: number
  ): BoundingBox {
    if (!Number.isFinite(x) || !Number.isFinite(y) ||
        !Number.isFinite(width) || !Number.isFinite(height)) {
      throw new Error('Invalid parameters for bounding box creation');
    }

    if (width < 0 || height < 0) {
      throw new Error('Width and height must be positive');
    }

    return { x, y, width, height };
  }

  private static validateBoundingBox(box: BoundingBox): void {
    if (!box || typeof box !== 'object') {
      throw new Error('Invalid bounding box object');
    }

    if (!Number.isFinite(box.x) || !Number.isFinite(box.y) ||
        !Number.isFinite(box.width) || !Number.isFinite(box.height)) {
      throw new Error('Bounding box contains invalid numbers');
    }

    if (box.width < 0 || box.height < 0) {
      throw new Error('Bounding box dimensions must be positive');
    }
  }

  private static validatePoint(point: Point): void {
    if (!point || typeof point !== 'object') {
      throw new Error('Invalid point object');
    }

    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new Error('Point contains invalid coordinates');
    }
  }

  private static getHorizontalDirection(boxA: BoundingBox, boxB: BoundingBox): 'left' | 'right' | 'none' {
    const centerA = boxA.x + boxA.width / 2;
    const centerB = boxB.x + boxB.width / 2;
    
    if (Math.abs(centerA - centerB) < 0.1) return 'none';
    return centerA < centerB ? 'right' : 'left';
  }

  private static getVerticalDirection(boxA: BoundingBox, boxB: BoundingBox): 'top' | 'bottom' | 'none' {
    const centerA = boxA.y + boxA.height / 2;
    const centerB = boxB.y + boxB.height / 2;
    
    if (Math.abs(centerA - centerB) < 0.1) return 'none';
    return centerA < centerB ? 'bottom' : 'top';
  }
}