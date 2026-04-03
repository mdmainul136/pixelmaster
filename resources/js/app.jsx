import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { route } from 'ziggy-js';
import { Toaster } from 'react-hot-toast';

window.route = route;

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'PixelMaster sGTM';

import TenantGlobalLayout from './Layouts/TenantGlobalLayout';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        let path = `./Pages/${name}.tsx`;
        if (!pages[path]) {
            path = `./Pages/${name}.jsx`;
        }
        const page = await resolvePageComponent(path, pages);
        page.default.layout = page.default.layout ?? ((page) => <TenantGlobalLayout>{page}</TenantGlobalLayout>);
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            </>
        );
    },
    progress: {
        color: '#2563eb',
        showSpinner: true,
    },
});
