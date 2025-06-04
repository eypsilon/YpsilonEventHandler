# YpsilonEventHandler

A production-ready event handling system for web applications with built-in debugging, memory leak prevention, and method chaining support.

## Features

- 🔗 Method chaining support
- 📝 Comprehensive console logging management
- 🎯 Passive event listeners are set auto via default
- 🐛 Built-in error handling and debugging
- 🧹 Automatic cleanup of event listeners
- 🧠 Memory-efficient design using native handleEvent interface
- 🔍 Debug helpers for event listener tracking

## Installation

```html
<script type="text/javascript" src="ypsilon-event-handler.js"></script>
```

## Quick Start

```js
// Create a new instance
const eventHandler = new YpsilonEventHandler({
    enableConsole: true // Enable debug logging
});

// Use method chaining
eventHandler
    .enableConsoleNotifications()
    .registerEventListener(
        document.getElementById('myButton'),
        'click',
        (event, target) => {
            console.log('Button clicked!');
        }
    );

// Clean up when done
eventHandler.destroy();
```

## Documentation

### Constructor Options

```js
const options = {
    eventFunctionMap: {}, // Custom mapping of event types to handler methods
    enableConsole: false, // Enable console logging by default
    testPassive: true,   // Test for passive event listener support on init
    eventMapping: {}     // Event mapping configuration
};
```

```js
// A click handler in a glimpse.
document.addEventListener ("DOMContentLoaded", () => {
    new YpsilonEventHandler({
        eventMapping: {
            app: {
                element: 'main',
                events: [{ type: 'click', handler: 'handleClick' }]
            }
        }
    }).handleClick = (event, target) => {
        alert('Hello from #my-app!');
    };
});
```

### API Methods

- `enableConsoleNotifications()`: Enable debug logging
- `disableConsoleNotifications()`: Disable debug logging
- `registerEventListener()`: Manually register an event listener
- `removeAllEventListeners()`: Remove all registered listeners
- `destroy()`: Clean up all event listeners
- `getEventListenerDebugInfo()`: Get debug information about registered listeners

### Live Demo

Check out our [example page](example/public/index.html) for live demonstrations.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- Jean Claude Sonnet the 4.th by Anthropic
- Engin Ypsilon by class:Parent()
