
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

# The main technology stack:
  * Angular 21
  * Angular Material
  * Lazy routes
  * Zoneless change detection
  * @if / @for / @defer
  * Standalone components
  * Signals, SignalStore

===============================================================================


### Key Technologies & Architecture

*   **Framework**: [Angular](https://angular.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Components**: [Angular Material](https://material.angular.io/)
*   **State Management**: [@ngrx/signals](https://ngrx.io/guide/signals) for reactive, signal-based state management.
*   **Styling**: SCSS, with a global theme defined in `src/app/core/theme/`.
*   **Architecture**: The project follows a **feature-sliced design**. located in `src/app/features/`. These features are lazy-loaded via the router for better performance.
*   **Code Quality**: The project is configured with **ESLint** for linting and **Prettier** for consistent code formatting.

## 3. Development Conventions
*   **State Management**: Business logic and application state are managed within dedicated stores using `@ngrx/signals`. Each feature module typically has its own store. These stores encapsulate state, computed values (derivations of state), and methods (actions that modify state).
*   **Component Structure**: Components should be lean. Complex logic should reside in services or state stores, which are then injected into components.
*   **Routing**: The application uses a centralized routing configuration (`src/app/app.routes.ts`) that lazy-loads feature-specific routes from their respective modules. An `authGuard` protects the main application routes.
*   **API Interaction**: API calls are handled by dedicated services. These services are typically injected into state stores to fetch or push data.
*   **Styling**: Adhere to the existing SCSS structure. Global styles are in `src/styles.scss`, and component-specific styles are co-located with their components. Use Angular Material components wherever possible to maintain a consistent look and feel.
