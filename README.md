# YpsilonEventHandler

A minimal, extendable event handling system for web applications. Built around the native `handleEvent` interface with automatic performance optimizations and zero memory leaks.

## ✨ Features

- 🎯 **Native Performance** - Uses browser's built-in `handleEvent` interface
- ⚡ **Auto Passive Listeners** - Automatically applies `{passive: true}` to scroll/touch events
- 🔄 **Built-in Throttle/Debounce** - Performance optimization out of the box
- 🧩 **Extension-First Design** - Built to be extended, not configured
- 🧹 **Zero Memory Leaks** - WeakMap + explicit cleanup guarantee safety
- 📏 **Minimal Footprint** - Less than 200 lines of focused code
- 🚀 **Convention-Based** - `click` → `handleClick`, `scroll` → `handleScroll`
- ✨ **CSS-Like Syntax** - `'.btn-primary': [...]` - selectors as keys!
- 🔗 **No bind() Required** - Automatic `this` context handling + safer event removal
- 🫧 **Event Bubbling** - Leverages native event bubbling for efficient delegation

## SPA Example

Experience the **ultimate event delegation power** with our [full SPA demo](https://eypsilon.github.io/YpsilonEventHandler/example/public/spa.html):

### 🤯 **ONLY 5 EVENT LISTENERS** for an entire Single Page Application!

**What those 5 listeners handle:**
- ✅ Dynamic content creation/deletion
- ✅ Todo list management
- ✅ Tab system with dynamic tabs
- ✅ Form interactions & validation
- ✅ Sticky statistics bar
- ✅ Smart footer visibility
- ✅ Real-time scroll tracking
- ✅ Toast notifications
- ✅ Live event logging
- ✅ Element counters & metrics

**Traditional approach would need:**
- 🔴 50+ individual event listeners
- 🔴 Manual cleanup for each dynamic element
- 🔴 Memory leaks everywhere
- 🔴 Performance bottlenecks
- 🔴 Tons of `.bind(this)` calls

**YpsilonEventHandler approach:**
- 🟢 **5 listeners total** (`click`, `input`, `change`, `keydown`, `scroll`)
- 🟢 **Zero memory leaks** (automatic cleanup)
- 🟢 **Perfect performance** (native `handleEvent` interface)
- 🟢 **No bind() needed** (automatic `this` context)
- 🟢 **Infinite scalability** (works with any number of elements)

### 🎯 **Key Demo Features:**
- **Dynamic Element Creation** - Add/remove elements that work instantly
- **Event Delegation Magic** - One listener handles thousands of elements
- **Scroll Superiority** - Sticky stats + footer with zero layout shifts
- **Form Mastery** - Debounced inputs, dynamic fields, proper accessibility
- **Tab System** - Dynamic tabs with event delegation
- **Live Metrics** - Real-time statistics powered by event delegation

**[👉 Try the SPA Demo](https://eypsilon.github.io/YpsilonEventHandler/example/public/spa.html)**

*"This is event handling perfection!" - Every developer who sees it*

## 🚀 Quick Start

```html
<script src="ypsilon-event-handler.js"></script>
```

```javascript
class MyEventHandler extends YpsilonEventHandler {
  constructor() {
    super({
      '.btn-primary': [
        { type: 'click', handler: 'handlePrimaryClick' }
      ],
      '.search-input': [
        { type: 'input', handler: 'handleSearch', debounce: 300 }
      ],
      'window': [
        { type: 'scroll', handler: 'handleScroll', throttle: 100 }
      ]
    });
  }

  handlePrimaryClick(event, target) {
    console.log('Primary button clicked!');
  }

  handleSearch(event, target) {
    console.log('Search (debounced):', target.value);
  }

  handleScroll(event, target) {
    console.log('Scroll (throttled):', window.scrollY);
  }
}

// Initialize
const handler = new MyEventHandler();

// Clean up when done
handler.destroy();
```

## 📖 Advanced Usage

### Simplified Syntax (Recommended)

```javascript
super({
  '.btn-primary': [
    { type: 'click', handler: 'handlePrimaryClick' }
  ],
  '.search-input': [
    { type: 'input', handler: 'handleSearch', debounce: 300 }
  ],
  '.scroll-container': [
    { type: 'scroll', handler: 'handleScroll', throttle: 50 }
  ],
  'document': [
    { type: 'keydown', handler: 'handleKeyboard', options: { once: true } }
  ]
});
```

### Performance Options

```javascript
'.fast-button': [
  { type: 'click', handler: 'handleClick', throttle: 100 }  // Max once per 100ms
],
'.search-input': [
  { type: 'input', handler: 'handleSearch', debounce: 300 }  // Wait 300ms after typing
],
'.modal': [
  { type: 'click', handler: 'handleModal', options: { once: true } }  // Fire only once
]
```

### Legacy Syntax (Still Supported)

```javascript
// Old verbose syntax still works
super({
  navigation: {
    element: '.nav',
    events: [
      { type: 'click', handler: 'handleNavClick' }
    ]
  }
});
```

## 🎯 Why YpsilonEventHandler?

### Before (Traditional Approach)
```javascript
// Manual listener management nightmare
const button = document.getElementById('btn');
const input = document.getElementById('input');

const handleClick = (e) => { /* logic */ };
const handleInput = debounce((e) => { /* logic */ }, 300);

button.addEventListener('click', handleClick);
input.addEventListener('input', handleInput);

// Remember to clean up later... 😬
button.removeEventListener('click', handleClick);
input.removeEventListener('input', handleInput);
```

### After (YpsilonEventHandler)
```javascript
// Clean, declarative, bulletproof
class MyHandler extends YpsilonEventHandler {
  constructor() {
    super({
      'document': [
        { type: 'click', handler: 'handleClick' },
        { type: 'input', handler: 'handleInput', debounce: 300 }
      ]
    });
  }

  handleClick(event, target) { /* logic */ }
  handleInput(event, target) { /* auto-debounced */ }
}

const handler = new MyHandler();
handler.destroy(); // Perfect cleanup guaranteed
```

## 🔧 API Reference

### Constructor
```javascript
new YpsilonEventHandler(eventMapping)
```

### Event Mapping Structure

**Simplified Syntax (Recommended):**
```javascript
{
  'selector | element | document | window': [
    'eventType' | {
      type: 'eventType',
      handler?: 'methodName',
      throttle?: number,
      debounce?: number,
      options?: EventListenerOptions
    }
  ]
}
```

**Legacy Syntax:**
```javascript
{
  [key]: {
    element: 'selector' | element | 'document' | 'window',
    events: [
      'eventType' | {
        type: 'eventType',
        handler?: 'methodName',
        throttle?: number,
        debounce?: number,
        options?: EventListenerOptions
      }
    ]
  }
}
```

### Handler Methods
- Convention: `handleEventType(event, target)`
- Examples: `handleClick`, `handleScroll`, `handleInput`
- Auto-routing based on event type

### Lifecycle
- `destroy()` - Clean up all listeners and timers

## 🧪 Live Demo

Check out the [interactive example](https://eypsilon.github.io/YpsilonEventHandler/example/public/index.html) featuring:
- Real-time scroll metrics
- Throttle/debounce demonstration
- Destroy/recreate testing
- Passive listener indicators

## 🏗️ How It Works

YpsilonEventHandler leverages the native `handleEvent` interface - a little-known browser feature that allows objects to act as event handlers:

```javascript
// Instead of this:
element.addEventListener('click', function(e) {});

// We use this:
element.addEventListener('click', this); // 'this' has handleEvent method
```

This enables:
- Single handler instance for all events
- Automatic routing to handler methods
- Zero overhead for unused features
- Perfect memory management

## 📦 Installation

### CDN
```html
<script src="https://cdn.jsdelivr.net/gh/eypsilon/YpsilonEventHandler@latest/ypsilon-event-handler.js"></script>
```

### Download
- Download `ypsilon-event-handler.js`
- Include in your HTML
- Start using immediately

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Engin Ypsilon** - Original concept and architecture
- **Claude (Anthropic)** - Implementation and optimization

---

*Built with ❤️ using native web standards. No dependencies, no bind, no bloat, just pure performance.*
