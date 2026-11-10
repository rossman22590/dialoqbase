import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import {
    RocketLaunchIcon,
    CpuChipIcon,
    CircleStackIcon,
    PaintBrushIcon,
    GlobeAltIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";

const steps = [
    {
        id: "welcome",
        eyebrow: "Welcome",
        title: "Welcome to Botcraft Pro",
        description:
            "Build chat bots that answer from your own material: course notes, documents and websites. Here's how it works in four short steps.",
        icon: RocketLaunchIcon,
    },
    {
        id: "data",
        eyebrow: "Step 1 of 4",
        title: "Add your sources",
        description:
            "Upload files (PDF, Word, CSV, text, audio or video) or point a bot at a web page, a whole site, a sitemap or a REST API. Your bot answers from what you give it.",
        icon: CircleStackIcon,
    },
    {
        id: "brain",
        eyebrow: "Step 2 of 4",
        title: "Pick a model",
        description:
            "Choose the chat model that writes the answers. You can change it, along with the bot's instructions, any time in its settings.",
        icon: CpuChipIcon,
    },
    {
        id: "style",
        eyebrow: "Step 3 of 4",
        title: "Make it yours",
        description:
            "Change how the chat widget looks in Appearance so it fits your site.",
        icon: PaintBrushIcon,
    },
    {
        id: "deploy",
        eyebrow: "Step 4 of 4",
        title: "Put it to work",
        description:
            "Embed it on your website, or connect it to Telegram, Discord or WhatsApp. Every answer uses credits, which you can track on Usage & billing.",
        icon: GlobeAltIcon,
    },
    {
        id: "finish",
        eyebrow: "All set",
        title: "You're ready to build",
        description:
            "Start by creating your first bot. You can come back to any of these steps later.",
        icon: CheckCircleIcon,
    },
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
    const Icon = current.icon;
    const isLast = currentStep === steps.length - 1;

    return (
        <Modal
            open={isVisible}
            onCancel={handleFinish}
            footer={null}
            width={720}
            centered
            maskClosable={false}
            closeIcon={null}
            styles={{
                content: { padding: 0, overflow: "hidden", borderRadius: 12 },
                body: { padding: 0 },
            }}
        >
            <div className="flex flex-col bg-surface sm:min-h-[400px] sm:flex-row">
                {/* Step rail */}
                <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-b border-line bg-app px-6 py-5 sm:w-[220px] sm:flex-col sm:items-start sm:justify-start sm:border-b-0 sm:border-r sm:py-8">
                    <span
                        aria-hidden="true"
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                    >
                        <Icon className="h-6 w-6" />
                    </span>
                    <ol
                        aria-label="Onboarding steps"
                        className="flex gap-1.5 sm:mt-6 sm:flex-col sm:gap-2"
                    >
                        {steps.map((step, i) => (
                            <li
                                key={step.id}
                                aria-current={i === currentStep ? "step" : undefined}
                                className="flex items-center gap-2 text-[13px]"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === currentStep
                                            ? "w-5 bg-indigo-600 dark:bg-indigo-400"
                                            : i < currentStep
                                            ? "w-1.5 bg-indigo-300 dark:bg-indigo-500/60"
                                            : "w-1.5 bg-line-strong"
                                    }`}
                                />
                                <span
                                    className={`hidden sm:inline ${
                                        i === currentStep
                                            ? "font-medium text-fg"
                                            : "text-fg-subtle"
                                    }`}
                                >
                                    {step.title}
                                </span>
                                <span className="sr-only sm:hidden">{step.title}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col p-6 sm:p-8">
                    <div key={current.id} className="animate-fade-in" aria-live="polite">
                        <p className="text-xs font-semibold text-fg-subtle">
                            {current.eyebrow}
                        </p>
                        <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.01em] text-fg">
                            {current.title}
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
                            {current.description}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 sm:mt-auto">
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="ui-btn-ghost -ml-3"
                        >
                            Skip
                        </button>

                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="ui-btn-secondary h-10 px-4"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="ui-btn-primary h-10 px-4"
                            >
                                {isLast ? "Get started" : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
