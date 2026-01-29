// src/views/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, Sparkles, Zap, Brain, BarChart3, Code2, Shield, Gauge, Lock, Server, Cpu, TrendingUp, FileCode, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleGetStarted = () => {
        navigate('/app');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a] style={{ color: 'var(--text-primary)' }} overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
                <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in border border-teal-500/20">
                        <Zap className="w-4 h-4 text-teal-400" />
                        <span className="text-sm font-medium text-slate-200">Powered by WebAssembly & AI</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        Data Analytics
                        <br />
                        <span className="gradient-text-data">Reimagined</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                        Enterprise-grade analytics running entirely in your browser. Lightning-fast, AI-powered, and completely local.
                    </p>

                    {/* Key Value Props */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-3xl mx-auto">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-slate-300">100% Private</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Server className="w-4 h-4 text-teal-400" />
                            <span className="text-sm text-slate-300">No Backend Required</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                            <Zap className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-slate-300">Instant Processing</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleGetStarted}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-teal-600 to-emerald- hover:from-teal-500 hover:to-emerald- transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/50 mb-20"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
                        {[
                            { label: 'In-Browser Processing', icon: Database, description: 'All data stays on your device' },
                            { label: 'Lightning Performance', icon: Gauge, description: 'Process millions of rows instantly' },
                            { label: 'Enterprise Privacy', icon: Shield, description: 'Zero data transmission' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="glass-hover rounded-2xl p-6 animate-slide-up border border-slate-700/50"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <stat.icon className="w-8 h-8 text-teal-400 mb-3 mx-auto" />
                                <div className="text-sm font-semibold style={{ color: 'var(--text-primary)' }} mb-1">{stat.label}</div>
                                <div className="text-xs text-slate-400">{stat.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 style={{ color: 'var(--text-primary)' }}" style={{ fontFamily: 'var(--font-display)' }}>
                            Powerful Features
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Everything you need for modern data analysis, built with cutting-edge web technologies
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Database,
                                title: 'DuckDB WASM Engine',
                                description: 'Lightning-fast SQL queries running entirely in your browser. Process millions of rows instantly with zero latency. Built on DuckDB, the fastest analytical database.',
                                gradient: 'from-teal-500 to-emerald-',
                                features: ['Sub-second queries', 'Columnar storage', 'Parallel processing']
                            },
                            {
                                icon: Brain,
                                title: 'Local AI Intelligence',
                                description: 'Llama 3.2 AI model running on your device via WebLLM. Get intelligent insights without sending data to the cloud. Complete privacy with enterprise-grade AI.',
                                gradient: 'from-violet-500 to-purple-500',
                                features: ['On-device inference', 'Natural language queries', 'Smart recommendations']
                            },
                            {
                                icon: BarChart3,
                                title: 'Advanced Visualizations',
                                description: 'Beautiful, interactive visualizations powered by Mosaic. Explore your data with responsive charts, graphs, and dashboards. Real-time updates as you analyze.',
                                gradient: 'from-emerald- to-indigo-500',
                                features: ['Interactive charts', 'Real-time updates', 'Custom dashboards']
                            },
                            {
                                icon: Zap,
                                title: 'Instant Data Loading',
                                description: 'No server delays. Everything loads instantly. Import CSV, JSON, and Parquet files directly into your browser. Your data never leaves your machine.',
                                gradient: 'from-emerald-500 to-green-500',
                                features: ['Multiple formats', 'Drag & drop', 'Instant ingestion']
                            },
                            {
                                icon: Code2,
                                title: 'SQL Console',
                                description: 'Full-featured SQL editor with syntax highlighting, auto-completion, and query history. Write complex queries with ease and see results instantly.',
                                gradient: 'from-emerald- to-teal-500',
                                features: ['Syntax highlighting', 'Auto-complete', 'Query history']
                            },
                            {
                                icon: Sparkles,
                                title: 'AI-Powered Insights',
                                description: 'AI-powered analysis that understands your data and suggests meaningful insights. Ask questions in natural language and get instant answers.',
                                gradient: 'from-violet-500 to-pink-500',
                                features: ['Natural language', 'Smart suggestions', 'Automated analysis']
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="glass-hover rounded-3xl p-8 group cursor-pointer animate-scale-in border border-slate-700/50"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="w-7 h-7 style={{ color: 'var(--text-primary)' }}" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 style={{ color: 'var(--text-primary)' }}">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed mb-4">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.features.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                                            <div className="w-1 h-1 rounded-full bg-teal-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-slate-900/20 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 style={{ color: 'var(--text-primary)' }}" style={{ fontFamily: 'var(--font-display)' }}>
                            Built with Cutting-Edge Technology
                        </h2>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            Leveraging the latest web technologies to deliver unparalleled performance and capabilities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                icon: Database,
                                name: 'DuckDB WASM',
                                desc: 'In-browser analytical database',
                                details: 'Columnar storage, vectorized execution, and parallel processing'
                            },
                            {
                                icon: Cpu,
                                name: 'WebLLM',
                                desc: 'Local AI inference engine',
                                details: 'Run large language models directly in your browser with WebGPU'
                            },
                            {
                                icon: Layers,
                                name: 'Mosaic',
                                desc: 'Scalable data visualization',
                                details: 'Interactive visualizations that scale to millions of data points'
                            },
                        ].map((tech, i) => (
                            <div key={i} className="glass rounded-2xl p-8 hover-lift border border-slate-700/50 group">
                                <tech.icon className="w-12 h-12 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="text-2xl font-bold mb-2 gradient-text-data">{tech.name}</div>
                                <div className="text-slate-400 mb-3">{tech.desc}</div>
                                <div className="text-sm text-slate-500">{tech.details}</div>
                            </div>
                        ))}
                    </div>

                    {/* Architecture Highlights */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: FileCode,
                                title: 'WebAssembly Performance',
                                description: 'Near-native performance in the browser with WebAssembly compilation'
                            },
                            {
                                icon: Cpu,
                                title: 'WebGPU Acceleration',
                                description: 'GPU-accelerated AI inference and data processing for maximum speed'
                            },
                            {
                                icon: Lock,
                                title: 'Zero Data Transmission',
                                description: 'All processing happens locally - your data never leaves your device'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Scalable Architecture',
                                description: 'Handle datasets from kilobytes to gigabytes with consistent performance'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 glass-hover rounded-xl border border-slate-700/50">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                        <item.icon className="w-6 h-6 text-teal-400" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold style={{ color: 'var(--text-primary)' }} mb-2">{item.title}</h4>
                                    <p className="text-sm text-slate-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-strong rounded-3xl p-16 border border-slate-700/50">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 style={{ color: 'var(--text-primary)' }}" style={{ fontFamily: 'var(--font-display)' }}>
                            Ready to Transform Your Data Workflow?
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                            Start analyzing your data with the power of AI and WebAssembly. No installation, no servers, no compromises.
                        </p>
                        <button
                            onClick={handleGetStarted}
                            className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-semibold rounded-2xl bg-gradient-to-r from-teal-600 to-emerald- hover:from-teal-500 hover:to-emerald- transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-teal-500/50"
                        >
                            Launch Pith Analytics
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-slate-800">
                <div className="max-w-7xl mx-auto text-center text-slate-500">
                    <p>© 2026 Pith Analytics. Built with React, DuckDB, and WebLLM.</p>
                    <p className="text-sm mt-2 text-slate-600">All processing happens locally in your browser. Your data never leaves your device.</p>
                </div>
            </footer>
        </div>
    );
}
