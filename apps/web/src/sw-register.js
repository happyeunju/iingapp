export function registerServiceWorker() {
    if (!("serviceWorker" in navigator))
        return;
    if (import.meta.env.DEV)
        return; // 개발 중에는 등록 안 함
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
            console.error("[sw] register failed", err);
        });
    });
}
