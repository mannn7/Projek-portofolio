import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const AUDIO_POSITION_KEY = 'fadev-ambient-audio-position';
const AUDIO_STARTED_KEY = 'fadev-ambient-audio-started';
const AUDIO_SOURCE_KEY = 'fadev-ambient-audio-source';
const PUBLIC_AUDIO_PATHS = ['/', '/projects/'];

export type AmbientAudioSettings = {
    source: string | null;
    volume: number;
    enabled: boolean;
    loop: boolean;
};

const hasAudioSettings = (value: unknown): value is AmbientAudioSettings => {
    if (typeof value !== 'object' || value === null) return false;

    const settings = value as Record<string, unknown>;

    return (
        (typeof settings.source === 'string' || settings.source === null) &&
        typeof settings.volume === 'number' &&
        typeof settings.enabled === 'boolean' &&
        typeof settings.loop === 'boolean'
    );
};

const isAudioRoute = () => {
    const { pathname } = window.location;

    return (
        pathname === PUBLIC_AUDIO_PATHS[0] ||
        pathname.startsWith(PUBLIC_AUDIO_PATHS[1])
    );
};

export default function AmbientAudio({
    initialSettings,
}: {
    initialSettings: AmbientAudioSettings;
}) {
    const [ambientAudio, setAmbientAudio] = useState(initialSettings);
    const audioRef = useRef<HTMLAudioElement>(null);
    const startedRef = useRef(false);
    const routeAllowsAudioRef = useRef(false);
    const lastStoredSecondRef = useRef(-1);

    useEffect(() => {
        return router.on('navigate', (event) => {
            const settings = event.detail.page.props.ambientAudio;

            if (hasAudioSettings(settings)) {
                setAmbientAudio(settings);
            }
        });
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const sourceChanged =
            sessionStorage.getItem(AUDIO_SOURCE_KEY) !== ambientAudio.source;

        audio.volume = Math.min(1, Math.max(0, ambientAudio.volume / 100));
        audio.loop = ambientAudio.loop;
        routeAllowsAudioRef.current =
            ambientAudio.enabled &&
            Boolean(ambientAudio.source) &&
            isAudioRoute();
        startedRef.current = sessionStorage.getItem(AUDIO_STARTED_KEY) === '1';

        if (sourceChanged) {
            sessionStorage.removeItem(AUDIO_POSITION_KEY);
            lastStoredSecondRef.current = -1;
            if (ambientAudio.source) {
                sessionStorage.setItem(AUDIO_SOURCE_KEY, ambientAudio.source);
            } else {
                sessionStorage.removeItem(AUDIO_SOURCE_KEY);
            }
        }

        const restorePosition = () => {
            const storedPosition = Number(
                sessionStorage.getItem(AUDIO_POSITION_KEY),
            );

            if (
                Number.isFinite(storedPosition) &&
                storedPosition > 0 &&
                Number.isFinite(audio.duration) &&
                audio.duration > 0
            ) {
                audio.currentTime = storedPosition % audio.duration;
            }
        };

        const storePosition = () => {
            const second = Math.floor(audio.currentTime);
            if (
                !Number.isFinite(second) ||
                second === lastStoredSecondRef.current
            )
                return;

            lastStoredSecondRef.current = second;
            sessionStorage.setItem(
                AUDIO_POSITION_KEY,
                String(audio.currentTime),
            );
        };

        const startPlayback = () => {
            if (!routeAllowsAudioRef.current || document.hidden) return;

            void audio
                .play()
                .then(() => {
                    startedRef.current = true;
                    sessionStorage.setItem(AUDIO_STARTED_KEY, '1');
                    removeUnlockListeners();
                })
                .catch(() => {
                    // Audible autoplay is retried on the visitor's next gesture.
                });
        };

        const unlockEvents: Array<keyof DocumentEventMap> = [
            'pointerdown',
            'touchstart',
            'keydown',
        ];

        function removeUnlockListeners() {
            unlockEvents.forEach((event) =>
                document.removeEventListener(event, startPlayback),
            );
        }

        const handleVisibilityChange = () => {
            if (document.hidden || !routeAllowsAudioRef.current) {
                audio.pause();
            } else if (startedRef.current) {
                startPlayback();
            }
        };

        const syncRoutePlayback = () => {
            routeAllowsAudioRef.current =
                ambientAudio.enabled &&
                Boolean(ambientAudio.source) &&
                isAudioRoute();

            if (!routeAllowsAudioRef.current) {
                audio.pause();
                return;
            }

            if (startedRef.current) startPlayback();
        };

        audio.load();
        if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
            restorePosition();
        } else {
            audio.addEventListener('loadedmetadata', restorePosition, {
                once: true,
            });
        }

        startPlayback();
        unlockEvents.forEach((event) =>
            document.addEventListener(event, startPlayback, { passive: true }),
        );
        audio.addEventListener('timeupdate', storePosition);
        window.addEventListener('pagehide', storePosition);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        const removeNavigateListener = router.on('navigate', syncRoutePlayback);

        return () => {
            removeUnlockListeners();
            removeNavigateListener();
            audio.removeEventListener('loadedmetadata', restorePosition);
            audio.removeEventListener('timeupdate', storePosition);
            window.removeEventListener('pagehide', storePosition);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
            storePosition();
        };
    }, [
        ambientAudio.enabled,
        ambientAudio.loop,
        ambientAudio.source,
        ambientAudio.volume,
    ]);

    if (!ambientAudio.source) return null;

    return (
        <audio
            ref={audioRef}
            loop={ambientAudio.loop}
            preload="metadata"
            aria-hidden="true"
        >
            <source src={ambientAudio.source} />
        </audio>
    );
}
