from pathlib import Path

path = Path('index.html')
text = path.read_text()

replacements = {
    '<span class="plan-name" data-static-plan-price="standard">$10/month</span><span class="plan-price">Billed monthly · cancel anytime</span></div><button class="plan-link" type="button" data-hosting-plan="standard-local-monthly" data-hosting-type="standard">Choose</button>': '<span class="plan-name" data-static-plan-price="standard">$20/month</span><span class="plan-price">Billed monthly · cancel anytime</span></div><button class="plan-link" type="button" data-hosting-plan="standard-monthly" data-hosting-type="standard">Choose</button>',
    '<span class="plan-name" data-static-plan-price="backend">$20/month</span><span class="plan-price">Billed monthly · cancel anytime</span></div><button class="plan-link" type="button" data-hosting-plan="backend-local-monthly" data-hosting-type="backend">Choose</button>': '<span class="plan-name" data-static-plan-price="backend">$30/month</span><span class="plan-price">Billed monthly · cancel anytime</span></div><button class="plan-link" type="button" data-hosting-plan="backend-monthly" data-hosting-type="backend">Choose</button>',
    '{ key: "standard-local-monthly", label: "$10/month — Standard Website Hosting · billed monthly", type: "standard" }': '{ key: "standard-monthly", label: "$20/month — Standard Website Hosting · billed monthly", type: "standard" }',
    '{ key: "backend-local-monthly", label: "$20/month — Backend Website Hosting · billed monthly", type: "backend" }': '{ key: "backend-monthly", label: "$30/month — Backend Website Hosting · billed monthly", type: "backend" }',
    'return type === "backend" ? "$20/month" : "$10/month";': 'if (!localHostingPricingActive) return type === "backend" ? "$30/month" : "$20/month";\n            const regular = type === "backend" ? "$30/month" : "$20/month";\n            const discounted = type === "backend" ? "$20/month" : "$10/month";\n            return `<span class="local-price"><del>${regular}</del><strong>${discounted}</strong></span>`;',
    'standard: { title: "Standard Website Hosting", text: "Best for informational websites that show services, contact details, galleries, menus, or other mostly fixed content. It includes hosting and routine support for $10 per month." }': 'standard: { title: "Standard Website Hosting", text: "Best for informational websites that show services, contact details, galleries, menus, or other mostly fixed content. Standard hosting is $20 per month, or $10 per month when a valid discount code is applied." }',
    'backend: { title: "Backend Website Hosting", text: "For websites that store or change data, such as appointments, customer accounts, admin dashboards, forms connected to a database, or other interactive features. It includes the extra backend infrastructure and support for $20 per month." }': 'backend: { title: "Backend Website Hosting", text: "For websites that store or change data, such as appointments, customer accounts, admin dashboards, forms connected to a database, or other interactive features. Backend hosting is $30 per month, or $20 per month when a valid discount code is applied." }'
}

for old, new in replacements.items():
    if old not in text:
        raise RuntimeError(f'Expected text not found: {old[:120]}')
    text = text.replace(old, new, 1)

path.write_text(text)
