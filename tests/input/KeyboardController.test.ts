/**
 * @file KeyboardController.test.ts
 * @description Test suite for keyboard input controller functionality
 * @module tests/input
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { KeyboardController } from '../../src/input/KeyboardController';
import { InputEvent } from '../../src/types/InputTypes';

describe('KeyboardController', () => {
    let keyboardController: KeyboardController;
    
    // Mock event handlers
    const mockKeyDownHandler = jest.fn();
    const mockKeyUpHandler = jest.fn();

    beforeEach(() => {
        // Reset mocks and create fresh instance before each test
        jest.clearAllMocks();
        keyboardController = new KeyboardController();
        keyboardController.init();
    });

    afterEach(() => {
        // Clean up event listeners after each test
        keyboardController.dispose();
    });

    describe('Initialization', () => {
        test('should initialize without errors', () => {
            expect(() => new KeyboardController()).not.toThrow();
        });

        test('should attach event listeners on init', () => {
            const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
            keyboardController.init();
            
            expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
        });
    });

    describe('Event Handling', () => {
        test('should handle keydown events', () => {
            keyboardController.addEventListener('keydown', mockKeyDownHandler);
            
            // Simulate keydown event
            const keydownEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            window.dispatchEvent(keydownEvent);

            expect(mockKeyDownHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'keydown',
                    key: 'ArrowRight'
                })
            );
        });

        test('should handle keyup events', () => {
            keyboardController.addEventListener('keyup', mockKeyUpHandler);
            
            // Simulate keyup event
            const keyupEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
            window.dispatchEvent(keyupEvent);

            expect(mockKeyUpHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'keyup',
                    key: 'ArrowLeft'
                })
            );
        });

        test('should prevent default behavior for game control keys', () => {
            const preventDefault = jest.fn();
            const keydownEvent = new KeyboardEvent('keydown', {
                key: 'ArrowUp',
                preventDefault
            });

            window.dispatchEvent(keydownEvent);
            expect(preventDefault).toHaveBeenCalled();
        });
    });

    describe('Event Listener Management', () => {
        test('should add and remove event listeners correctly', () => {
            const handler = jest.fn();
            
            // Add listener
            keyboardController.addEventListener('keydown', handler);
            const keydownEvent = new KeyboardEvent('keydown', { key: 'Space' });
            window.dispatchEvent(keydownEvent);
            expect(handler).toHaveBeenCalledTimes(1);

            // Remove listener
            keyboardController.removeEventListener('keydown', handler);
            window.dispatchEvent(keydownEvent);
            expect(handler).toHaveBeenCalledTimes(1); // Should not increase
        });

        test('should handle multiple listeners for same event', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            keyboardController.addEventListener('keydown', handler1);
            keyboardController.addEventListener('keydown', handler2);

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            window.dispatchEvent(event);

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid event types gracefully', () => {
            expect(() => {
                keyboardController.addEventListener('invalid' as any, jest.fn());
            }).toThrow('Invalid event type');
        });

        test('should handle duplicate event listener registration', () => {
            const handler = jest.fn();
            
            keyboardController.addEventListener('keydown', handler);
            keyboardController.addEventListener('keydown', handler);

            const event = new KeyboardEvent('keydown', { key: 'A' });
            window.dispatchEvent(event);

            expect(handler).toHaveBeenCalledTimes(1); // Should only be called once
        });
    });

    describe('Cleanup', () => {
        test('should remove all event listeners on dispose', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            
            keyboardController.dispose();

            expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
        });

        test('should clear all registered handlers on dispose', () => {
            const handler = jest.fn();
            keyboardController.addEventListener('keydown', handler);
            
            keyboardController.dispose();

            const event = new KeyboardEvent('keydown', { key: 'Space' });
            window.dispatchEvent(event);
            
            expect(handler).not.toHaveBeenCalled();
        });
    });
});