"use client";

import React, { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, placeholder }) {
    const editorRef = useRef(null);
    const quillInstance = useRef(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoaded.current && editorRef.current) {
            isLoaded.current = true; // Set immediately to prevent double init

            const initQuill = async () => {
                try {
                    // Import Quill dynamically
                    const Quill = (await import('quill')).default;

                    // Try to use the image resize module if compatible, or fallback/remove if it breaks
                    // Note: 'quill-image-resize-module-react' might depend on 'react-quill'. 
                    // If it breaks, we might need to swap to 'quill-image-resize-module' or similar.
                    // For now, let's keep it but handle potential import error.
                    let ImageResize = null;
                    try {
                        ImageResize = (await import('quill-image-resize-module-react')).default;
                    } catch (e) {
                        console.warn('Image resize module load failed:', e);
                    }

                    if (ImageResize && !Quill.imports['modules/imageResize']) {
                        Quill.register('modules/imageResize', ImageResize);
                    }

                    // Add custom fonts or sizes
                    const Size = Quill.import('attributors/style/size');
                    Size.whitelist = ['small', 'medium', 'large', 'huge'];
                    Quill.register(Size, true);

                    // Check if editor already has a child (double safety)
                    if (editorRef.current.children.length > 0) {
                        return;
                    }

                    const modules = {
                        toolbar: {
                            container: [
                                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                [{ 'font': [] }],
                                [{ 'size': ['small', false, 'large', 'huge'] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                [{ 'align': [] }],
                                ['link', 'image', 'video'],
                                ['clean']
                            ],
                            handlers: {
                                image: imageHandler
                            }
                        }
                    };

                    if (ImageResize) {
                        modules.imageResize = {
                            parchment: Quill.import('parchment'),
                            modules: ['Resize', 'DisplaySize', 'Toolbar']
                        };
                    }

                    const quill = new Quill(editorRef.current, {
                        theme: 'snow',
                        modules: modules,
                        placeholder: placeholder || "เริ่มเขียนเนื้อหา..."
                    });

                    quillInstance.current = quill;

                    // Set initial value
                    if (value) {
                        quill.clipboard.dangerouslyPasteHTML(value);
                    }

                    // Listen for changes
                    quill.on('text-change', () => {
                        if (onChange) {
                            onChange(quill.root.innerHTML);
                        }
                    });

                    // Image Handler definition
                    function imageHandler() {
                        const input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');
                        input.click();

                        input.onchange = async () => {
                            const file = input.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append('file', file);

                            const range = quill.getSelection(true);
                            if (!range) return;

                            // Insert placeholder
                            quill.insertText(range.index, 'กำลังอัปโหลด...', 'bold', true);

                            try {
                                const res = await fetch('/web/api/upload', {
                                    method: 'POST',
                                    body: formData
                                });
                                const data = await res.json();

                                quill.deleteText(range.index, 'กำลังอัปโหลด...'.length);

                                if (data.success) {
                                    quill.insertEmbed(range.index, 'image', data.url);
                                    quill.setSelection(range.index + 1);
                                } else {
                                    alert('อัปโหลดล้มเหลว: ' + (data.error || 'Unknown error'));
                                    quill.deleteText(range.index, 'กำลังอัปโหลด...'.length);
                                }
                            } catch (error) {
                                console.error('Upload error:', error);
                                quill.deleteText(range.index, 'กำลังอัปโหลด...'.length);
                                alert('เกิดข้อผิดพลาดในการอัปโหลด');
                            }
                        };
                    }

                } catch (error) {
                    console.error("Error initializing text editor:", error);
                    isLoaded.current = false; // Reset on error so we can try again if needed
                }
            };

            initQuill();
        }

        // Cleanup function to destroy quill instance if component unmounts
        return () => {
            // In strict mode, we might want to clean up. 
            // But since we want to persist across re-renders in dev if not unmounted...
            // Actually, if we unmount, we should ideally clean up.
            // But Quill modifies the DOM. 
            // If we just return, React might remove the node.
        };
    }, []);

    // Handle external value changes
    useEffect(() => {
        if (quillInstance.current && value) {
            // Only update if editor is empty (initial load) to avoid cursor jumping issues
            // or overwriting user progress if parent state is slow to update.
            // A better check: Compare content?
            // For now, adhere to the previous logic which was deemed safe enough for this specific app.
            if (quillInstance.current.getLength() <= 1 && value) {
                quillInstance.current.clipboard.dangerouslyPasteHTML(value);
            }
        }
    }, [value]);

    return (
        <div className="rich-text-editor">
            <div ref={editorRef} style={{ height: '400px', marginBottom: '50px', background: 'white' }} />
            <style jsx global>{`
                .ql-editor {
                    min-height: 400px;
                    font-size: 16px;
                    line-height: 1.6;
                }
                .ql-toolbar.ql-snow {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    background: #f8fafc;
                }
                .ql-container.ql-snow {
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    background: white;
                }
            `}</style>
        </div>
    );
};
