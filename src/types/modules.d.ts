// Type declarations for JavaScript modules without TypeScript definitions
// This file allows TypeScript to import JavaScript modules without errors

declare module '*.js' {
    const content: any;
    export default content;
}

// Axios API client (JavaScript – no types shipped)
declare module './api_client' {
    import { AxiosInstance } from 'axios';
    const client: AxiosInstance;
    export default client;
}

// Page component
declare module 'components/Page' {
    import { FC, ReactNode } from 'react';
    interface PageProps {
        active?: string;
        children?: ReactNode;
    }
    const Page: FC<PageProps>;
    export default Page;
}

// Footer component
declare module 'components/Footer' {
    import { FC } from 'react';
    const Footer: FC;
    export default Footer;
}

// Assets service
declare module 'services/assets' {
    interface AssetsService {
        fetchAssets(window: string, options?: { filter?: string }): Promise<any>;
        fetchAssetCarbon(window: string, options?: { filter?: string }): Promise<any>;
    }
    const service: AssetsService;
    export default service;
}
