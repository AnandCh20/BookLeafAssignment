import json
from datetime import datetime

with open('FULLSTACK-SAMPLEDATA (1).json', 'r') as f:
    data = json.load(f)

authors = data.get('authors', [])

def generate_email_simulation(author):
    books = author.get('books', [])
    name = author.get('name')
    city = author.get('city')
    
    total_earned = sum(b.get('total_royalty_earned', 0) for b in books)
    total_paid = sum(b.get('royalty_paid', 0) for b in books)
    total_pending = sum(b.get('royalty_pending', 0) for b in books)
    
    lines = []
    lines.append(f"Dear {name},")
    lines.append("")
    lines.append("We hope this email finds you well. Here is your latest author statement and royalty summary from BookLeaf Publishing.")
    lines.append("")
    lines.append("---")
    lines.append("### Consolidated Financial Summary")
    lines.append(f"- **Total Royalty Earned:** ₹{total_earned:,}")
    lines.append(f"- **Total Royalty Paid:** ₹{total_paid:,}")
    lines.append(f"- **Current Pending Payout:** ₹{total_pending:,}")
    lines.append("---")
    lines.append("")
    lines.append("### Your Titles & Performance")
    
    in_production = []
    for b in books:
        if b.get('status') == 'Published & Live':
            lines.append(f"- **{b.get('title')}** ({b.get('isbn', 'N/A')}):")
            lines.append(f"  • Copies Sold: {b.get('total_copies_sold', 0)}")
            lines.append(f"  • Royalty Earned: ₹{b.get('total_royalty_earned', 0):,}")
            lines.append(f"  • Royalty Paid: ₹{b.get('royalty_paid', 0):,}")
            lines.append(f"  • Royalty Pending: ₹{b.get('royalty_pending', 0):,}")
            if b.get('last_royalty_payout_date'):
                lines.append(f"  • Last Payout Date: {b.get('last_royalty_payout_date')}")
            else:
                lines.append("  • Last Payout Date: No payouts disbursed yet")
        else:
            in_production.append(b)
            
    if in_production:
        lines.append("")
        lines.append("### Titles In Production")
        for b in in_production:
            lines.append(f"- **{b.get('title')}**: Currently in **{b.get('status')}**. Our editorial and production team is preparing this title for release.")
            
    lines.append("")
    lines.append("### Payout Status & Next Steps")
    if total_pending > 0:
        if total_pending < 1000:
            lines.append("Your pending balance is currently below our ₹1,000 threshold and will roll over into the next cycle.")
        else:
            lines.append("Per BookLeaf policy (80/20 net profit split), royalties are calculated quarterly and disbursed within 45 days of quarter end directly to your linked bank account.")
    else:
        lines.append("All your earned royalties have been fully disbursed! Thank you for sharing your writing journey with BookLeaf.")
        
    lines.append("")
    lines.append("Warm regards,")
    lines.append("The BookLeaf Publishing Team")
    lines.append("support@bookleaf.com | Delhi, India")
    
    return "\n".join(lines)

results = []
for a in authors:
    email_text = generate_email_simulation(a)
    results.append({
        "author_id": a.get("author_id"),
        "author_name": a.get("name"),
        "recipient_email": a.get("email"),
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "email_preview": email_text
    })

with open('assignment-2/simulated_output_samples.json', 'w') as out_f:
    json.dump(results, out_f, indent=2)

print(f"Generated sample simulated notifications for {len(results)} authors.")
