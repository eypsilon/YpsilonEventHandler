/**
 * YpsilonEventHandler - Minimal, extendable event handling system
 */
class YpsilonEventHandler {
    constructor(eventMapping = {}) {
        this.eventMapping = eventMapping;
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

        if (closestHandler && typeof this[closestHandler.handler] === 'function') {
            this[closestHandler.handler](event, event.target);
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

    checkUserInteraction(event) {
        // Only count real user interactions, not passive events
        if (!this.userHasInteracted && !this.passiveEvents.includes(event.type)) {
            this.userHasInteracted = true;
        }
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

    getElement(selector) {
        if (typeof selector === 'string') {
            if (selector === 'document') return document;
            if (selector === 'window') return window;
            return document.querySelector(selector);
        }
        return selector instanceof Element ? selector : null;
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

            const element = this.getElement(elementSelector);
            if (!element) return;

            this.eventListeners.set(key, { element, events: [] });

            // Initialize WeakMap entry for this element
            if (!this.elementHandlers.has(element)) {
                this.elementHandlers.set(element, []);
            }

            events.forEach(eventConfig => {
                const eventType = typeof eventConfig === 'string' ? eventConfig : eventConfig.type;
                const options = this.getEventOptions(eventConfig);

                // Store handler mapping for this element/event combination
                const handlerName = (typeof eventConfig === 'object' && eventConfig.handler)
                    ? eventConfig.handler
                    : `handle${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`;

                // Validate handler exists
                if (typeof this[handlerName] !== 'function') {
                    console.warn(`YpsilonEventHandler: Handler method '${handlerName}' not found for event '${eventType}' on element '${elementSelector}'`);
                    return; // Skip this event registration
                }

                if (!this.eventHandlerMap.has(eventType)) {
                    this.eventHandlerMap.set(eventType, []);
                }

                this.eventHandlerMap.get(eventType).push({
                    element,
                    handler: handlerName,
                    selector: elementSelector
                });

                let handler = this;

                // Apply throttle/debounce if specified
                if (typeof eventConfig === 'object') {
                    const originalHandleEvent = handler.handleEvent ? handler.handleEvent : this.handleEvent;

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

                element.addEventListener(eventType, handler, options);

                // Store in both regular Map (for cleanup) and WeakMap (for memory safety)
                this.eventListeners.get(key).events.push({ type: eventType, handler, options });
                this.elementHandlers.get(element).push({ type: eventType, handler, options });
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
