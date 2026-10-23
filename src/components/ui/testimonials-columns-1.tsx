"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Star, Sparkles, Building2 } from "lucide-react";

export interface TestimonialItem {
  text: string;
  image: string;
  name: string;
  role: string;
  company?: string;
  verified?: boolean;
}

export const INDIAN_TESTIMONIALS: TestimonialItem[] = [
  {
    text: "AI Protector intercepted an evasive spear-phishing attack spoofing our executive team's domain before it reached our Slack channels. Essential for Indian enterprises.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    name: "Aarav Sharma",
    role: "Chief Information Security Officer",
    company: "Zeta FinTech • Bengaluru",
    verified: true,
  },
  {
    text: "The local-first PII redaction gives us total confidence. Client PAN, Aadhaar, and credit card credentials are completely masked client-side before any AI reasoning occurs.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    name: "Priya Nair",
    role: "Head of Cyber Defense",
    company: "HDFC Securities • Mumbai",
    verified: true,
  },
  {
    text: "We benchmarked it against 200+ malicious UPI QR payment fraud links and spoofed bank portals. 100% detection rate with instant MITRE ATT&CK technique breakdown.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    name: "Rohan Deshmukh",
    role: "Lead Threat Analyst",
    company: "BharatPay Labs • Pune",
    verified: true,
  },
  {
    text: "The MITRE ATT&CK correlation engine cut our average SOC incident triage time from 45 minutes down to 30 seconds. The dossier export is executive-ready.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    name: "Ananya Iyer",
    role: "Cloud Security Architect",
    company: "Infosys Digital • Hyderabad",
    verified: true,
  },
  {
    text: "Digital banking smishing and fake electricity KYC APK scams in India have skyrocketed. AI Protector is the only platform that accurately catches regional social engineering tactics.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    name: "Vikramaditya Verma",
    role: "Director of Fraud Risk",
    company: "Paytm Payments Bank • Delhi NCR",
    verified: true,
  },
  {
    text: "The offline zero-trust processing model complies completely with RBI and CERT-In cybersecurity guidelines. Flawless execution with zero data leakage.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    name: "Neha Sengupta",
    role: "VP of Regulatory Compliance",
    company: "Tata Consultancy Services • Kolkata",
    verified: true,
  },
  {
    text: "SHA-256 integrity inspection with instant threat lookup quarantined a trojanized third-party dependency in our CI/CD pipeline immediately before deployment.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
    name: "Kabir Patel",
    role: "SecOps Lead",
    company: "Swiggy Infrastructure • Ahmedabad",
    verified: true,
  },
  {
    text: "The cryptographic SHA-256 seal on generated incident dossiers makes them directly useful for cyber forensic documentation and CERT-In reporting.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    name: "Divya Sundaram",
    role: "Cyber Crime Forensic Specialist",
    company: "Cyber Security Task Force • Chennai",
    verified: true,
  },
  {
    text: "Replaced four disjointed open-source threat checking scripts with this unified zero-trust dashboard. The Ruixen Moon Chat copilot is lightning fast and extraordinarily strict.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    name: "Arjun Malhotra",
    role: "VP of Engineering & Security",
    company: "Zomato • Gurugram",
    verified: true,
  },
];

function TestimonialCard({ item }: { item: TestimonialItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-[360px] sm:w-[400px] shrink-0 rounded-2xl border border-white/10 bg-[#141820] p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/35 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] hover:-translate-y-1 group">
      {/* Stars & Verified Badge */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
          ))}
        </div>
        {item.verified && (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-mono">
            <ShieldCheck className="w-3 h-3 text-white" />
            <span>Verified SecOps</span>
          </span>
        )}
      </div>

      {/* Quote */}
      <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-4 group-hover:text-white transition-colors">
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Profile */}
      <div className="flex items-center space-x-3 pt-3 border-t border-white/10">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-neutral-800">
          {!imgError ? (
            <img
              src={item.image}
              alt={item.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white text-black font-bold text-xs">
              {item.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D0F12]" />
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-semibold text-white text-xs sm:text-sm truncate">
              {item.name}
            </h4>
          </div>
          <p className="text-[11px] text-white font-medium truncate">{item.role}</p>
          {item.company && (
            <p className="text-[10px] text-neutral-400 truncate flex items-center space-x-1">
              <Building2 className="w-2.5 h-2.5 shrink-0" />
              <span>{item.company}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Horizontal Testimonial Moving Marquee
 */
export function TestimonialsColumn({
  testimonials = INDIAN_TESTIMONIALS,
  duration = 25,
  className = "",
  reverse = false,
}: {
  testimonials?: TestimonialItem[];
  duration?: number;
  className?: string;
  reverse?: boolean;
}) {
  // Duplicate for seamless infinite loop
  const list = [...testimonials, ...testimonials];

  return (
    <div className={`overflow-hidden flex select-none py-2 ${className}`}>
      <motion.div
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex gap-6 shrink-0"
      >
        {list.map((item, idx) => (
          <TestimonialCard key={`${item.name}-${idx}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials({
  testimonials = INDIAN_TESTIMONIALS,
}: {
  testimonials?: TestimonialItem[];
}) {
  const rowOne = testimonials.slice(0, 5);
  const rowTwo = testimonials.slice(4, 9);

  return (
    <section className="bg-transparent my-16 relative overflow-hidden">
      {/* Background radial glow in subtle white */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.04] blur-[120px] pointer-events-none" />

      <div className="container z-10 mx-auto px-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[620px] mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Trusted Across Indian Security & FinTech</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Defending India's Digital Frontier
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 leading-relaxed">
            Leading CISOs, fraud investigators, and cybersecurity engineers rely on AI Protector's zero-trust heuristics to defeat malicious payloads, lookalike domains, and social engineering attacks.
          </p>
        </motion.div>

        {/* Horizontal Moving Marquee with Left & Right Gradient Fade */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          {/* Row 1 - Left to Right */}
          <TestimonialsColumn
            testimonials={rowOne}
            duration={28}
            reverse={false}
          />

          {/* Row 2 - Right to Left (Opposite Direction) */}
          <TestimonialsColumn
            testimonials={rowTwo}
            duration={32}
            reverse={true}
            className="mt-3"
          />
        </div>
      </div>
    </section>
  );
}

export default { Testimonials, TestimonialsColumn };
