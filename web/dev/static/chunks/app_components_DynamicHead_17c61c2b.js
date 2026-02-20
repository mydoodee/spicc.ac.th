(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/DynamicHead.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DynamicHead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function DynamicHead() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicHead.useEffect": ()=>{
            const fetchSettings = {
                "DynamicHead.useEffect.fetchSettings": async ()=>{
                    try {
                        const res = await fetch("/web/api/settings");
                        const data = await res.json();
                        if (data.success && data.settings) {
                            const { site_name, site_title_suffix, site_favicon_url } = data.settings;
                            // Update Title
                            if (site_name || site_title_suffix) {
                                const fullTitle = [
                                    site_name,
                                    site_title_suffix
                                ].filter(Boolean).join(" | ");
                                document.title = fullTitle;
                            }
                            // Update Favicon
                            if (site_favicon_url) {
                                let link = document.querySelector("link[rel~='icon']");
                                if (!link) {
                                    link = document.createElement('link');
                                    link.rel = 'icon';
                                    document.getElementsByTagName('head')[0].appendChild(link);
                                }
                                link.href = site_favicon_url;
                            }
                        }
                    } catch (error) {
                        console.error("Failed to fetch settings for head:", error);
                    }
                }
            }["DynamicHead.useEffect.fetchSettings"];
            fetchSettings();
        }
    }["DynamicHead.useEffect"], []);
    return null;
}
_s(DynamicHead, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = DynamicHead;
var _c;
__turbopack_context__.k.register(_c, "DynamicHead");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_components_DynamicHead_17c61c2b.js.map