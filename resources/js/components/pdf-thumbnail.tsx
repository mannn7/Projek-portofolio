import { useEffect, useRef, useState } from 'react';

type PdfThumbnailProps = {
    src: string;
    title: string;
    className?: string;
};

export function PdfThumbnail({
    src,
    title,
    className = '',
}: PdfThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let loadingTask: { destroy: () => Promise<void> } | undefined;

        const renderFirstPage = async () => {
            try {
                const pdfjs = await import('pdfjs-dist');
                pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                    'pdfjs-dist/build/pdf.worker.min.mjs',
                    import.meta.url,
                ).toString();

                const task = pdfjs.getDocument({ url: src });
                loadingTask = task;
                const pdf = await task.promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;

                if (cancelled || !canvas) return;

                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas is unavailable.');

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvas, canvasContext: context, viewport })
                    .promise;
            } catch {
                if (!cancelled) setFailed(true);
            }
        };

        void renderFirstPage();

        return () => {
            cancelled = true;
            void loadingTask?.destroy();
        };
    }, [src]);

    if (failed) {
        return (
            <div
                className={`flex items-center justify-center bg-violet-950/40 text-sm font-semibold text-violet-200 ${className}`}
                role="img"
                aria-label={`${title} preview unavailable`}
            >
                PDF certificate
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={`bg-white object-cover ${className}`}
            role="img"
            aria-label={title}
        />
    );
}
