import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import GalleryViewer from '@/app/components/GalleryViewer';
import { normalizeHTML } from '@/lib/utils';

export default async function PageView({ params }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    let page;
    try {
        const pages = await query(
            'SELECT * FROM cms_pages WHERE slug = ? AND is_published = 1',
            [decodedSlug]
        );
        if (pages.length === 0) {
            notFound();
        }
        page = pages[0];
    } catch {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#f8f8f5]">
            <Navbar />

            <div className="pt-48 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-xl font-bold text-[#2b4a8a] mb-8 leading-tight">
                        {page.title}
                    </h1>
                    <div className="w-20 h-1.5 bg-[#f2cc0d] rounded-full mb-12"></div>

                    <article
                        className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: normalizeHTML(page.content) }}
                    />

                    {/* Gallery Section */}
                    {page.gallery && <GalleryViewer galleryJson={page.gallery} />}
                </div>
            </div>

            <Footer />
        </main>
    );
}
