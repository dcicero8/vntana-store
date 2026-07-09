type LoaderType<T> = () => Promise<{
    created?: string;
    expires?: string;
    data: T;
}>;

export type { LoaderType as L };
