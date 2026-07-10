import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string | null;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What types of properties does TrustKeyper manage?",
    answer:
      "TrustKeyper manages apartments, villas, and independent houses across active service areas in Hyderabad. We support both vacant and tenant-occupied residential properties.",
  },
  {
    question: "Does TrustKeyper collect or hold rent?",
    answer: null,
  },
  {
    question: "How are tenants screened?",
    answer: null,
  },
  {
    question: "How are repair expenses approved?",
    answer: null,
  },
  {
    question: "Can TrustKeyper manage my property if I live outside Hyderabad or India?",
    answer: null,
  },
  {
    question: "How frequently will I receive property updates?",
    answer: null,
  },
  {
    question: "Which Hyderabad areas are supported?",
    answer: null,
  },
  {
    question: "Can TrustKeyper manage a vacant property?",
    answer: null,
  },
  {
    question: "Is there a minimum service period?",
    answer: null,
  },
  {
    question: "How do I get started?",
    answer: null,
  },
];

const PLACEHOLDER_ANSWER =
  "Answer pending — please provide copy from the design team before launch.";

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `broker-faq-panel-${item.question}`;
  const buttonId = `broker-faq-button-${item.question}`;

  return (
    <div className="rounded-xl border-b border-marketing-azure-stroke">
      <button
        type="button"
        id={buttonId}
        className="flex w-full items-center justify-between gap-4 rounded-xl py-5 text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="text-lg font-semibold leading-6 text-marketing-navy-dark">{item.question}</span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          className={cn(
            "shrink-0 text-marketing-navy-dark transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div id={panelId} role="region" aria-labelledby={buttonId} className="pb-5">
          <p
            className={cn(
              "font-roboto text-sm leading-5",
              item.answer ? "text-marketing-neutral-1000" : "text-marketing-muted italic",
            )}
          >
            {item.answer ?? PLACEHOLDER_ANSWER}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function BrokerFaqSection() {
  const [openIndex, setOpenIndex] = React.useState(0);

  return (
    <section className="bg-marketing-neutral-100 py-14 sm:py-16 lg:py-[140px]" aria-labelledby="broker-faq-heading">
      <div className="mx-auto max-w-[1228px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.5fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-roboto text-xs font-medium uppercase tracking-[1.2px] text-marketing-neutral-1100">
              Frequently Asked Questions
            </p>
            <h2
              id="broker-faq-heading"
              className="mt-5 text-[32px] font-medium leading-tight text-marketing-navy-dark sm:text-[40px] sm:leading-[46px]"
            >
              Common questions
              <br />
              answered.
            </h2>
          </div>

          <div>
            {FAQ_ITEMS.map((item, index) => (
              <FaqAccordionItem
                key={item.question}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? -1 : index))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
