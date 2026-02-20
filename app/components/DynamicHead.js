"use client";
import { useEffect } from "react";
import { normalizePath } from "@/lib/utils";

export default function DynamicHead() {
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/web/api/settings");
                const data = await res.json();
                if (data.success && data.settings) {
                    const { site_name, site_title_suffix, site_favicon_url } = data.settings;

                    // Update Title
                    if (site_name || site_title_suffix) {
                        const fullTitle = [site_name, site_title_suffix].filter(Boolean).join(" | ");
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
                        link.href = normalizePath(site_favicon_url);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings for head:", error);
            }
        };

        fetchSettings();
    }, []);

    return null;
}
