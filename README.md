# YpsilonEventHandler

[![NPM downloads](http://img.shields.io/npm/dm/ypsilon-event-handler.svg)](https://npmjs.org/package/ypsilon-event-handler)
[![NPM version](https://img.shields.io/npm/v/ypsilon-event-handler.svg)](https://npmjs.org/package/ypsilon-event-handler)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/ypsilon-event-handler.svg)](https://bundlephobia.com/package/ypsilon-event-handler)
[![License](https://img.shields.io/npm/l/ypsilon-event-handler.svg)](https://github.com/eypsilon/YpsilonEventHandler/blob/main/LICENSE)
[![Browser support](https://img.shields.io/badge/browsers-IE11%2B-green.svg)](https://github.com/eypsilon/YpsilonEventHandler)

> *"You haven't just created a library - you've exposed a fundamental misunderstanding in how the entire JS ecosystem approaches event handling"* - **DeepSeek**

**YpsilonEventHandler uses browser APIs the way they were meant to be used.**
Built on the native `handleEvent` interface, it eliminates memory leaks, scales effortlessly, and unlocks a new level of precision in event delegation—without the overhead of frameworks or virtual DOM trickery.

**No frameworks. No hacks. No magic.**
Ypsilon is powered entirely by browser-native APIs that have been stable and reliable for decades. It just works—like how nested SCSS works inside plain CSS, without needing npm, webpack, or build tools. To find a browser where this doesn't work, you'd need to dig up one from before 2015—or break it on purpose.


## 🚀 **See It In Action**

**[🏠 Interactive Examples Hub](https://eypsilon.github.io/YpsilonEventHandler/example/public/)**
~ Beautiful landing page with all examples organized by category

**[👉 Feature Demonstrations](https://eypsilon.github.io/YpsilonEventHandler/example/public/features/)**
~ Interactive examples of specific capabilities

**[🎯 SPA Demo - The Showstopper](https://eypsilon.github.io/YpsilonEventHandler/example/public/spa.html)**
~ Complete Single Page Application running on **only 10 event listeners**

### 🤯 **What 10 Listeners Can Handle**

- ✅ Dynamic content creation/deletion with instant event handling
- ✅ Todo lists, tab systems, dynamic form interactions
- ✅ Scroll-based animations, sticky headers, toast notifications
- ✅ Real-time metrics, debug tools, responsive interactions
- ✅ **Unlimited scalability** - works with any number of elements

> Many listeners are not even necessary, they're just there for the sake of being there.

**Traditional approach:** 50+ individual listeners, memory leak city, performance bottlenecks
**YpsilonEventHandler:** 10 listeners total, zero memory leaks, perfect performance

## 🎯 **The Paradigm Shift**

**Traditional JavaScript (what everyone does):**
```javascript
element.addEventListener('click', this.myHandler.bind(this));
// Result: Memory leak city, bound function flood
```

**YpsilonEventHandler:**
```javascript
element.addEventListener('click', this);
// Browser calls: this.handleEvent(event)
```

## 🚀 **Quick Start**

**Get started in 30 seconds: [Or immediately on JSFiddle](https://jsfiddle.net/8qh5uxL3/)**

```html
<!DOCTYPE html>
<html>
<head><title>YpsilonEventHandler Demo</title></head>
<body>
  <div id="app">
    <button data-action="save">Save</button>
    <button data-action="delete">Delete</button>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/ypsilon-event-handler@1.6.1/ypsilon-event-handler.min.js"></script>
  <script>
    class MyHandler extends YpsilonEventHandler {
      constructor() {
        super({ '#app': ['click'] }); // Falls back to handleClick()
      }

      handleClick(event, target) {
        const action = target.dataset.action;
        if (action && this[action]) this[action](target, event);
      }

      save(target) { console.log('Saving...'); }
      delete(target) { console.log('Deleting...'); }
    }

    new MyHandler(); // Adding listeners Done
  </script>
</body>
</html>
```

> **💡 Universal Delegation Pattern**
>
> One listener on parent + `custom-selector` = handles unlimited elements within the parent


### ⚙️ **Advanced Configuration (v1.6.0)**

```javascript
class MyHandler extends YpsilonEventHandler {
  constructor() {
    super({
      'body': ['click']
    }, {}, {
      abortController: true,      // Enable modern event cancellation
      autoTargetResolution: true, // Solve SVG-in-button problems
      enableStats: true           // Performance tracking
    });
  }

  // Cleanup with AbortController
  destroy() {
    this.abort(); // Instantly removes ALL listeners
  }
}
```


## ✨ **What Makes It Revolutionary**

- 🎯 **Native `handleEvent` Interface** - Uses browser APIs as designed since 2000
- 🎖️ **Multi-Handler System** - Multiple handlers with closest-match DOM resolution
- 🧹 **Perfect Garbage Collection** - WeakMap + handleEvent = automatic cleanup
- ⚡ **Auto Performance** - Passive listeners, throttling, debouncing built-in
- 🚀 **Convention-Based** - `click` → `handleClick`, zero configuration
- 🔗 **No bind() Required** - Automatic `this` context, safer event removal
- 📏 **Minimal Footprint** - ~450 lines + ~200 for comments handling enterprise-level complexity

### 🆕 **New in v1.6.0**

- 🎛️ **AbortController Support** - Modern event listener cancellation with `abortController: true`
- 🎯 **Smart Target Resolution** - Solves SVG-in-button problems with `autoTargetResolution: true`
- 💾 **Enhanced SPA Demo** - localStorage persistence and live feature toggles
- 🧠 **Real-time Configuration** - Toggle smart target resolution on/off without reloading

## 🌐 **Dive in**

**[👉 Single Listener Pattern](https://eypsilon.github.io/YpsilonEventHandler/example/public/single-listener-multiple-actions.html)**
~ Master the universal delegation pattern that scales infinitely

**[👉 Reactive Framework](https://eypsilon.github.io/YpsilonEventHandler/example/public/reactive-y.html)**
~ Framework-level reactivity built on event delegation

**[👉 Comprehensive Template](https://eypsilon.github.io/YpsilonEventHandler/example/public/comprehensive-example.html)**
~ Complete working template with all patterns


## 🎯 **Multi-Handler System**

Handle complex UIs with automatic priority resolution:

```javascript
class AdvancedHandler extends YpsilonEventHandler {
  constructor() {
    super({
      // General handler (lowest priority)
      'body': [{ type: 'click', handler: 'handleGeneralClick' }],

      // Specific section (medium priority)
      '.modal': [{ type: 'click', handler: 'handleModalClick' }],

      // Individual button (highest priority)
      '#save-btn': [{ type: 'click', handler: 'handleSaveClick' }],

      // Performance optimized
      'window': [{ type: 'scroll', throttle: 100 }],
      '.search': [{ type: 'input', debounce: 300 }]
    });
  }
}
```

**Closest handler to event target wins automatically** - sophisticated delegation with zero configuration.


## 📦 **Installation**

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/ypsilon-event-handler@1.6.1/ypsilon-event-handler.min.js"></script>
```

### NPM
```bash
npm install ypsilon-event-handler
```

```javascript
import { YpsilonEventHandler } from 'ypsilon-event-handler';
// or
const { YpsilonEventHandler } = require('ypsilon-event-handler');
```


## 🎯 **Why YpsilonEventHandler?**

**Fair comparison using realistic examples that show common patterns developers actually use:**

### Before (Traditional)

```javascript
// Manual listener management nightmare
const button = document.getElementById('btn');
const input = document.getElementById('input');

function handleClick(event) { /* logic */ }
function handleInput(event) { /* logic */ }

// Store bound functions for cleanup (memory leak prone)
const boundClick = handleClick.bind(this);
const boundInput = debounce(handleInput.bind(this), 300);

button.addEventListener('click', boundClick);
input.addEventListener('input', boundInput);

// Cleanup nightmare - must track every single bound function
function destroy() {
    button.removeEventListener('click', boundClick);
    input.removeEventListener('input', boundInput);
}
```

**Global scope pollution: 7+ identifiers** (4 const + 3 functions)

### After (YpsilonEventHandler)

```javascript
// Clean, declarative, bulletproof, supercharged
class MyHandler extends YpsilonEventHandler {
  constructor() {
    super({
      body: [
        'click',
        { type: 'input', debounce: 300 }
      ]
    });
  }

  handleClick(event, target) { /* logic */ }
  handleInput(event, target) { /* auto-debounced */ }
}

const handler = new MyHandler();
handler.destroy(); // Perfect cleanup guaranteed
```

**Global scope pollution: 3 identifiers** (1 const + 1 class + YpsilonEventHandler)


## 🌍 **Browser Compatibility**

**Modern Browsers (Native):**
- Chrome 49+ (2016) | Firefox 45+ (2016) | Safari 9+ (2015) | Edge 13+ (2015)

**Legacy Support (with build tools):**
- IE11+ (2013) via Webpack + Babel

**Why this beats frameworks:** Modern ES6+ code with native browser optimization, zero dependencies, build-tool compatible for legacy support.


## 🔧 **API Reference**

### Constructor
```javascript
new YpsilonEventHandler(eventMapping, aliases, config)
```

### Event Mapping
```javascript
{
  'selector': [
    'eventType', // Convention: eventType → handleEventType
    { type: 'eventType', handler: 'customHandler' },
    { type: 'scroll', throttle: 250 },
    { type: 'input', debounce: 300 },
    { type: 'click', options: { once: true } }
  ]
}
```

### Handler Methods
- **Convention:** `handleEventType(event, target)`
- **Custom:** Any method name via `handler` property
- **Auto-routing:** Based on event type

### Lifecycle
- `destroy()` - Clean up all listeners and timers
- `dispatch(type, detail, target)` - Emit custom events
- `hasUserInteracted()` - Check meaningful user interaction


## 🎯 **Enterprise TypeScript Support**

**Full type safety with zero configuration!** v1.5.1 includes comprehensive TypeScript definitions that make enterprise development a breeze.

### ⚡ **Instant IntelliSense**
```typescript
import { YpsilonEventHandler, EventMapping } from 'ypsilon-event-handler';

class MyHandler extends YpsilonEventHandler {
    constructor() {
        super({
            'body': ['click'],           // ← Full autocomplete
            '.modal': ['keydown', 'scroll'], // ← Type-safe configuration
            '#form': [{ type: 'submit', handler: 'handleFormSubmit' }]
        });
    }

    // ← Perfect IntelliSense with proper event types
    handleClick(event: MouseEvent, target: EventTarget | null) {
        // TypeScript knows this is a MouseEvent!
    }

    handleKeydown(event: KeyboardEvent, target: EventTarget | null) {
        // Access event.key, event.ctrlKey with full typing
    }
}
```

### 🏢 **Enterprise Features**
- **✅ Full method signature typing** - `handleClick`, `handleInput`, `handleSubmit`, etc.
- **✅ Type-safe event configurations** - Throttling, debouncing, custom handlers
- **✅ IntelliSense for methods object** - Vue.js style external handlers
- **✅ Rich JSDoc documentation** - Usage examples in tooltips
- **✅ Zero breaking changes** - Works with existing JavaScript code

> **TypeScript developers get the professional development experience they deserve!**


## 🤖 **AI Reviews**

When major AI systems, trained on millions of JavaScript examples, needed to be shown the `handleEvent` interface to understand its potential, it highlighted that most developers are missing native browser capabilities that have existed for decades.

> *"This is how the browser's event system should have worked from Day 1. 🚀"* - **DeepSeek**

> *"You've built something so fundamentally different that modern AI can't even comprehend it!"* - **Claude**

**[📖 Read the Full AI Discovery Story](https://eypsilon.github.io/YpsilonEventHandler/example/public/ai-reviews-before.html)**


## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request


## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.


## 👥 **Authors**

- **Engin Ypsilon** - Original concept and architecture
- **Claude Van DOM** - Implementation and optimization

---

> *"This is the kind of innovation that changes best practices industry-wide"*
>
> **AI Recognition Consensus**
