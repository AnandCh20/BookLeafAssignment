export const bookleafKnowledgeBase = {
  company: {
    name: "BookLeaf Publishing",
    nature: "Self-publishing company operating in India and the US",
    packages: ["Standard Free (no upfront cost)", "Bestseller Breakthrough (premium with marketing/distribution)"],
    services: ["Cover design", "Typesetting", "ISBN assignment", "Printing", "Distribution", "Royalty management"],
    facilities: "In-house printing facility and central warehouse located in Delhi. Commercial print partners include Repro India and Epitome Books."
  },
  royalty: {
    split: "80/20 royalty split (80% of net profit goes to author, 20% to BookLeaf)",
    netProfitFormula: "Net Profit = MRP - Printing Cost - Platform Commission (Amazon/Flipkart) - Shipping Charges",
    calculationCycle: "Royalties calculated quarterly and disbursed within 45 days of quarter end",
    minimumThreshold: "₹1,000. If total accrued royalties are below this, they roll over to the next quarter",
    disbursementMethod: "Direct bank transfer to the account linked in the author's dashboard",
    transparency: "Authors can view detailed line-by-line royalty breakdowns in their dashboard per platform"
  },
  isbn: {
    policy: "Every book published through BookLeaf receives a unique ISBN assigned under BookLeaf's publisher imprint",
    customImprint: "If an author desires an ISBN under their own imprint, they must register it independently",
    errors: "Reported ISBN discrepancies (duplicate or mislinked catalog items) are treated as critical and escalated to production within 48 hours"
  },
  printing: {
    turnaround: "5 to 7 business days from order confirmation",
    fulfillment: "In-house printing handles most orders; overflow or specialized formats go to Repro India or Epitome Books",
    qualityIssues: "In case of misprints, binding defects, or color inconsistency, BookLeaf provides free reprints upon receiving defect photos"
  },
  distribution: {
    platforms: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
    goLiveTime: "7 to 10 business days after publication is complete",
    stockIssues: "Unavailable status on platforms usually reflects inventory sync latency; BookLeaf triggers catalog re-sync within 24 to 48 hours"
  },
  productionStages: [
    "Manuscript Received",
    "Editing (if opted)",
    "Cover Design",
    "Typesetting",
    "Proofreading",
    "ISBN Assignment",
    "Printing",
    "Distribution Setup",
    "Published & Live"
  ],
  toneGuidelines: {
    mindset: "Authors are partners, not customers to be managed",
    empathy: "Always acknowledge author concerns before jumping to solutions",
    specificity: "Include exact dates, rupee figures, and book titles rather than vague statements",
    ownership: "Own BookLeaf operational delays directly without defensive deflection",
    timeline: "Provide concrete 24 to 48 hour resolution windows rather than open-ended promises",
    nextStep: "Conclude with an unambiguous next action for the author or internal team"
  }
};
