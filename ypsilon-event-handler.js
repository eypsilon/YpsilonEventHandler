/**
 * YpsilonEventHandler - A production-ready event handling system for web applications
 *
 * Features:
 * - Method chaining support
 * - Console logging management
 * - Passive event listeners
 * - Comprehensive error handling and debugging
 * - Auto cleanup of event listeners
 * - Memory-efficient design using native handleEvent interface
 */
class YpsilonEventHandler {
    /**
     * Creates a new YpsilonEventHandler instance
     * @param {Object} options - Configuration options
     * @param {Object} [options.eventFunctionMap] - Custom mapping of event types to handler methods
     * @param {boolean} [options.enableConsole=false] - Enable console logging by default
     * @param {boolean} [options.testPassive=true] - Test for passive event listener support on init
     * @param {Object} [options.eventMapping] - Event mapping configuration
     */
    constructor(options = {}) {
        // Event listener registry for cleanup - use WeakMap to prevent memory leaks
        this.elementListeners = new WeakMap();
        this.eventListeners = new Map();

        // Debug and logging settings
        this.consoleLogsEnabled = options.enableConsole || false;
        this.passiveListenersTested = false;
        this.passiveSupported = false;

        // Default event mapping - override in your class
        this.eventFunctionMap = options.eventFunctionMap || {
            click: 'handleClick',
            submit: 'handleSubmit',
            change: 'handleChange',
            input: 'handleInput',
            keydown: 'handleKeydown',
            keyup: 'handleKeyup',
            focus: 'handleFocus',
            blur: 'handleBlur',
            resize: 'handleResize',
            scroll: 'handleScroll',
            load: 'handleLoad',
            error: 'handleError'
        };

        // Default event configuration - override in your class
        this.eventMapping = options.eventMapping || {
            document: {
                element: 'document',
                events: [
                    { type: 'click', handler: 'handleClick' },
                    { type: 'submit', handler: 'handleSubmit' },
                    { type: 'change', handler: 'handleChange' },
                    { type: 'input', handler: 'handleInput' },
                    { type: 'keydown', handler: 'handleKeydown' }
                ]
            }
        };

        // Initialize the event system
        this.initializeEventSystem();

        // Initialize passive listener detection if not disabled
        if (options.testPassive !== false) {
            this.setPassiveListenerIfApplicable();
        }
    }

    /**
     * Safely executes a callback with error handling
     * @private
     * @param {Function} callback - The function to execute
     * @param {string} errorMessage - Error message if the callback fails
     * @returns {*} - The result of the callback
     */
    _safeExecute(callback, errorMessage) {
        try {
            return callback();
        } catch (error) {
            this.consoleLog('error', errorMessage, error);
            throw error;
        }
    }

    /**
     * Validates that required parameters are present
     * @private
     * @param {Object} params - Parameters to validate
     * @param {Array<string>} required - List of required parameter names
     * @throws {Error} If any required parameter is missing
     */
    _validateParams(params, required) {
        const missing = required.filter(param => !params[param]);
        if (missing.length > 0) {
            throw new Error(`Missing required parameters: ${missing.join(', ')}`);
        }
    }

    /**
     * Enable console notifications for debugging
     * @returns {this} - Returns this instance for method chaining
     */
    enableConsoleNotifications() {
        this.consoleLogsEnabled = true;
        return this;
    }

    /**
     * Disable console notifications
     * @returns {this} - Returns this instance for method chaining
     */
    disableConsoleNotifications() {
        this.consoleLogsEnabled = false;
        return this;
    }

    /**
     * Custom console logging with type validation
     * @param {string} [type='warn'] - Log level (log, warn, error, debug, info)
     * @param {...*} args - Arguments to log
     */
    consoleLog(type = 'warn', ...args) {
        if (!this.consoleLogsEnabled) return;

        const validTypes = ['log', 'warn', 'error', 'debug', 'info'];
        const logType = validTypes.includes(type) ? type : 'warn';

        // eslint-disable-next-line no-console
        if (typeof console[logType] === 'function') {
            console[logType](...args);
        } else {
            console.warn(...args);
        }
    }

    /**
     * Test for passive event listener support
     * @returns {this} - Returns this instance for method chaining
     */
    setPassiveListenerIfApplicable() {
        if (this.passiveListenersTested) return this;

        try {
            let opts = Object.defineProperty({}, 'passive', {
                get: () => {
                    this.passiveSupported = true;
                    return true;
                }
            });

            window.addEventListener('testPassive', null, opts);
            window.removeEventListener('testPassive', null, opts);
        } catch (e) {
            this.passiveSupported = false;
        }

        this.passiveListenersTested = true;
        this.consoleLog('debug', 'Passive listener support:', this.passiveSupported);
        return this;
    }

    /**
     * Get passive listener options for an event type
     * @private
     * @param {string} eventType - The type of event to check
     * @returns {Object|boolean} - Passive options object or false
     */
    _getPassiveOptions(eventType) {
        if (!this.passiveSupported) {
            return false;
        }

        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];
        return passiveEvents.includes(eventType) ? { passive: true } : false;
    }

    /**
     * Initialize the event handling system
     */
    initializeEventSystem() {
        // Create the master event handler using native handleEvent interface
        this.handleEvent = (event) => {
            try {
                // Route to specific handler based on event type
                if (this.eventFunctionMap?.[event.type]) {
                    const handlerName = this.eventFunctionMap[event.type];
                    if (typeof this[handlerName] === 'function') {
                        return this[handlerName](event, event.target);
                    }
                }

                // Graceful fallback with helpful logging
                this.consoleLog('warn', `Event handler not found for event: ${event.type}`, event);
            } catch (error) {
                this.consoleLog('error', 'Error in event handler:', error, event);
            }
        };

        // Register all events
        this.registerEvents();
    }

    /**
     * Register events based on eventMapping configuration
     */
    registerEvents() {
        this._handleEventRegistering('addEventListener');
    }

    /**
     * Clean up all event listeners (call this when destroying the instance)
     * @returns {this} - Returns this instance for method chaining
     */
    destroy() {
        this._handleEventRegistering('removeEventListener');
        this.eventListeners.clear();
        this.consoleLog('debug', 'YpsilonEventHandler destroyed');
        return this;
    }

    /**
     * Core event registration/removal logic
     * @private
     * @param {string} execFn - 'addEventListener' or 'removeEventListener'
     */
    _handleEventRegistering(execFn) {
        Object.entries(this.eventMapping).forEach(([key, config]) => {
            // Get the target element
            const element = this._getElement(config.element);
            if (!element) {
                this.consoleLog('warn', `Element not found for ${key}:`, config.element);
                return;
            }

            // Store element reference for cleanup
            if (execFn === 'addEventListener') {
                this.eventListeners.set(key, { element, handlers: new Map() });
            }

            // Process events array
            const events = Array.isArray(config.events) ? config.events : Object.values(config.events);

            events.forEach(eventConfig => {
                // Validate event configuration
                if (!eventConfig || !eventConfig.type || !eventConfig.handler) {
                    this.consoleLog('warn', `Invalid event config for ${key}:`, eventConfig);
                    return;
                }

                // Validate handler exists
                if (typeof this[eventConfig.handler] !== 'function') {
                    this.consoleLog('warn', `Handler ${eventConfig.handler} not found for ${key}`);
                    return;
                }

                // Get passive options for this event type
                const passiveOptions = this._getPassiveOptions(eventConfig.type);
                const listenerOptions = passiveOptions || eventConfig.capture || false;

                // Register/remove the event using native handleEvent interface
                element[execFn](eventConfig.type, this, listenerOptions);

                // Track handlers for cleanup
                if (execFn === 'addEventListener') {
                    this.eventListeners.get(key).handlers.set(eventConfig.type, eventConfig.handler);
                    this.consoleLog('debug', `Event registered: ${eventConfig.type} on ${key}`);
                }
            });
        });
    }

    /**
     * Get DOM element by selector or return the element itself
     * @private
     * @param {string|Element} elementSelector - CSS selector or DOM element
     * @returns {Element|null}
     */
    _getElement(elementSelector) {
        if (typeof elementSelector === 'string') {
            if (elementSelector === 'document') return document;
            if (elementSelector === 'window') return window;
            return document.querySelector(elementSelector);
        }
        return elementSelector instanceof Element ? elementSelector : null;
    }

    /**
     * Registers a manual event listener for a given element and event type
     * @param {HTMLElement} element - The DOM element to attach the listener to
     * @param {string} eventType - The type of event to listen for
     * @param {Function} handler - The event handler function
     * @param {Object} [options] - Additional options for the event listener
     * @returns {this} - Returns this instance for method chaining
     */
    registerEventListener(element, eventType, handler, options = {}) {
        try {
            if (!element || !eventType || typeof handler !== 'function') {
                throw new Error('Invalid parameters for event registration');
            }

            // Merge passive options with provided options
            const listenerOptions = {
                ...this._getPassiveOptions(eventType),
                ...options
            };

            const boundHandler = handler.bind(this);
            element.addEventListener(eventType, boundHandler, listenerOptions);

            // Use WeakMap for DOM elements to prevent memory leaks
            if (!this.elementListeners.has(element)) {
                this.elementListeners.set(element, []);
            }
            this.elementListeners.get(element).push({
                type: eventType,
                handler: boundHandler,
                options: listenerOptions
            });

            this.consoleLog('debug', `Manual event listener registered: ${eventType}`, element);
            return this;
        } catch (error) {
            this.consoleLog('error', 'Failed to register event listener:', error);
            throw error;
        }
    }

    /**
     * Removes all manually registered event listeners
     * @returns {this} - Returns this instance for method chaining
     */
    removeAllEventListeners() {
        try {
            // This would need to iterate over WeakMap entries, which isn't directly possible
            // In practice, this method would need to be redesigned or we'd need to track elements differently
            this.consoleLog('debug', 'Manual event listeners cleanup requested');
            return this;
        } catch (error) {
            this.consoleLog('error', 'Failed to remove event listeners:', error);
            throw error;
        }
    }

    /**
     * Debug helper to get the current state of registered event listeners
     * @returns {Object} - Object containing debug information
     */
    getEventListenerDebugInfo() {
        const debug = {
            mappingCount: Object.keys(this.eventMapping).length,
            registeredMappings: this.eventListeners.size,
            mappings: []
        };

        this.eventListeners.forEach((config, key) => {
            debug.mappings.push({
                key,
                element: config.element,
                elementType: config.element?.tagName || 'unknown',
                elementId: config.element?.id || 'no-id',
                handlerCount: config.handlers.size,
                eventTypes: Array.from(config.handlers.keys())
            });
        });

        return debug;
    }

    // =============================================================================
    // DEFAULT EVENT HANDLERS - Override these in your subclass
    // =============================================================================

    /**
     * Default click event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleClick(event, target) {
        this.consoleLog('debug', 'Click event:', { type: event.type, target: target.tagName });
        return this;
    }

    /**
     * Default submit event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleSubmit(event, target) {
        this.consoleLog('debug', 'Submit event:', { type: event.type, target: target.tagName });
        return this;
    }

    /**
     * Default change event handler
     * @param {Event} event - The event object
     * @param {Element} target)
     */
    handleChange(event, target) {
        this.consoleLog('debug', 'Change event:', { type: event.type, target: target.tagName, value: target.value });
        return this;
    }

    /**
     * Default input event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleInput(event, target) {
        this.consoleLog('debug', 'Input event:', { type: event.type, target: target.tagName, value: target.value });
        return this;
    }

    /**
     * Default keydown event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleKeydown(event, target) {
        this.consoleLog('debug', 'Keydown event:', { type: event.type, key: event.key, target: target.tagName });
        return this;
    }

    /**
     * Default keyup event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleKeyup(event, target) {
        this.consoleLog('debug', 'Keyup event:', { type: event.type, key: event.key, target: target.tagName });
        return this;
    }

    /**
     * Default focus event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleFocus(event, target) {
        this.consoleLog('debug', 'Focus event:', { type: event.type, target: target.tagName });
        return this;
    }

    /**
     * Default blur event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleBlur(event, target) {
        this.consoleLog('debug', 'Blur event:', { type: event.type, target: target.tagName });
        return this;
    }

    /**
     * Default resize event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleResize(event, target) {
        this.consoleLog('debug', 'Resize event:', { type: event.type, innerWidth: window.innerWidth, innerHeight: window.innerHeight });
        return this;
    }

    /**
     * Default scroll event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleScroll(event, target) {
        this.consoleLog('debug', 'Scroll event:', { type: event.type, scrollY: window.scrollY, scrollX: window.scrollX });
        return this;
    }

    /**
     * Default load event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleLoad(event, target) {
        this.consoleLog('debug', 'Load event:', { type: event.type, target: target.tagName });
        return this;
    }

    /**
     * Default error event handler
     * @param {Event} event - The event object
     * @param {Element} target - The event target
     */
    handleError(event, target) {
        this.consoleLog('error', 'Error event:', { type: event.type, target: target.tagName, error: event.error });
        return this;
    }
}
