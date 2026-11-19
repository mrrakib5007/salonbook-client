import React from "react";
import Link from "next/link";
import {
  LuArrowRight,
  LuBadgeCheck,
  LuCalendarClock,
  LuCreditCard,
  LuSearch,
} from "react-icons/lu";

interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepItem[] = [
  {
    step: "01",
    title: "Pick a service",
    description: "Search or filter by category and price.",
    icon: LuSearch,
  },
  {
    step: "02",
    title: "Request a time",
    description: "Choose a date and an available slot.",
    icon: LuCalendarClock,
  },
  {
    step: "03",
    title: "We confirm",
    description: "The salon reviews and confirms your request.",
    icon: LuBadgeCheck,
  },
  {
    step: "04",
    title: "Pay securely",
    description: "Pay from your dashboard once confirmed.",
    icon: LuCreditCard,
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-175 h-87.5 bg-brand-light/70 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto"> 
          <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900">
            How SalonBook works
          </h2>

          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-stone-600">
            Booking your favorite salon service is effortless, transparent, and
            completely seamless from start to finish.
          </p>
        </div>

        {/* 4 Steps Grid with connecting line on desktop */}
        <div className="relative mt-14 sm:mt-16">
          {/* Connecting line for large screens */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-brand-primary/20 z-0"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 lg:gap-8 relative z-10">
            {STEPS.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className="group relative flex flex-col items-center rounded-3xl border border-stone-200/80 bg-white p-7 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary/30 hover:shadow-xl focus:outline-none"
                >
                  {/* Step Pill */}
                  <span className="inline-flex items-center justify-center rounded-full border border-brand-primary/15 bg-brand-light px-3.5 py-1 text-xs font-bold tracking-wider text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
                    Step {item.step}
                  </span>

                  {/* Icon Squircle Badge */}
                  <div className="mt-5 flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-light text-brand-primary shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-white">
                    <Icon className="text-3xl" />
                  </div>

                  {/* Step Title & Description */}
                  <h3 className="mt-5 font-fraunces text-xl font-semibold text-stone-900 transition-colors duration-200 group-hover:text-brand-primary">
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-12 sm:mt-14 rounded-3xl bg-brand-light/50 border border-brand-primary/15 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-fraunces text-lg sm:text-xl font-semibold text-stone-900">
              Ready to refresh your style?
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Explore our verified beauty treatments and request your appointment today.
            </p>
          </div>

          <Link
            href="/services"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-lg focus:outline-none"
          >
            <span>Book an Appointment</span>
            <LuArrowRight className="text-base" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
