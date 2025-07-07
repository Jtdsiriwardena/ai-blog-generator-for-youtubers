'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    if (!editor) {
        return (
            <div className="animate-pulse bg-slate-200 rounded-xl h-64 flex items-center justify-center">
                <div className="text-slate-500">Loading editor...</div>
            </div>
        );
    }

    const chain = editor.chain();

    // Button component
    const ToolbarButton = ({
        onClick,
        disabled = false,
        active = false,
        children,
        icon,
        variant = 'default'
    }: {
        onClick: () => void;
        disabled?: boolean;
        active?: boolean;
        children: React.ReactNode;
        icon: React.ReactNode;
        variant?: 'default' | 'success' | 'danger';
    }) => {
        const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 border";

        let variantClasses = "";
        if (variant === 'success') {
            variantClasses = "bg-green-500 hover:bg-green-600 text-white border-green-500";
        } else if (variant === 'danger') {
            variantClasses = "bg-red-500 hover:bg-red-600 text-white border-red-500";
        } else if (active) {
            variantClasses = "bg-blue-500 text-white border-blue-500 shadow-md";
        } else {
            variantClasses = "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300";
        }

        const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm";

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                type="button"
                className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
            >
                {icon}
                <span className="hidden sm:inline">{children}</span>
            </button>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-4">
                <div className="flex flex-wrap gap-2">
                    {/* Text Formatting */}
                    <div className="flex gap-2 items-center">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            active={editor.isActive('bold')}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 4a1 1 0 011-1h3a3 3 0 110 6H6v2h3a3 3 0 110 6H6a1 1 0 01-1-1V4zm2 1v4h2a1 1 0 100-2H7zm0 6v4h2a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Bold
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            active={editor.isActive('italic')}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 2a1 1 0 011 1v.5L10.5 4a1 1 0 010 2L9 6.5v7L10.5 14a1 1 0 010 2L9 16.5v.5a1 1 0 01-2 0v-.5L5.5 16a1 1 0 010-2L7 13.5v-7L5.5 6a1 1 0 010-2L7 3.5V3a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Italic
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            disabled={!editor.can().chain().focus().toggleUnderline().run()}
                            active={editor.isActive('underline')}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v6a5 5 0 0010 0V4M7 20h10" />
                                </svg>
                            }
                        >
                            Underline
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => chain.focus().toggleStrike().run()}
                            disabled={!editor.can().chain().focus().toggleStrike().run()}
                            active={editor.isActive('strike')}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18m-9-9v18" />
                                </svg>
                            }
                        >
                            Strike
                        </ToolbarButton>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-8 bg-slate-300"></div>

                    {/* Lists */}
                    <div className="flex gap-2 items-center">
                        <ToolbarButton
                            onClick={() => chain.focus().toggleBulletList().run()}
                            active={editor.isActive('bulletList')}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Bullet List
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => chain.focus().toggleOrderedList().run()}
                            active={editor.isActive('orderedList')}
                            icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            }
                        >
                            Numbered List
                        </ToolbarButton>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-8 bg-slate-300"></div>

                    {/* Links */}
                    <div className="flex gap-2 items-center">
                        {!editor.isActive('link') ? (
                            <ToolbarButton
                                onClick={() => setShowLinkInput(!showLinkInput)}
                                active={showLinkInput}
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                }
                            >
                                Add Link
                            </ToolbarButton>
                        ) : (
                            <ToolbarButton
                                onClick={() => chain.focus().unsetLink().run()}
                                variant="danger"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    </svg>
                                }
                            >
                                Remove Link
                            </ToolbarButton>
                        )}
                    </div>

                    {/* Separator */}
                    <div className="w-px h-8 bg-slate-300"></div>

                    {/* History */}
                    <div className="flex gap-2 items-center">
                        <ToolbarButton
                            onClick={() => chain.focus().undo().run()}
                            disabled={!editor.can().chain().focus().undo().run()}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            }
                        >
                            Undo
                        </ToolbarButton>

                        <ToolbarButton
                            onClick={() => chain.focus().redo().run()}
                            disabled={!editor.can().chain().focus().redo().run()}
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                                </svg>
                            }
                        >
                            Redo
                        </ToolbarButton>
                    </div>
                </div>

                {/* Link Input */}
                {showLinkInput && (
                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Enter URL (e.g., https://example.com)"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        if (linkUrl) {
                                            chain.focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                                        }
                                        setLinkUrl('');
                                        setShowLinkInput(false);
                                    }
                                }}
                            />
                            <ToolbarButton
                                onClick={() => {
                                    if (linkUrl) {
                                        chain.focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                                    }
                                    setLinkUrl('');
                                    setShowLinkInput(false);
                                }}
                                variant="success"
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                }
                            >
                                Add
                            </ToolbarButton>
                            <ToolbarButton
                                onClick={() => {
                                    setShowLinkInput(false);
                                    setLinkUrl('');
                                }}
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                }
                            >
                                Cancel
                            </ToolbarButton>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Content */}
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className="prose prose-slate max-w-none p-6 min-h-[300px] focus-within:bg-slate-50/50 transition-colors duration-200"
                />

                {/* Editor Styles */}
                <style jsx global>{`
                    .ProseMirror {
                        outline: none;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #334155;
                    }
                    
                    .ProseMirror h1 {
                        font-size: 2rem;
                        font-weight: 700;
                        margin-top: 2rem;
                        margin-bottom: 1rem;
                        color: #1e293b;
                    }
                    
                    .ProseMirror h2 {
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin-top: 1.5rem;
                        margin-bottom: 0.75rem;
                        color: #1e293b;
                    }
                    
                    .ProseMirror h3 {
                        font-size: 1.25rem;
                        font-weight: 600;
                        margin-top: 1.25rem;
                        margin-bottom: 0.5rem;
                        color: #1e293b;
                    }
                    
                    .ProseMirror p {
                        margin-bottom: 1rem;
                    }
                    
                    .ProseMirror ul, .ProseMirror ol {
                        margin-bottom: 1rem;
                        padding-left: 1.5rem;
                    }
                    
                    .ProseMirror li {
                        margin-bottom: 0.25rem;
                    }
                    
                    .ProseMirror a {
                        color: #3b82f6;
                        text-decoration: underline;
                        text-underline-offset: 2px;
                    }
                    
                    .ProseMirror a:hover {
                        color: #1d4ed8;
                    }
                    
                    .ProseMirror strong {
                        font-weight: 600;
                        color: #1e293b;
                    }
                    
                    .ProseMirror em {
                        font-style: italic;
                    }
                    
                    .ProseMirror code {
                        background-color: #f1f5f9;
                        padding: 0.125rem 0.25rem;
                        border-radius: 0.25rem;
                        font-family: 'Courier New', monospace;
                        font-size: 0.875rem;
                    }
                    
                    .ProseMirror blockquote {
                        border-left: 4px solid #cbd5e1;
                        padding-left: 1rem;
                        margin: 1rem 0;
                        font-style: italic;
                        color: #64748b;
                    }
                    
                    .ProseMirror hr {
                        border: none;
                        border-top: 2px solid #e2e8f0;
                        margin: 2rem 0;
                    }
                `}</style>
            </div>
        </div>
    );
}