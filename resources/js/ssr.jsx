import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route } from 'ziggy-js';
import { Toaster } from 'react-hot-toast';

import TenantGlobalLayout from './Layouts/TenantGlobalLayout';

const appName = 'PixelMaster sGTM';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
            
            const path = `./Pages/${name}.tsx`;
            const altPath = `./Pages/${name}.jsx`;
            
            const importFn = pages[path] || pages[altPath];

            if (!importFn) {
                return Promise.reject(new Error(`Page not found: ${name}`));
            }

            return importFn().then((module) => {
                if (module.default) {
                    module.default.layout = module.default.layout || ((p) => <TenantGlobalLayout children={p} />);
                }
                return module;
            });
        },
        setup: ({ App, props }) => {
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            return (
                <>
                    <App {...props} />
                    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
                </>
            );
        },
    })
);
