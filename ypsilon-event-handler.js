/**
 * YpsilonEventHandler - Minimal, extendable event handling system
 */
class YpsilonEventHandler {
    constructor(eventMapping = {}) {
        this.eventMapping = eventMapping;
        this.eventListeners = new Map();
        this.elementHandlers = new WeakMap();
        this.passiveSupported = false;
        this.throttleTimers = new Map();
        this.debounceTimers = new Map();
        this.init();
    }

    init() {
        this.detectPassiveSupport();
        this.handleEvent = (event) => {
            const handlerName = `handle${event.type.charAt(0).toUpperCase() + event.type.slice(1)}`;
            if (typeof this[handlerName] === 'function') {
                this[handlerName](event, event.target);
            }
        };
        this.registerEvents();
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

    getEventOptions(eventConfig) {
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];
        const shouldBePassive = this.passiveSupported && passiveEvents.includes(eventConfig.type || eventConfig);
        
        if (typeof eventConfig === 'string') {
            return shouldBePassive ? { passive: true } : false;
        }
        
        const options = eventConfig.options || {};
        if (shouldBePassive && options.passive !== false) {
            options.passive = true;
        }
        
        return Object.keys(options).length > 0 ? options : false;
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

    registerEvents() {
        Object.entries(this.eventMapping).forEach(([key, config]) => {
            // Check if this is the new simplified syntax (selector as key)
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
                const customHandler = typeof eventConfig === 'object' ? eventConfig.handler : null;
                const options = this.getEventOptions(eventConfig);
                
                let handler = this;
                
                // Create custom handler if specified
                if (customHandler && typeof this[customHandler] === 'function') {
                    handler = {
                        handleEvent: (event) => this[customHandler](event, event.target)
                    };
                }
                
                // Apply throttle/debounce if specified
                if (typeof eventConfig === 'object') {
                    if (eventConfig.throttle) {
                        const throttleKey = `${key}-${eventType}-throttle`;
                        const originalHandleEvent = handler.handleEvent ? 
                            handler.handleEvent : 
                            (event) => this.handleEvent(event);
                        handler = {
                            handleEvent: this.throttle(originalHandleEvent, eventConfig.throttle, throttleKey)
                        };
                    } else if (eventConfig.debounce) {
                        const debounceKey = `${key}-${eventType}-debounce`;
                        const originalHandleEvent = handler.handleEvent ? 
                            handler.handleEvent : 
                            (event) => this.handleEvent(event);
                        handler = {
                            handleEvent: this.debounce(originalHandleEvent, eventConfig.debounce, debounceKey)
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

    getElement(selector) {
        if (typeof selector === 'string') {
            if (selector === 'document') return document;
            if (selector === 'window') return window;
            return document.querySelector(selector);
        }
        return selector instanceof Element ? selector : null;
    }

    destroy() {
        this.eventListeners.forEach((config) => {
            config.events.forEach(({ type, handler, options }) => {
                config.element.removeEventListener(type, handler, options);
            });
        });
        this.eventListeners.clear();
        
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
    module.exports = { YpsilonEventHandler };
} else if (typeof window !== 'undefined') {
    window.YpsilonEventHandler = YpsilonEventHandler;
}
