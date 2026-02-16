import { query } from '@/lib/db';
import { normalizePath } from '@/lib/utils';

async function getHeroData() {
    try {
        const hero = await query('SELECT * FROM cms_hero LIMIT 1');
        if (hero.length > 0) return hero[0];
    } catch (e) {
        console.error("Failed to fetch hero data:", e);
    }
    return null;
}

export default async function Hero() {
    const hero = await getHeroData();

    if (!hero) return null;

    const data = hero;

    const bgOpacity = data.bg_opacity !== undefined ? data.bg_opacity : 0.7;
    const bgFit = data.bg_fit || 'cover';

    return (
        <>
            <section id="home" className="relative min-h-[75vh] max-h-[700px] flex items-center overflow-hidden bg-[#2b4a8a] mt-16">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Hero campus"
                        className="w-full h-full transition-transform duration-700 hover:scale-105"
                        style={{ objectFit: bgFit, objectPosition: 'center 20%' }}
                        src={normalizePath(data.bg_image)}
                    />
                    {/* Enhanced Gradient Overlay */}
                    <div
                        className="absolute inset-0 transition-opacity duration-500"
                        style={{ background: `rgba(43, 74, 138, ${bgOpacity})` }}
                    ></div>
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
                    <div className="max-w-4xl text-left">
                        {data.badge_text && (
                            <div className="inline-block px-3 py-1 bg-[#f2cc0d]/20 backdrop-blur-sm border border-[#f2cc0d]/30 text-[#f2cc0d] rounded-full mb-3 text-sm font-medium animate-fade-in-up shadow-lg">
                                {data.badge_text}
                            </div>
                        )}
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3 animate-fade-in-up animation-delay-200">
                            {data.title_line1} <br />
                            <span className="text-[#f2cc0d] drop-shadow-lg">{data.title_line2}</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-200 mb-5 font-light leading-relaxed animate-fade-in-up animation-delay-300">
                            {data.description}
                        </p>
                        {data.show_buttons == 1 && (
                            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up animation-delay-400 mt-8">
                                {data.btn_primary_text && (
                                    <a href={data.btn_primary_url} target={data.btn_primary_target || "_self"} rel={data.btn_primary_target === "_blank" ? "noopener noreferrer" : undefined} className="bg-[#f2cc0d] hover:bg-yellow-500 text-[#2b4a8a] font-bold px-8 py-3 rounded-xl transition-all text-sm md:text-base shadow-xl shadow-[#f2cc0d]/30 hover:-translate-y-1 hover:shadow-2xl inline-block">
                                        {data.btn_primary_text}
                                    </a>
                                )}
                                {data.btn_secondary_text && (
                                    <a href={data.btn_secondary_url} target={data.btn_secondary_target || "_self"} rel={data.btn_secondary_target === "_blank" ? "noopener noreferrer" : undefined} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-bold px-8 py-3 rounded-xl transition-all text-sm md:text-base hover:-translate-y-1 hover:border-white/50 inline-block">
                                        {data.btn_secondary_text}
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Wavy Divider Bottom */}
                <div className="wavy-divider z-20 pointer-events-none">
                    <svg
                        preserveAspectRatio="none"
                        viewBox="0 0 1200 120"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            fill="#f8f8f5"
                        />
                    </svg>
                </div>
            </section>
        </>
    );
}
