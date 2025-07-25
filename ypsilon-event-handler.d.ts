/**
 * YpsilonEventHandler - Revolutionary multi-handler event system
 * TypeScript definitions for the methods and features we actually use
 */

/**
 * Event configuration object - supports throttling, debouncing, and custom handlers
 */
export interface EventConfig {
    /** Event type like 'click', 'scroll', 'input' */
    type: string;
    /** Custom handler method name (optional - defaults to handleClick, handleScroll, etc.) */
    handler?: string;
    /** Throttle high-frequency events (milliseconds) */
    throttle?: number;
    /** Debounce rapid-fire events (milliseconds) */
    debounce?: number;
    /** Native addEventListener options */
    options?: AddEventListenerOptions;
}

/**
 * Event mapping - CSS selectors to event arrays
 * Example: { 'body': ['click'], '.modal': [{ type: 'click', handler: 'handleModalClick' }] }
 */
export interface EventMapping {
    [selector: string]: (string | EventConfig)[];
}

/**
 * Methods object for external handler definitions (Vue.js style)
 */
export interface Methods {
    [methodName: string]: (this: YpsilonEventHandler, event: Event, target: EventTarget | null) => void;
}

/**
 * Handler configuration - the powerful options we actually use
 */
export interface HandlerConfig {
    /** Enable performance tracking (default: false) */
    enableStats?: boolean;
    /** External methods object for clean code organization */
    methods?: Methods | null;
    /** Enable global window fallback for missing handlers */
    enableGlobalFallback?: boolean;
    /** Prioritize methods object over class methods (default: false) */
    methodsFirst?: boolean;
}

/**
 * Event handler method signatures for IntelliSense support
 */
export interface EventHandlerMethods {
    /** Handle click events - most common handler */
    handleClick?(event: MouseEvent, target: EventTarget | null): void;
    /** Handle form input changes */
    handleInput?(event: InputEvent, target: EventTarget | null): void;
    /** Handle form submissions */
    handleSubmit?(event: SubmitEvent, target: EventTarget | null): void;
    /** Handle keyboard input */
    handleKeydown?(event: KeyboardEvent, target: EventTarget | null): void;
    /** Handle scroll events (auto-throttled) */
    handleScroll?(event: Event, target: EventTarget | null): void;
    /** Handle window/element resize (auto-throttled) */
    handleResize?(event: UIEvent, target: EventTarget | null): void;
    /** Handle form field focus */
    handleFocus?(event: FocusEvent, target: EventTarget | null): void;
    /** Handle form field blur */
    handleBlur?(event: FocusEvent, target: EventTarget | null): void;
}

/**
 * YpsilonEventHandler - The revolutionary multi-handler system
 * 
 * Core Features:
 * - Multiple handlers per event type with closest-match DOM resolution
 * - Convention-based routing (click → handleClick)
 * - Custom event dispatch with this.dispatch()
 * - Built-in throttling/debouncing
 * - Zero memory leaks with automatic cleanup
 */
export declare class YpsilonEventHandler implements Partial<EventHandlerMethods> {
    /**
     * Create the event handler with intelligent configuration
     * @param eventMapping - Map CSS selectors to events: { 'body': ['click'], '.modal': ['scroll'] }
     * @param aliases - Method aliases: { 'btn': 'handleButton' }
     * @param config - Advanced options for methods, global fallback, etc.
     */
    constructor(
        eventMapping?: EventMapping,
        aliases?: Record<string, string>,
        config?: HandlerConfig
    );

    /**
     * Native handleEvent interface - called automatically by browser
     * Features closest-match resolution when multiple handlers exist
     */
    handleEvent(event: Event): void;

    /**
     * Dispatch custom events with data payload
     * @param type - Custom event name
     * @param detail - Data to send with event
     * @param target - Where to dispatch (default: document)
     * @returns this for chaining
     * 
     * Usage: this.dispatch('userAction', { userId: 123 });
     * Calls: handleUseraction(event, target) automatically
     */
    dispatch(type: string, detail?: any, target?: EventTarget): this;

    /**
     * Register all configured event listeners
     * Called automatically in constructor
     */
    registerEvents(): void;

    /**
     * Clean up ALL event listeners and prevent memory leaks
     * Essential when dynamically creating/destroying handlers
     */
    destroy(): void;

    /**
     * Check if user has meaningfully interacted with page
     * Useful for performance optimizations and analytics
     */
    hasUserInteracted(): boolean;

    // Handler methods are inherited from EventHandlerMethods interface
    // Implement the ones you need: handleClick, handleInput, etc.
}

export default YpsilonEventHandler;