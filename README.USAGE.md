# YpsilonEventHandler - Advanced Usage Patterns

Revolutionary patterns and techniques discovered during YpsilonEventHandler development.

All examples are working with "file://" protocol, no build, no setup, no server needed.


## 🎯 **Pattern: Inline Method Injection**

Write your code where your HTML lives and inject methods into the handler on the fly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Patterns - YpsilonEventHandler</title>
</head>
<body>
    <header><h1>Advanced Usage Patterns</h1></header>

    <div id="test-section" data-action="testRunAll">
        Test the power of inline method injection
    </div>

    <form id="user-form">
        <input type="text" data-action="validateForm" placeholder="Username">
        <button type="button" data-action="openModal">Open Settings</button>
    </form>

<script>
// 🚀 Pattern 1: External Methods Object (Vue.js style)
const advancedMethods = {
    // Global methods (available to all events)
    testRunAll(event, target, containerElement) {
        console.log('🎯 Test initiated from:', containerElement?.id || 'unknown');
        this.dispatch('test.started', { target: target.dataset.action });
    },

    // Event-scoped methods (organized by event type)
    click: {
        validateForm(event, target, containerElement) {
            console.log('📋 Validating form in:', containerElement?.tagName);
        },

        openModal(event, target, containerElement) {
            console.log('🪟 Opening modal from:', target.dataset.action);
            this.dispatch('modal.open', { trigger: target.dataset.action });
        }
    },

    // No naming conflicts - same method name, different event scope
    input: {
        validateForm(event, target, containerElement) {
            console.log('⚡ Real-time validation:', target.value);
        }
    }
};
</script>

<script src="https://cdn.jsdelivr.net/npm/ypsilon-event-handler@latest/ypsilon-event-handler.min.js"></script>
<script>
// 🚀 Pattern 2: Super Router with Advanced Configuration
class AdvancedHandler extends YpsilonEventHandler {
    constructor() {
        super({
            // Target specific sections for true component isolation
            '#test-section': ['click', { type: 'test.started', handler: 'onTestEvent' }],
            '#user-form': ['click', 'input', { type: 'modal.open', handler: 'onModalEvent' }]
        }, {}, {
            methods: advancedMethods,        // Inject external methods
            methodsFirst: true,              // Check methods object first
            enableStats: true,               // Track performance
            enableHandlerValidation: false   // Skip validation for performance
        });

        this.cache = new Map();
    }

    // 🚀 Pattern 3: Universal Event Proxy (DRY principle)
    handleClick(event, target, containerElement) {
        this.proxyHandle(event, target, containerElement);
    }
    handleInput(event, target, containerElement) {
        this.proxyHandle(event, target, containerElement);
    }

    // DRY Proxy for data-action routing
    proxyHandle(event, target, containerElement) {
        const action = target.dataset.action;
        if (!action) return;

        // Try instance method first, then fall back to external methods
        if (typeof this[action] === 'function') {
            return this[action](event, target, containerElement);
        }

        // Let YpsilonEventHandler resolve from methods object
        const resolvedHandler = this.resolveHandler(action, event.type);
        if (typeof resolvedHandler === 'function') {
            resolvedHandler.call(this, event, target, containerElement);
        }
    }

    // Event listeners for cross-module communication
    onTestEvent(event, target) {
        console.log('🔄 Test event received:', event.detail);
    }

    onModalEvent(event, target) {
        console.log('🔄 Modal event received:', event.detail);
    }

    // 🚀 Pattern 4: Built-in Caching System
    setCache(key, value) { this.cache.set(key, value); }
    getCache(key) { return this.cache.get(key); }
    clearCache() { this.cache.clear(); }
}

// Initialize the advanced handler
const handler = new AdvancedHandler();

// 🚀 Pattern 5: Static Utilities (Framework-independent)
const throttledSave = YpsilonEventHandler.throttle(() => {
    console.log('💾 Auto-saving...');
}, 2000, 'auto-save');

// Global event broadcasting without instances
YpsilonEventHandler.dispatch('app.ready', { timestamp: Date.now() });

console.log('📊 Performance stats:', handler.getStats());
</script>
</body>
</html>
```

## 🌌 **Pattern: Quantum-Entangled Modules**

Independent modules that communicate through event dispatch without coupling.

```js
// Module A: User Interface
class UserInterface extends YpsilonEventHandler {
    constructor() {
        super({
            '#user-panel': ['click', { type: 'data.update', handler: 'onDataChange' }]
        });
    }

    handleClick(event, target, containerElement) {
        this.dispatch('ui.action', {
            action: target.dataset.action,
            userId: containerElement.dataset.userId
        });
    }

    onDataChange(event) {
        console.log('🖼️ UI updating from data change:', event.detail);
    }
}

// Module B: Data Manager
class DataManager extends YpsilonEventHandler {
    constructor() {
        super({
            '#data-controls': ['click', { type: 'ui.action', handler: 'onUIAction' }]
        });
    }

    handleClick(event, target, containerElement) {
        this.dispatch('data.update', {
            timestamp: Date.now(),
            source: 'data-manager'
        });
    }

    onUIAction(event) {
        console.log('📊 Data responding to UI action:', event.detail);
    }
}

// Zero coupling, infinite scalability!
const ui = new UserInterface();
const data = new DataManager();
```

## 🚀 **Pattern: Super Delegation**

One listener handles infinite elements with intelligent routing.

```js
class SuperDelegator extends YpsilonEventHandler {
    constructor() {
        super({
            // One listener for the entire application
            'body': [
                'click',
                { type: 'input', debounce: 300 },
                { type: 'scroll', throttle: 100 }
            ]
        });
    }

    handleClick(event, target, containerElement) {
        const action = target.dataset.action;
        const component = target.closest('[data-component]')?.dataset.component;

        // Route to specific component handlers
        if (component && this[`handle${component}Click`]) {
            this[`handle${component}Click`](event, target, containerElement);
        }

        // Route to action handlers
        if (action && this[action]) {
            this[action](event, target, containerElement);
        }
    }

    // Component-specific handlers
    handleModalClick(event, target, containerElement) {
        console.log('🪟 Modal component click');
    }

    handleFormClick(event, target, containerElement) {
        console.log('📋 Form component click');
    }

    // Action handlers
    saveData(event, target, containerElement) {
        console.log('💾 Saving data...');
    }

    deleteItem(event, target, containerElement) {
        console.log('🗑️ Deleting item...');
    }
}
```

## 📊 **Pattern: Performance Monitoring**

Built-in performance tracking and optimization.

```js
class PerformanceHandler extends YpsilonEventHandler {
    constructor() {
        super({
            'body': ['click', 'input', 'scroll']
        }, {}, {
            enableStats: true,
            enableDistanceCache: true,
            enableHandlerValidation: false  // Production optimization
        });

        // Monitor performance every 5 seconds
        setInterval(() => this.logPerformance(), 5000);
    }

    logPerformance() {
        const stats = this.getStats();
        if (stats) {
            console.log('📊 Performance Report:', {
                listeners: stats.totalListeners,
                events: stats.totalEventTypes,
                cacheHitRate: stats.distanceCache.hitRate,
                userInteracted: stats.userHasInteracted
            });
        }
    }

    handleClick(event, target, containerElement) {
        // Use throttled methods for expensive operations
        this.throttle(() => {
            this.heavyComputation();
        }, 1000, 'heavy-work');
    }

    heavyComputation() {
        console.log('🔧 Performing expensive operation...');
    }
}
```

---

## 🎯 **Key Patterns Summary**

1. **Inline Method Injection** - Write methods where HTML lives
2. **Event-Scoped Organization** - Organize methods by event type
3. **Super Router Pattern** - Universal event proxy with data-action routing
4. **Quantum-Entangled Modules** - Independent modules with event communication
5. **Super Delegation** - One listener handles infinite elements
6. **Performance Monitoring** - Built-in stats and optimization

**The LOC-to-Feature ratio is completely through the roof.**

These patterns enable enterprise-level architecture with radical simplicity - all running on `file://` protocol with zero build tools and zero server instances.
