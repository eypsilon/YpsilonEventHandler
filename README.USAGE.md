# YpsilonEventHandler - Advanced Usage Patterns

Revolutionary patterns and techniques discovered during YpsilonEventHandler development.

All examples work with `file://` protocol - no build, no setup, no server needed. **Just open in your browser.**

> 💡 **How to Run**: Save any example as an `.html` file and double-click to open in your browser. Works offline instantly!

## 🎯 **Pattern: Inline Method Injection**

**Organize your code by co-locating methods with HTML for rapid prototyping and clean separation.**

**Use When**: Building small to medium apps where you want Vue.js-style external methods without the framework overhead.

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
// 🚀 External Methods Object (Vue.js style organization)
const advancedMethods = {
    // Global methods (available to all events - think of these as universal handlers)
    testRunAll(event, target, containerElement) {
        console.log('🎯 Test initiated from:', containerElement?.id || 'unknown');
        // Dispatch custom events for inter-module communication
        this.dispatch('test.started', { target: target.dataset.action });
    },

    // Event-scoped methods (organized by event type - prevents naming conflicts!)
    click: {
        validateForm(event, target, containerElement) {
            console.log('📋 Click validation in:', containerElement?.tagName);
        },

        openModal(event, target, containerElement) {
            console.log('🪟 Opening modal from:', target.dataset.action);
            // Cross-module communication via events
            this.dispatch('modal.open', { trigger: target.dataset.action });
        }
    },

    // Same method name, different event scope = zero conflicts!
    input: {
        validateForm(event, target, containerElement) {
            console.log('⚡ Real-time input validation:', target.value);
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
            methodsFirst: true,              // Check methods object first (performance optimization)
            enableStats: true,               // Track performance metrics
            enableHandlerValidation: false   // Skip validation for production performance
        });
        // See main README.md "Configuration Options" for all available parameters

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

**Decouple your UI and data management. Communicate via events for true modularity—no direct references, no import spaghetti.**

**Use When**: You want to build modular apps where data and UI are developed independently, or when building micro-frontend architectures.

Independent modules that communicate through event dispatch without coupling.

```js
// Module A: User Interface (can be in same file or separate files)
class UserInterface extends YpsilonEventHandler {
    constructor() {
        super({
            // Only handles clicks within its own UI section
            '#user-panel': ['click', { type: 'data.update', handler: 'onDataChange' }]
        });
    }

    handleClick(event, target, containerElement) {
        // Broadcast UI actions to any listening modules
        this.dispatch('ui.action', {
            action: target.dataset.action,
            userId: containerElement.dataset.userId
        });
    }

    // Listen for data updates from other modules
    onDataChange(event) {
        console.log('🖼️ UI updating from data change:', event.detail);
    }
}

// Module B: Data Manager (completely independent - no imports needed!)
class DataManager extends YpsilonEventHandler {
    constructor() {
        super({
            // Only handles clicks within its own control section  
            '#data-controls': ['click', { type: 'ui.action', handler: 'onUIAction' }]
        });
    }

    handleClick(event, target, containerElement) {
        // Broadcast data updates to any listening modules
        this.dispatch('data.update', {
            timestamp: Date.now(),
            source: 'data-manager'
        });
    }

    // React to UI actions from other modules
    onUIAction(event) {
        console.log('📊 Data responding to UI action:', event.detail);
    }
}

// Zero coupling, infinite scalability! Each module operates independently
const ui = new UserInterface();
const data = new DataManager();
```

## 🚀 **Pattern: Super Delegation**

**Maximum efficiency: One listener rules them all. Perfect for large applications with dynamic content.**

**Use When**: Building large SPAs with hundreds/thousands of dynamic elements, or when you want ultimate performance with minimal memory footprint.

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

        // Smart routing: Component-specific handlers get priority
        if (component && this[`handle${component}Click`]) {
            this[`handle${component}Click`](event, target, containerElement);
        }
        // Fallback to action-based routing for generic behaviors
        else if (action && this[action]) {
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

**Track your app's performance in real-time. Built-in metrics with zero overhead when disabled.**

**Use When**: Optimizing production applications, debugging performance issues, or conducting load testing.

```js
class PerformanceHandler extends YpsilonEventHandler {
    constructor() {
        super({
            'body': ['click', 'input', 'scroll']
        }, {}, {
            enableStats: true,                 // Enable performance tracking
            enableDistanceCache: true,         // Cache DOM distance calculations
            enableHandlerValidation: false     // Skip validation for production speed
        });
        // See main README.md "Configuration Options" for all performance settings

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

---

## 🚨 **WARNING: OUT OF CONTROL!** 

> ⚠️ **YpsilonEventHandler may cause sudden bursts of inspiration, code refactoring frenzies, or feelings of deep satisfaction. Proceed at your own risk.**

**The LOC-to-Feature ratio is completely out of control.**

## 🤯 **Unhinged Usage Patterns**

*Nobody expects these to work, but they do. Welcome to the bleeding edge.*

### **🚨 Pattern: Cross-Tab Event Broadcasting**

```js
// Broadcast events across browser tabs - because why not?
class CrossTabHandler extends YpsilonEventHandler {
    constructor() {
        super({ 'body': ['click'] });
        
        // Listen for events from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'ypsilon-event') {
                const data = JSON.parse(e.newValue);
                this.dispatch(data.type, data.detail);
            }
        });
    }
    
    handleClick(event, target) {
        // Broadcast to ALL open tabs instantly
        localStorage.setItem('ypsilon-event', JSON.stringify({
            type: 'cross-tab-click',
            detail: { action: target.dataset.action, timestamp: Date.now() }
        }));
        localStorage.removeItem('ypsilon-event'); // Trigger storage event
    }
}
```

### **🚨 Pattern: Event-Driven CSS Toggling**

```js
// CSS as a service via events - completely unhinged
class CSSEventHandler extends YpsilonEventHandler {
    constructor() {
        super({ 'body': ['click', { type: 'theme-change', handler: 'applyTheme' }] });
    }
    
    handleClick(event, target) {
        // Dispatch CSS changes as events
        this.dispatch('theme-change', { 
            theme: target.dataset.theme,
            colors: target.dataset.colors?.split(',') || []
        });
    }
    
    applyTheme(event) {
        const { theme, colors } = event.detail;
        // Inject CSS dynamically via events
        const style = document.createElement('style');
        style.textContent = `
            .theme-${theme} { 
                --primary: ${colors[0] || '#000'};
                --secondary: ${colors[1] || '#fff'};
            }
        `;
        document.head.appendChild(style);
        document.body.className = `theme-${theme}`;
    }
}
```

### **🚨 Pattern: Self-Modifying Handlers**

```js
// Handlers that rewrite themselves - pure madness
class SelfModifyingHandler extends YpsilonEventHandler {
    constructor() {
        super({ 'body': ['click'] });
        this.clickCount = 0;
    }
    
    handleClick(event, target) {
        this.clickCount++;
        
        // After 10 clicks, completely change behavior
        if (this.clickCount === 10) {
            // Replace the handler method at runtime!
            this.handleClick = function(event, target) {
                console.log('🤯 Handler has evolved!');
                // Now dispatch different events
                this.dispatch('handler-evolved', { 
                    originalClicks: this.clickCount,
                    newBehavior: 'chaos-mode'
                });
            };
        }
        
        console.log(`Click ${this.clickCount} - ${this.clickCount < 10 ? 'Normal' : 'ERROR: Should not see this'}`);
    }
}
```

### **🚨 Pattern: DOM-to-WebWorker Event Bridge**

```js
// Bridge DOM events to WebWorkers via custom events
class WebWorkerBridge extends YpsilonEventHandler {
    constructor() {
        super({ 'body': ['input'] });
        
        // Create worker for heavy computations
        this.worker = new Worker('data:application/javascript,' + encodeURIComponent(`
            self.onmessage = function(e) {
                // Simulate heavy computation
                const result = Array(1000000).fill(0).reduce((a, b, i) => a + i);
                self.postMessage({ type: 'computation-done', result, input: e.data });
            };
        `));
        
        this.worker.onmessage = (e) => {
            // Worker results become DOM events
            this.dispatch('worker-result', e.data);
        };
    }
    
    handleInput(event, target) {
        // Send DOM input to WebWorker
        this.worker.postMessage(target.value);
    }
}

// Extend to handle worker results
class WorkerResultHandler extends WebWorkerBridge {
    constructor() {
        super();
        // Add worker result handling
        this.eventMapping.body.push({ type: 'worker-result', handler: 'displayResult' });
        this.registerEvents(); // Re-register with new mapping
    }
    
    displayResult(event) {
        console.log('🧠 Worker computed:', event.detail);
    }
}
```

**"Out of Control!" isn't a bug - it's our superpower.** 🚀

These patterns enable enterprise-level architecture with radical simplicity - all running on `file://` protocol with zero build tools and zero server instances.
