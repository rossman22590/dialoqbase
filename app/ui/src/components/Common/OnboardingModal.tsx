import React, { useState, useEffect } from "react";
import { Modal, Button } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
    RocketLaunchIcon,
    CpuChipIcon,
    CircleStackIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    SparklesIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
} from "@heroicons/react/24/outline";

const Celebration = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        backgroundColor: ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][i % 5],
                        left: `${Math.random() * 100}%`,
                        top: `-5%`,
                        boxShadow: '0 0 10px currentColor'
                    }}
                    animate={{
                        top: '105%',
                        left: `${(Math.random() - 0.5) * 50 + (i / 30) * 100}%`,
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

const steps = [
    {
        id: "welcome",
        subtitle: "The Future of Engagement",
        title: "Intelligence, Evolved.",
        description: "Welcome to Botcraft Pro. We've redefined how businesses interact with information and customers. Your journey to artificial mastery starts here.",
        icon: <RocketLaunchIcon className="h-12 w-12 text-white" />,
        color: "from-purple-600 to-indigo-600",
        glow: "bg-purple-500/20"
    },
    {
        id: "brain",
        subtitle: "Step 01: Core Logic",
        title: "Neural Architect",
        description: "Deploy the world's most sophisticated LLMs. Whether it's GPT-4o, Claude 3.5, or Gemini, you control the logic, the tone, and the temperment of your agent.",
        icon: <CpuChipIcon className="h-12 w-12 text-white" />,
        color: "from-blue-600 to-cyan-500",
        glow: "bg-blue-500/20"
    },
    {
        id: "data",
        subtitle: "Step 02: Knowledge base",
        title: "Bespoke Wisdom",
        description: "Feed your bot anything: PDFs, URLs, GitHub repositories. Our RAG engine processes data into a specialized vector store, ensuring answers are grounded in 100% factual context.",
        icon: <CircleStackIcon className="h-12 w-12 text-white" />,
        color: "from-emerald-600 to-teal-500",
        glow: "bg-emerald-500/20"
    },
    {
        id: "style",
        subtitle: "Step 03: interface",
        title: "Signature Aesthetics",
        description: "Your bot is an extension of your brand. Customize every pixel—from Chat Bubbles and Avatars to unique color palettes—to create a truly premium user experience.",
        icon: <PaintBrushIcon className="h-12 w-12 text-white" />,
        color: "from-pink-600 to-rose-500",
        glow: "bg-pink-500/20"
    },
    {
        id: "deploy",
        subtitle: "Step 04: Omnipresence",
        title: "Seamless Reach",
        description: "Activate your bot across Telegram, Discord, and WhatsApp instantly. Or embed it into your site with our high-performance Next.js and HTML components.",
        icon: <GlobeAltIcon className="h-12 w-12 text-white" />,
        color: "from-amber-500 to-orange-600",
        glow: "bg-amber-500/20"
    },
    {
        id: "finish",
        subtitle: "Ready for Launch",
        title: "Ignite Your Vision.",
        description: "The platform is ready. Your data is waiting. Go ahead and build the next generation of conversational AI. We're here for the journey.",
        icon: <CheckCircleIcon className="h-14 w-14 text-white" />,
        color: "from-green-500 to-emerald-600",
        glow: "bg-green-500/20"
    }
];

export const OnboardingModal: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // New version ID to force refresh for everyone
        const hasSeenOnboarding = localStorage.getItem("botcraft_onboarding_v2.0");
        if (!hasSeenOnboarding) {
            const timer = setTimeout(() => setIsVisible(true), 1500); // Slight delay for premium feel
            return () => clearTimeout(timer);
        }
    }, []);

    const handleFinish = () => {
        localStorage.setItem("botcraft_onboarding_v2.0", "true");
        setIsVisible(false);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const current = steps[currentStep];

    return (
        <Modal
            open={isVisible}
            onCancel={handleFinish}
            footer={null}
            width={900}
            centered
            maskClosable={false}
            className="premium-onboarding"
            bodyStyle={{ padding: 0 }}
            closeIcon={null} // Cleaner look
        >
            <div className="flex flex-col lg:flex-row min-h-[580px] bg-white dark:bg-[#0A0A0A] overflow-hidden rounded-[32px] font-sans selection:bg-purple-100 dark:selection:bg-purple-900/40">

                {/* Left Side: Visual / Mood */}
                <div className={`relative w-full lg:w-[400px] bg-gradient-to-br ${current.color} overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-700 ease-in-out`}>
                    {/* Background Texture/Animation */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] scale-[2]" />
                        {currentStep === steps.length - 1 && <Celebration />}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 1.2, opacity: 0, rotate: 15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative z-10"
                        >
                            <div className="p-8 bg-white/10 backdrop-blur-3xl rounded-[40px] border border-white/20 shadow-2xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {current.icon}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Custom Vertical Steps for Desktop */}
                    <div className="hidden lg:flex flex-col gap-3 mt-12 relative z-10">
                        {steps.map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    width: currentStep === i ? 40 : 8,
                                    opacity: currentStep === i ? 1 : 0.4
                                }}
                                className="h-1 bg-white rounded-full transition-all duration-300"
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="flex-1 flex flex-col p-10 lg:p-16 relative bg-white dark:bg-[#0A0A0A]">

                    {/* Header / Subtitle */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-3 block">
                                {current.subtitle}
                            </span>
                            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
                                {current.title}
                            </h2>

                            <div className="max-w-md">
                                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                    {current.description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Interactive Preview Concept (Static but looks dynamic) */}
                    <div className={`mt-auto mb-12 p-6 rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center gap-4 transition-all duration-700 ${current.glow}`}>
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${current.color} shadow-lg`}>
                            <SparklesIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-full mb-2" />
                            <div className="h-2 w-2/3 bg-gray-100 dark:bg-gray-800/50 rounded-full" />
                        </div>
                    </div>

                    {/* Footer / Controls */}
                    <div className="flex items-center justify-between mt-auto">
                        <Button
                            type="text"
                            onClick={handleFinish}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-xs p-0 uppercase tracking-widest"
                        >
                            Skip to App
                        </Button>

                        <div className="flex gap-4">
                            {currentStep > 0 && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:hover:border-white/20 transition-all font-bold"
                                >
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                            )}

                            <button
                                onClick={handleNext}
                                className={`group relative overflow-hidden flex items-center gap-3 px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10 dark:shadow-white/5`}
                            >
                                <span className="relative z-10">
                                    {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                                </span>
                                <ChevronRightIcon className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />

                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Global Modal Overrides for this component only */}
                <style dangerouslySetInnerHTML={{
                    __html: `
            .premium-onboarding .ant-modal-content {
                background: transparent !important;
                box-shadow: none !important;
            }
            .premium-onboarding .ant-modal-body {
                background: transparent !important;
            }
        `}} />
            </div>
        </Modal>
    );
};
