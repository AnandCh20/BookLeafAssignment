import { bookleafKnowledgeBase } from "./knowledgeBase.js";

const VALID_CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry"
];

const VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"];

function getRelevantKnowledgeContext(text) {
  const lower = text.toLowerCase();
  const contextParts = [];

  contextParts.push(
    `Company: ${bookleafKnowledgeBase.company.name}. Warehouse: ${bookleafKnowledgeBase.company.facilities}. Packages: ${bookleafKnowledgeBase.company.packages.join(", ")}.`
  );

  if (
    lower.includes("royalty") ||
    lower.includes("payment") ||
    lower.includes("payout") ||
    lower.includes("money") ||
    lower.includes("bank") ||
    lower.includes("earn") ||
    lower.includes("sold")
  ) {
    contextParts.push(
      `Royalty Policy: ${bookleafKnowledgeBase.royalty.split}. ${bookleafKnowledgeBase.royalty.netProfitFormula}. ${bookleafKnowledgeBase.royalty.calculationCycle}. Threshold: ${bookleafKnowledgeBase.royalty.minimumThreshold}. Method: ${bookleafKnowledgeBase.royalty.disbursementMethod}.`
    );
  }

  if (
    lower.includes("isbn") ||
    lower.includes("imprint") ||
    lower.includes("barcode") ||
    lower.includes("wrong number")
  ) {
    contextParts.push(
      `ISBN Policy: ${bookleafKnowledgeBase.isbn.policy}. Own imprint rule: ${bookleafKnowledgeBase.isbn.customImprint}. Discrepancy handling: ${bookleafKnowledgeBase.isbn.errors}.`
    );
  }

  if (
    lower.includes("print") ||
    lower.includes("quality") ||
    lower.includes("page") ||
    lower.includes("binding") ||
    lower.includes("blur") ||
    lower.includes("defect") ||
    lower.includes("damage")
  ) {
    contextParts.push(
      `Printing & Quality: Turnaround: ${bookleafKnowledgeBase.printing.turnaround}. Partners: ${bookleafKnowledgeBase.printing.fulfillment}. Quality Guarantee: ${bookleafKnowledgeBase.printing.qualityIssues}.`
    );
  }

  if (
    lower.includes("distribution") ||
    lower.includes("amazon") ||
    lower.includes("flipkart") ||
    lower.includes("unavailable") ||
    lower.includes("listing") ||
    lower.includes("out of stock")
  ) {
    contextParts.push(
      `Distribution: Platforms: ${bookleafKnowledgeBase.distribution.platforms.join(", ")}. Go-live timeframe: ${bookleafKnowledgeBase.distribution.goLiveTime}. Stock sync: ${bookleafKnowledgeBase.distribution.stockIssues}.`
    );
  }

  if (
    lower.includes("production") ||
    lower.includes("status") ||
    lower.includes("typesetting") ||
    lower.includes("cover") ||
    lower.includes("proof") ||
    lower.includes("editing")
  ) {
    contextParts.push(
      `Production Stages: ${bookleafKnowledgeBase.productionStages.join(" -> ")}.`
    );
  }

  contextParts.push(
    `Tone Guidelines: ${bookleafKnowledgeBase.toneGuidelines.mindset}. ${bookleafKnowledgeBase.toneGuidelines.empathy}. ${bookleafKnowledgeBase.toneGuidelines.ownership}. ${bookleafKnowledgeBase.toneGuidelines.timeline}. ${bookleafKnowledgeBase.toneGuidelines.nextStep}.`
  );

  return contextParts.join("\n");
}

function ruleBasedClassificationAndPriority(subject, description) {
  const combined = `${subject} ${description}`.toLowerCase();

  let category = "General Inquiry";
  let priority = "Medium";

  if (
    combined.includes("isbn") ||
    combined.includes("wrong isbn") ||
    combined.includes("different isbn") ||
    combined.includes("metadata")
  ) {
    category = "ISBN & Metadata Issues";
    priority = "Critical";
  } else if (
    combined.includes("royalty") ||
    combined.includes("payout") ||
    combined.includes("payment") ||
    combined.includes("commission") ||
    combined.includes("haven't received") ||
    combined.includes("earned") ||
    combined.includes("₹")
  ) {
    category = "Royalty & Payments";
    if (
      combined.includes("not received") ||
      combined.includes("haven't received") ||
      combined.includes("overdue") ||
      combined.includes("months") ||
      combined.includes("missing")
    ) {
      priority = "High";
    } else {
      priority = "Medium";
    }
  } else if (
    combined.includes("print") ||
    combined.includes("binding") ||
    combined.includes("terrible") ||
    combined.includes("misprint") ||
    combined.includes("blurry") ||
    combined.includes("defect") ||
    combined.includes("torn")
  ) {
    category = "Printing & Quality";
    if (combined.includes("terrible") || combined.includes("damaged") || combined.includes("misprint")) {
      priority = "High";
    } else {
      priority = "Medium";
    }
  } else if (
    combined.includes("amazon") ||
    combined.includes("flipkart") ||
    combined.includes("unavailable") ||
    combined.includes("out of stock") ||
    combined.includes("store") ||
    combined.includes("listing")
  ) {
    category = "Distribution & Availability";
    if (combined.includes("unavailable") || combined.includes("out of stock")) {
      priority = "Medium";
    } else {
      priority = "Low";
    }
  } else if (
    combined.includes("typesetting") ||
    combined.includes("cover design") ||
    combined.includes("proofreading") ||
    combined.includes("when will it be done") ||
    combined.includes("production stage") ||
    combined.includes("stage") ||
    combined.includes("manuscript")
  ) {
    category = "Book Status & Production Updates";
    priority = "Medium";
  } else if (
    combined.includes("bio") ||
    combined.includes("profile") ||
    combined.includes("description") ||
    combined.includes("update") ||
    combined.includes("question")
  ) {
    category = "General Inquiry";
    priority = "Low";
  }

  return { category, priority };
}

function heuristicDraftResponse({
  author_name,
  book_title,
  subject,
  description,
  category,
  priority
}) {
  const greeting = `Dear ${author_name || "Author"},`;
  const combined = `${subject} ${description}`.toLowerCase();

  let body = "";
  let closingAction = "";

  if (category === "Royalty & Payments") {
    if (combined.includes("haven't received") || combined.includes("pending") || combined.includes("not received")) {
      body = `Thank you for reaching out regarding your royalty disbursement for "${book_title}". I completely understand how concerning any payment delay feels, and I am glad you brought this to our attention.\n\nAt BookLeaf, royalties operate on an 80/20 profit split (80% to the author) and are calculated quarterly, with payouts disbursed within 45 days of the quarter ending. The minimum threshold for payout is ₹1,000; accumulated earnings below this figure roll over seamlessly to the subsequent quarter.\n\nI have cross-checked your author dashboard and verified that your account details are in order. Our finance desk is currently processing the batch disbursement.`;
      closingAction = `I have marked this as high priority with our accounts team and will follow up with your direct transaction reference number within 48 hours. Please let me know if you need any additional statement details in the meantime.`;
    } else {
      body = `Thank you for contacting us regarding your royalty breakdown for "${book_title}". We believe in absolute transparency with our author partners.\n\nOur net profit calculation per copy is computed as MRP minus printing costs, marketplace platform commissions (such as Amazon or Flipkart), and shipping fees. BookLeaf remits 80% of this net profit directly to you on a quarterly schedule.\n\nYou can view the granular sales numbers per platform in your Author Dashboard under My Books.`;
      closingAction = `I am happy to prepare a detailed line-by-line statement from our distribution ledger. Our team will share this breakdown with you within 24 to 48 hours.`;
    }
  } else if (category === "ISBN & Metadata Issues") {
    body = `Thank you for alerting us immediately regarding the ISBN discrepancy on "${book_title}". We take catalog integrity very seriously, and I sincerely apologize for the confusion this discrepancy has caused your readers.\n\nEvery title published under BookLeaf receives a designated ISBN registered under our official imprint. Discrepancies between marketplace listings and physical prints are treated with the highest urgency to safeguard your book's distribution and review continuity.`;
    closingAction = `I have escalated this directly to our senior production and distribution lead. We are submitting an urgent catalog correction ticket to Amazon India and will resolve this data sync within 48 hours. I will personally update you as soon as the live catalog refreshes.`;
  } else if (category === "Printing & Quality") {
    body = `Thank you for bringing this print quality issue to our attention regarding "${book_title}". I am genuinely sorry that your author copies arrived with manufacturing defects. This does not meet BookLeaf's print standards.\n\nOur Delhi printing facility and partner presses (Repro India and Epitome Books) adhere to strict quality benchmarks. Whenever a misprint, binding defect, or color variance occurs, BookLeaf arranges a 100% free reprint of the affected copies after verification.`;
    closingAction = `Could you please reply to this ticket or share 2-3 clear photographs showing the misaligned pages and print defects? As soon as our quality team verifies them, we will dispatch fresh replacement copies within 5 to 7 business days at zero cost to you.`;
  } else if (category === "Distribution & Availability") {
    body = `Thank you for writing in regarding the marketplace availability of "${book_title}". I understand how critical it is for your readers to be able to order without interruption.\n\nWhen a published book shows as "Currently Unavailable" on Amazon or Flipkart, it typically indicates a routine inventory catalog synchronization latency between our Delhi warehouse feeds and the marketplace servers, rather than an out-of-print state.`;
    closingAction = `Our distribution operations team has just triggered a forced catalog re-sync for your listing. Amazon listings generally reflect updated stock availability within 24 to 48 hours. We will monitor the product page and confirm once Prime ordering is fully restored.`;
  } else if (category === "Book Status & Production Updates") {
    body = `Thank you for reaching out for a status update on "${book_title}". Every book progresses through our structured workflow: Manuscript Received -> Editing -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live.\n\nWe understand that waiting during production can be anxious, and our goal is to ensure the formatting and aesthetic design are flawless before publication.`;
    closingAction = `I have checked in with our typesetting desk. Your layout proof is undergoing final interior review and is scheduled for your author inspection within 48 hours. Thank you for your patience as we bring your book to life.`;
  } else {
    body = `Thank you for reaching out to BookLeaf Author Support regarding "${book_title}". We are delighted to assist you with your inquiry.\n\nAs your publishing partner, we strive to make managing your author journey as seamless as possible, whether it involves updating your metadata, marketing options, or account details.`;
    closingAction = `Our author support desk is reviewing your request and will provide full instructions or complete the necessary adjustments within 24 to 48 business hours. Please feel free to provide any additional details if needed.`;
  }

  const signoff = `Warm regards,\nBookLeaf Author Support Team\nDelhi, India`;
  return `${greeting}\n\n${body}\n\n${closingAction}\n\n${signoff}`;
}

export async function classifyAndPrioritizeTicket({ subject, description }) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: `You are an automated support classifier for BookLeaf Publishing.
Classify the ticket into exactly one category:
${VALID_CATEGORIES.join(", ")}

Assign an urgency priority:
Critical (financial blocks >3 months, wrong ISBN on Amazon, major print defect)
High (unpaid royalty over threshold, production delay >2 weeks, Amazon unavailable)
Medium (routine status update, minor payout questions, print inquiries)
Low (bio changes, general metadata questions)

Output JSON only in this format:
{"category": "...", "priority": "..."}`
            },
            {
              role: "user",
              content: `Subject: ${subject}\nDescription: ${description}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        if (
          VALID_CATEGORIES.includes(parsed.category) &&
          VALID_PRIORITIES.includes(parsed.priority)
        ) {
          return { category: parsed.category, priority: parsed.priority };
        }
      }
    } catch {
      return ruleBasedClassificationAndPriority(subject, description);
    }
  }

  return ruleBasedClassificationAndPriority(subject, description);
}

export async function generateAIDraftResponse({
  author_name,
  book_title,
  subject,
  description,
  category,
  priority
}) {
  const relevantKnowledge = getRelevantKnowledgeContext(`${subject} ${description} ${category}`);

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `You are a professional author support representative at BookLeaf Publishing.
Draft an empathetic, professional, and policy-accurate reply to an author.

BookLeaf Policies & Knowledge Base:
${relevantKnowledge}

Tone Guidelines:
- Treat the author as a partner, not a customer to be deflected.
- Acknowledge their situation before offering a resolution.
- Be specific with policies, numbers, and dates.
- Own operational issues directly.
- Always provide a concrete 24 to 48 hour timeline.
- Conclude with clear next steps.
- Do not make generic AI fluff or hallucinations.`
            },
            {
              role: "user",
              content: `Author Name: ${author_name}
Book Title: ${book_title}
Subject: ${subject}
Description: ${description}
Category: ${category}
Priority: ${priority}`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        if (content) return content;
      }
    } catch {
      return heuristicDraftResponse({
        author_name,
        book_title,
        subject,
        description,
        category,
        priority
      });
    }
  }

  return heuristicDraftResponse({
    author_name,
    book_title,
    subject,
    description,
    category,
    priority
  });
}
