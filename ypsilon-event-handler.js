/**
 * YpsilonEventHandler - Ultra lightweight, extendable event handling system
 */
class YpsilonEventHandler {
    constructor(eventMapping = {}, aliases = {}, config = {}) {
        this.eventMapping = eventMapping;
        this.aliases = aliases;
        this.config = { enableStats: false, ...config };
        this.enableStats = this.config.enableStats;
        this.eventListeners = new Map();
        this.elementHandlers = new WeakMap();
        this.eventHandlerMap = new Map();
        this.passiveSupported = false;
        this.throttleTimers = new Map();
        this.debounceTimers = new Map();
        this.userHasInteracted = false;
        this.passiveEvents = [
            'scroll', 'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'wheel', 'mousewheel', 'pointermove', 'pointerenter', 'pointerleave',
            'resize', 'orientationchange', 'load', 'beforeunload', 'unload'
        ];
        this.init();
    }

    init() {
        this.detectPassiveSupport();
        this.registerEvents();
    }

    handleEvent(event) {
        this.checkUserInteraction(event);

        const handlers = this.eventHandlerMap.get(event.type);
        if (!handlers || handlers.length === 0) return;

        // Find the closest handler by checking which element is closest to event.target
        let closestHandler = null;
        let closestDistance = Infinity;

        for (const handlerInfo of handlers) {
            let isContained = false;
            let distance = 0;

            if (handlerInfo.element === document || handlerInfo.element === window) {
                // Document and window always "contain" any target
                isContained = true;
                distance = 1000; // Give them low priority (high distance)
            } else if (handlerInfo.element.contains && handlerInfo.element.contains(event.target)) {
                // Regular DOM element containment
                isContained = true;
                let current = event.target;

                while (current && current !== handlerInfo.element) {
                    distance++;
                    current = current.parentElement;
                }
            }

            if (isContained && distance < closestDistance) {
                closestDistance = distance;
                closestHandler = handlerInfo;
            }
        }

        if (closestHandler) {
            const resolvedHandler = this.resolveMethodName(closestHandler.handler, event.type);
            if (typeof this[resolvedHandler] === 'function') {
                this[resolvedHandler](event, event.target);
            }
        }
    }

    dispatch(type, detail = null, target = document) {
        target.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            detail
        }));
        return this;
    }

    detectPassiveSupport() {
        try {
            const opts = Object.defineProperty({}, 'passive', {
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
    }

    hasUserInteracted() {
        return this.userHasInteracted;
    }

    /**
     * Get comprehensive statistics about the event handler instance
     * @returns {object|null} - Statistics object with various metrics, or null if stats disabled
     */
    getStats() {
        if (!this.enableStats) {
            return null;
        }

        const configs = Array.from(this.eventListeners.values());
        const events = configs.flatMap(config => config.events);

        // Count event types
        const eventTypes = {};
        events.forEach(event => {
            eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
        });

        // Count unique elements
        const uniqueElements = new Set(configs.map(config => config.element));

        return {
            totalListeners: this.eventListeners.size,
            totalElements: uniqueElements.size,
            totalEventTypes: Object.keys(eventTypes).length,
            eventTypes,
            userHasInteracted: this.userHasInteracted,
            activeTimers: {
                throttle: this.throttleTimers.size,
                debounce: this.debounceTimers.size
            }
        };
    }

    checkUserInteraction(event) {
        // Only count real user interactions, not passive events
        if (!this.userHasInteracted && !this.passiveEvents.includes(event.type)) {
            this.userHasInteracted = true;
        }
    }

    /**
     * Resolve method name using event-type specific aliases
     * @param {string} methodName - Original method name
     * @param {string} eventType - Event type for scoped alias lookup
     * @returns {string} - Resolved method name (or original if no alias)
     */
    resolveMethodName(methodName, eventType) {
        const eventAliases = this.aliases[eventType];
        return (eventAliases && eventAliases[methodName]) || methodName;
    }

    /**
     * Dynamically add a single event listener to existing instance
     * @param {string} target - CSS selector for target element
     * @param {string|object} eventConfig - Event type string or config object
     * @returns {boolean} - True if added, false if already exists
     */
    addEvent(target, eventConfig) {
        // Normalize the event config
        const normalizedConfig = typeof eventConfig === 'string'
            ? { type: eventConfig }
            : eventConfig;

        // Check if event already exists to prevent duplicates
        if (this.hasEvent(target, normalizedConfig.type)) {
            return false; // Already exists
        }

        // Add to eventMapping
        if (!this.eventMapping[target]) {
            this.eventMapping[target] = [];
        }
        this.eventMapping[target].push(normalizedConfig);

        // Register the new event
        this.registerSingleEvent(target, normalizedConfig);

        return true; // Successfully added
    }

    /**
     * Remove a specific event listener from target
     * @param {string} target - CSS selector for target element
     * @param {string} eventType - Event type to remove
     * @returns {boolean} - True if removed, false if not found
     */
    removeEvent(target, eventType) {
        // Check if mapping exists
        if (!this.eventMapping[target]) {
            return false;
        }

        // Find and remove from eventMapping
        const initialLength = this.eventMapping[target].length;
        this.eventMapping[target] = this.eventMapping[target].filter(config => {
            const configType = typeof config === 'string' ? config : config.type;
            return configType !== eventType;
        });

        // If nothing was removed, return false
        if (this.eventMapping[target].length === initialLength) {
            return false;
        }

        // Clean up empty target
        if (this.eventMapping[target].length === 0) {
            delete this.eventMapping[target];
        }

        // Remove from internal tracking
        this.unregisterSingleEvent(target, eventType);

        return true; // Successfully removed
    }

    /**
     * Check if an event is currently registered
     * @param {string} target - CSS selector for target element
     * @param {string} eventType - Event type to check
     * @returns {boolean} - True if event exists
     */
    hasEvent(target, eventType) {
        if (!this.eventMapping[target]) {
            return false;
        }

        return this.eventMapping[target].some(config => {
            const configType = typeof config === 'string' ? config : config.type;
            return configType === eventType;
        });
    }

    /**
     * Create a wrapped handler with throttle/debounce if needed
     * @private
     */
    createWrappedHandler(eventConfig, key, eventType) {
        let handler = this;

        // Apply throttle/debounce if specified
        if (typeof eventConfig === 'object') {
            const originalHandleEvent = this.handleEvent;

            if (eventConfig.throttle) {
                handler = {
                    handleEvent: this.throttle(originalHandleEvent, eventConfig.throttle, `${key}-${eventType}-throttle`)
                };
            } else if (eventConfig.debounce) {
                handler = {
                    handleEvent: this.debounce(originalHandleEvent, eventConfig.debounce, `${key}-${eventType}-debounce`)
                };
            }
        }

        return handler;
    }

    /**
     * Clean up throttle/debounce timers for a specific event
     * @private
     */
    cleanupEventTimers(key, eventType) {
        const throttleKey = `${key}-${eventType}-throttle`;
        const debounceKey = `${key}-${eventType}-debounce`;

        if (this.throttleTimers.has(throttleKey)) {
            const timerData = this.throttleTimers.get(throttleKey);
            if (timerData.timeout) clearTimeout(timerData.timeout);
            if (timerData.trailingTimeout) clearTimeout(timerData.trailingTimeout);
            this.throttleTimers.delete(throttleKey);
        }

        if (this.debounceTimers.has(debounceKey)) {
            clearTimeout(this.debounceTimers.get(debounceKey));
            this.debounceTimers.delete(debounceKey);
        }
    }

    /**
     * Register a single event listener (internal helper)
     * @private
     */
    registerEventListener(element, eventConfig, key, selector) {
        const eventType = typeof eventConfig === 'string' ? eventConfig : eventConfig.type;
        const options = this.getEventOptions(eventConfig);
        const handler = this.createWrappedHandler(eventConfig, key, eventType);

        // Add the event listener
        element.addEventListener(eventType, handler, options);

        // Initialize tracking structures
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, { element, events: [] });
        }

        if (!this.elementHandlers.has(element)) {
            this.elementHandlers.set(element, []);
        }

        // Get handler method name
        const handlerMethod = typeof eventConfig === 'object' && eventConfig.handler
            ? eventConfig.handler
            : `handle${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

        // Resolve alias and validate handler exists
        const resolvedHandler = this.resolveMethodName(handlerMethod, eventType);
        if (typeof this[resolvedHandler] !== 'function') {
            const aliasMsg = resolvedHandler !== handlerMethod ? ` (resolved from alias '${handlerMethod}')` : '';
            console.warn(`YpsilonEventHandler: Handler method '${resolvedHandler}'${aliasMsg} not found for event '${eventType}' on element '${selector}'`);
        }

        // Store tracking info
        this.eventListeners.get(key).events.push({ type: eventType, handler, options });
        this.elementHandlers.get(element).push({ type: eventType, handler, options });

        // Update handler mapping for multi-handler support
        if (!this.eventHandlerMap.has(eventType)) {
            this.eventHandlerMap.set(eventType, []);
        }

        this.eventHandlerMap.get(eventType).push({
            element: element,
            handler: handlerMethod,
            config: eventConfig
        });
    }

    /**
     * Register a single event (internal helper)
     * @private
     */
    registerSingleEvent(selector, eventConfig) {
        const eventType = typeof eventConfig === 'string' ? eventConfig : eventConfig.type;
        const elements = this.getElements(selector);

        if (elements.length === 0) return;

        elements.forEach((element, index) => {
            const key = `${selector}_${eventType}_${index}`;

            // Check if this exact combination is already registered
            if (this.eventListeners.has(key)) {
                return; // Already registered
            }

            this.registerEventListener(element, eventConfig, key, selector);
        });
    }

    /**
     * Unregister a single event (internal helper)
     * @private
     */
    unregisterSingleEvent(selector, eventType) {
        const elements = this.getElements(selector);
        if (elements.length === 0) return;

        elements.forEach((element, index) => {
            const key = `${selector}_${eventType}_${index}`;

            // Remove from event listeners tracking
            const listenerConfig = this.eventListeners.get(key);
            if (listenerConfig) {
                // Remove the actual event listener using the stored handler
                const eventData = listenerConfig.events.find(e => e.type === eventType);
                if (eventData) {
                    element.removeEventListener(eventType, eventData.handler, eventData.options);
                }
            }

            // Clean up tracking
            this.eventListeners.delete(key);

            // Clean up WeakMap entries
            const elementEvents = this.elementHandlers.get(element);
            if (elementEvents) {
                const filteredEvents = elementEvents.filter(e => e.type !== eventType);
                if (filteredEvents.length === 0) {
                    this.elementHandlers.delete(element);
                } else {
                    this.elementHandlers.set(element, filteredEvents);
                }
            }

            // Clean up any timers for this event
            this.cleanupEventTimers(key, eventType);
        });

        // Remove from handler mapping - clean all elements for this selector/eventType
        const elementsToClean = this.getElements(selector);
        elementsToClean.forEach(element => {
            const handlers = this.eventHandlerMap.get(eventType);
            if (handlers) {
                const filteredHandlers = handlers.filter(h => h.element !== element);
                if (filteredHandlers.length === 0) {
                    this.eventHandlerMap.delete(eventType);
                } else {
                    this.eventHandlerMap.set(eventType, filteredHandlers);
                }
            }
        });
    }

    getEventOptions(eventConfig) {
        const shouldBePassive = this.passiveSupported && this.passiveEvents.includes(eventConfig.type || eventConfig);

        if (typeof eventConfig === 'string') {
            return shouldBePassive ? { passive: true } : false;
        }

        const options = eventConfig.options || {};
        // Apply passive if event type supports it, unless explicitly disabled with passive: false
        if (shouldBePassive && options.passive !== false) {
            options.passive = true;
        }

        return Object.keys(options).length > 0 ? options : false;
    }

    getElements(selector) {
        if (typeof selector === 'string') {
            if (selector === 'document') return [document];
            if (selector === 'window') return [window];
            return Array.from(document.querySelectorAll(selector));
        }
        return selector instanceof Element ? [selector] : [];
    }

    debounce(fn, delay, key) {
        return (...args) => {
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            this.debounceTimers.set(key, setTimeout(() => {
                fn.apply(this, args);
                this.debounceTimers.delete(key);
            }, delay));
        };
    }

    throttle(fn, delay, key) {
        return (...args) => {
            const timerData = this.throttleTimers.get(key);

            if (!timerData) {
                // Leading edge: execute immediately
                fn.apply(this, args);
                this.throttleTimers.set(key, {
                    timeout: setTimeout(() => {
                        this.throttleTimers.delete(key);
                    }, delay),
                    lastArgs: args
                });
            } else {
                // Update arguments for trailing edge
                timerData.lastArgs = args;

                // Clear existing trailing timeout and set new one
                if (timerData.trailingTimeout) {
                    clearTimeout(timerData.trailingTimeout);
                }

                timerData.trailingTimeout = setTimeout(() => {
                    // Trailing edge: execute with latest arguments
                    fn.apply(this, timerData.lastArgs);
                    this.throttleTimers.delete(key);
                }, delay);
            }
        };
    }

    registerEvents() {
        Object.entries(this.eventMapping).forEach(([key, config]) => {
            const isSimplified = Array.isArray(config);
            const elementSelector = isSimplified ? key : config.element;
            const events = isSimplified ? config : config.events;

            const elements = this.getElements(elementSelector);
            if (elements.length === 0) return;

            elements.forEach((element, index) => {
                events.forEach(eventConfig => {
                    const eventType = typeof eventConfig === 'string' ? eventConfig : eventConfig.type;
                    const eventKey = `${elementSelector}_${eventType}_${index}`;

                    // Use the shared registration logic
                    this.registerEventListener(element, eventConfig, eventKey, elementSelector);
                });
            });
        });
        return this;
    }

    destroy() {
        this.eventListeners.forEach((config) => {
            config.events.forEach(({ type, handler, options }) => {
                config.element.removeEventListener(type, handler, options);
            });
        });
        this.eventListeners.clear();
        this.eventHandlerMap.clear();

        // Clean up throttle timers
        this.throttleTimers.forEach((timerData) => {
            if (timerData.timeout) clearTimeout(timerData.timeout);
            if (timerData.trailingTimeout) clearTimeout(timerData.trailingTimeout);
        });
        this.throttleTimers.clear();

        // Clean up debounce timers
        this.debounceTimers.forEach((timerId) => clearTimeout(timerId));
        this.debounceTimers.clear();

        return this;
    }
}

// Export for ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = { YpsilonEventHandler };
    // Also support default export for compatibility
    module.exports.default = YpsilonEventHandler;
} else if (typeof window !== 'undefined') {
    // Browser global
    window.YpsilonEventHandler = YpsilonEventHandler;
}
