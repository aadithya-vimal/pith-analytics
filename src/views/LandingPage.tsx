// src/views/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, Sparkles, Zap, Brain, BarChart3, Code2, Shield, Gauge, Lock, Server, Cpu, TrendingUp, FileCode, Layers, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const { setTheme, theme } = useTheme();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleGetStarted = () => {
        navigate('/app');
    };

    return (
        <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            {/* Theme Toggle - Fixed Position */}
            <div className="fixed top-6 right-6 z-50">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="relative h-12 w-12 rounded-full glass-hover border border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 overflow-hidden"
                    title="Toggle Theme"
                >
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out dark:rotate-90 dark:scale-0">
                        <Sun className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out rotate-90 scale-0 dark:rotate-0 dark:scale-100">
                        <Moon className="h-6 w-6 text-teal-400" />
                    </div>
                </button>
            </div>

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
                <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in border border-teal-500/20">
                        <Zap className="w-4 h-4 text-teal-400" />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Powered by WebAssembly & AI</span>
                    </div>

                    {/* Logo */}
                    <div className="mb-8 animate-scale-in">
                        <img src="/logo.jpg" alt="Pith Analytics" className="w-32 h-32 mx-auto rounded-3xl shadow-2xl shadow-teal-500/20" />
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        Data Analytics
                        <br />
                        <span className="gradient-text-data">Reimagined</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Enterprise-grade analytics running entirely in your browser. Lightning-fast, AI-powered, and completely local.
                    </p>

                    {/* Key Value Props */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                            <Lock className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>100% Private</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                            <Server className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No Backend Required</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 dark:border-white/10 border-black/10">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Instant Processing</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleGetStarted}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/50 text-white"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
                        {[
                            { icon: Database, label: 'DuckDB WASM', value: 'Powered' },
                            { icon: Cpu, label: 'WebGPU AI', value: 'Enabled' },
                            { icon: Shield, label: 'Zero Server', value: 'Calls' }
                        ].map((stat, i) => (
                            <div key={i} className="glass rounded-2xl p-6 border border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30 transition-all animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                <stat.icon className="w-8 h-8 text-teal-400 mb-3 mx-auto" />
                                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.label}</div>
                                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            Everything You Need
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            A complete data analytics platform that runs entirely in your browser
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Database,
                                title: 'In-Browser Processing',
                                description: 'Process millions of rows with DuckDB WASM. No data leaves your device.',
                                color: 'teal',
                                details: [
                                    'Lightning-fast SQL queries',
                                    'Support for CSV, JSON, Parquet',
                                    'Handles datasets up to 2GB+'
                                ]
                            },
                            {
                                icon: Brain,
                                title: 'Edge AI Analytics',
                                description: 'Run LLMs locally with WebGPU. Get insights without cloud APIs.',
                                color: 'emerald',
                                details: [
                                    'Multiple AI models to choose from',
                                    'Natural language to SQL',
                                    'Intelligent data insights'
                                ]
                            },
                            {
                                icon: BarChart3,
                                title: 'Interactive Visualizations',
                                description: 'Create stunning charts with Mosaic. Explore your data visually.',
                                color: 'cyan',
                                details: [
                                    'Multiple chart types',
                                    'Real-time interactivity',
                                    'Export-ready graphics'
                                ]
                            },
                            {
                                icon: Code2,
                                title: 'SQL Console',
                                description: 'Write and execute SQL queries with a professional code editor.',
                                color: 'teal',
                                details: [
                                    'Syntax highlighting',
                                    'Query history',
                                    'Performance metrics'
                                ]
                            },
                            {
                                icon: Shield,
                                title: 'Complete Privacy',
                                description: 'Your data never leaves your browser. Zero server uploads.',
                                color: 'emerald',
                                details: [
                                    'No telemetry or tracking',
                                    'Works offline',
                                    'GDPR compliant by design'
                                ]
                            },
                            {
                                icon: Gauge,
                                title: 'Blazing Fast',
                                description: 'WebAssembly and WebGPU deliver native-like performance.',
                                color: 'cyan',
                                details: [
                                    'Sub-second query times',
                                    'GPU-accelerated AI',
                                    'Optimized for modern browsers'
                                ]
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="glass-hover rounded-2xl p-8 border border-white/10 dark:border-white/10 border-black/10 group animate-scale-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-${feature.color}-500/20`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.details.map((detail, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-400`} />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className="relative px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            Powered by Modern Web Technologies
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Built on cutting-edge browser APIs and open-source technologies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Database,
                                title: 'DuckDB WASM',
                                description: 'In-process analytical database compiled to WebAssembly for lightning-fast SQL queries directly in your browser.',
                                gradient: 'from-teal-500 to-emerald-500'
                            },
                            {
                                icon: Brain,
                                title: 'WebLLM',
                                description: 'Run large language models locally using WebGPU acceleration. Choose from Llama, Phi, Qwen, Gemma, and Mistral.',
                                gradient: 'from-emerald-500 to-cyan-500'
                            },
                            {
                                icon: BarChart3,
                                title: 'Mosaic',
                                description: 'Scalable interactive visualization framework for creating responsive, data-driven charts and dashboards.',
                                gradient: 'from-cyan-500 to-teal-500'
                            },
                            {
                                icon: Cpu,
                                title: 'WebGPU',
                                description: 'Next-generation graphics API for GPU-accelerated AI inference and high-performance computing in the browser.',
                                gradient: 'from-teal-500 to-emerald-500'
                            }
                        ].map((tech, i) => (
                            <div
                                key={i}
                                className="glass-hover rounded-2xl p-8 border border-white/10 dark:border-white/10 border-black/10 group animate-slide-up"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <tech.icon className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{tech.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tech.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className="relative px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            Enterprise Architecture, Zero Infrastructure
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: FileCode, title: 'WebAssembly Core', description: 'Compiled C++ database engine running at near-native speed' },
                            { icon: Cpu, title: 'WebGPU Compute', description: 'GPU-accelerated AI inference for real-time insights' },
                            { icon: Layers, title: 'React Frontend', description: 'Modern UI with TypeScript and Tailwind CSS' },
                            { icon: Database, title: 'IndexedDB Storage', description: 'Persistent browser storage for your datasets' },
                            { icon: TrendingUp, title: 'Streaming Processing', description: 'Handle large files with chunked ingestion' },
                            { icon: Shield, title: 'Client-Side Only', description: 'No servers, no APIs, no data transmission' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="glass rounded-xl p-6 border border-white/10 dark:border-white/10 border-black/10 hover:border-teal-500/30 transition-all animate-fade-in"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <item.icon className="w-6 h-6 text-teal-400 mb-3" />
                                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass rounded-3xl p-12 border border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                            Ready to Transform Your Data Workflow?
                        </h2>
                        <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Start analyzing your data with enterprise-grade tools, completely free and private.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/50 text-white"
                        >
                            Launch Pith Analytics
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
