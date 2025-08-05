/**
 * @file TouchController.test.ts
 * @description Test suite for touch input controller functionality
 * @module tests/input
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { TouchController } from '../../src/input/TouchController';
import { Vector2 } from '../../src/math/Vector2';
import { TouchEvent } from '../../src/types/InputTypes';

describe('TouchController', () => {
    let touchController: TouchController;
    let mockTouchEvent: TouchEvent;

    beforeEach(() => {
        // Reset the controller instance before each test
        touchController = new TouchController();
        
        // Mock touch event data
        mockTouchEvent = {
            touches: [{
                identifier: 0,
                clientX: 100,
                clientY: 100,
                target: document.createElement('div')
            }],
            preventDefault: jest.fn(),
            stopPropagation: jest.fn()
        } as unknown as TouchEvent;
    });

    describe('Initialization', () => {
        test('should create instance with default values', () => {
            expect(touchController).toBeDefined();
            expect(touchController.isActive).toBeFalsy();
            expect(touchController.touchPosition).toEqual(new Vector2(0, 0));
        });
    });

    describe('Touch Event Handling', () => {
        test('should handle touch start event', () => {
            touchController.handleTouchStart(mockTouchEvent);
            
            expect(touchController.isActive).toBeTruthy();
            expect(touchController.touchPosition).toEqual(
                new Vector2(mockTouchEvent.touches[0].clientX, mockTouchEvent.touches[0].clientY)
            );
            expect(mockTouchEvent.preventDefault).toHaveBeenCalled();
        });

        test('should handle touch move event', () => {
            // First activate the controller
            touchController.handleTouchStart(mockTouchEvent);

            // Create mock move event
            const mockMoveEvent = {
                ...mockTouchEvent,
                touches: [{
                    ...mockTouchEvent.touches[0],
                    clientX: 150,
                    clientY: 150
                }]
            } as unknown as TouchEvent;

            touchController.handleTouchMove(mockMoveEvent);

            expect(touchController.touchPosition).toEqual(new Vector2(150, 150));
            expect(mockMoveEvent.preventDefault).toHaveBeenCalled();
        });

        test('should handle touch end event', () => {
            touchController.handleTouchStart(mockTouchEvent);
            touchController.handleTouchEnd(mockTouchEvent);

            expect(touchController.isActive).toBeFalsy();
            expect(touchController.touchPosition).toEqual(new Vector2(0, 0));
            expect(mockTouchEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle multiple touches', () => {
            const multiTouchEvent = {
                touches: [
                    { identifier: 0, clientX: 100, clientY: 100 },
                    { identifier: 1, clientX: 200, clientY: 200 }
                ],
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            } as unknown as TouchEvent;

            touchController.handleTouchStart(multiTouchEvent);
            // Should only track the first touch
            expect(touchController.touchPosition).toEqual(new Vector2(100, 100));
        });

        test('should handle touch events outside bounds', () => {
            const outOfBoundsEvent = {
                touches: [{
                    identifier: 0,
                    clientX: -100,
                    clientY: -100
                }],
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            } as unknown as TouchEvent;

            touchController.handleTouchStart(outOfBoundsEvent);
            expect(touchController.touchPosition).toEqual(new Vector2(-100, -100));
        });

        test('should handle empty touch events', () => {
            const emptyTouchEvent = {
                touches: [],
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            } as unknown as TouchEvent;

            touchController.handleTouchStart(emptyTouchEvent);
            expect(touchController.isActive).toBeFalsy();
            expect(touchController.touchPosition).toEqual(new Vector2(0, 0));
        });
    });

    describe('Touch Position Calculations', () => {
        test('should calculate delta movement correctly', () => {
            touchController.handleTouchStart(mockTouchEvent);
            
            const initialPosition = touchController.touchPosition.clone();
            
            const moveEvent = {
                ...mockTouchEvent,
                touches: [{
                    ...mockTouchEvent.touches[0],
                    clientX: 150,
                    clientY: 150
                }]
            } as unknown as TouchEvent;

            touchController.handleTouchMove(moveEvent);
            
            const delta = touchController.getDelta();
            expect(delta.x).toBe(50);
            expect(delta.y).toBe(50);
        });

        test('should normalize touch coordinates correctly', () => {
            const normalizedPosition = touchController.getNormalizedPosition();
            expect(normalizedPosition.x).toBeGreaterThanOrEqual(-1);
            expect(normalizedPosition.x).toBeLessThanOrEqual(1);
            expect(normalizedPosition.y).toBeGreaterThanOrEqual(-1);
            expect(normalizedPosition.y).toBeLessThanOrEqual(1);
        });
    });
});