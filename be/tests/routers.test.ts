const authRouter = require('../src/auth/index').authRouter;
const shopRouter = require('../src/shop/index').shopRouter;
const sweetRouter = require('../src/sweets/index').sweetRouter;
const appModule = require('../src/app');
const app = appModule.default || appModule;

function listRoutes(container:any) {
  const routes = [];
  const stack = container.stack || (container._router && container._router.stack) || [];

  for (const layer of stack) {
    if (!layer) continue;

    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods || {});
      routes.push({ path, methods });
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      for (const nested of layer.handle.stack) {
        if (nested.route) {
          const path = nested.route.path;
          const methods = Object.keys(nested.route.methods || {});
          routes.push({ path, methods });
        }
      }
    }
  }

  return routes;
}

describe('Route registration', () => {
  test('auth routes are registered', () => {
    const routes = listRoutes(authRouter);
    const paths = routes.map(r => r.path);
    expect(paths).toEqual(expect.arrayContaining(['/register', '/login']));
  });

  test('shop routes are registered', () => {
    const routes = listRoutes(shopRouter);
    const paths = routes.map(r => r.path);
    expect(paths).toEqual(expect.arrayContaining(['/register', '/login']));
  });

  test('sweets routes are registered', () => {
    const routes = listRoutes(sweetRouter);
    const paths = routes.map(r => r.path);
    expect(paths).toEqual(expect.arrayContaining([
      '/add', '/bulk', '/search', '/:id/restock', '/:id/purchase', '/update/:id', '/delete/:id'
    ]));
  });

  test('health route exists on app', () => {
    const routes = listRoutes(app);
    const paths = routes.map(r => r.path);
    expect(paths).toEqual(expect.arrayContaining(['/health']));
  });
});
