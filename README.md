# DirectoryApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Docker Desktop deployment

This project includes a complete Docker configuration for local deployment using Docker Desktop.

### Build Docker image

From the project root directory (`e:/Projects/lets.program/Directory/directory-app`), run:

```bash
docker build -t directory-app .
```

This command creates a `directory-app:latest` image with:
- Multi-stage build (Node.js for compilation → Nginx for serving)
- Optimized production build (~60MB image size)
- First build takes ~8-10 minutes, subsequent builds are faster due to caching

### Run container

```bash
docker run -d --name directory-app -p 10000:10000 directory-app
```

**Parameters:**
- `-d` - Run in detached mode (background)
- `--name directory-app` - Container name
- `-p 10000:10000` - Port mapping (host:container)

### Access application

Open in your browser:
```
http://localhost:10000
```

Or check via terminal:

```bash
# Health check endpoint
curl http://localhost:10000/health

# Main page
curl http://localhost:10000/
```

### Container management

```bash
# Stop container
docker stop directory-app

# Start container again
docker start directory-app

# Remove container
docker rm directory-app

# View logs
docker logs directory-app

# Access container shell (for debugging)
docker exec -it directory-app sh
```

### Monitoring in Docker Desktop

After starting the container:
1. Open Docker Desktop
2. Navigate to the **Containers** section
3. Find the `directory-app` container
4. View logs, ports, and use the terminal directly from the UI

### Rebuild after code changes

```bash
docker stop directory-app
docker rm directory-app
docker build -t directory-app .
docker run -d --name directory-app -p 10000:10000 directory-app
```

### Cleanup

```bash
# Remove all stopped containers
docker container prune

# Remove image
docker rmi directory-app
```

### What should work

After successful deployment, you should see:
- `http://localhost:10000` - Main application (DirectoryApp)
- `http://localhost:10000/health` - Health check (returns "healthy")
- SPA routing working (refresh page without 404 errors)
- Static files cached for 1 year (performance optimization)

## Additional Resources

For more information on using Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.