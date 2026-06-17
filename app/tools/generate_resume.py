# -*- coding: utf-8 -*-
"""ATS-friendly PDF resume for Muhammed Anshad A, positioned for Product Designer roles."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem, Table, TableStyle,
)
from reportlab.lib.styles import ParagraphStyle

ACCENT = HexColor('#E8492B')
INK = HexColor('#15171C')
GRAY = HexColor('#5B6168')
LIGHT = HexColor('#8A9098')
LINE = HexColor('#DDDDD8')
LINKC = '#1F4ED8'

OUT = 'public/anshad-resume.pdf'
CW = 178 * mm  # content width (A4 210 - 2*16)

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=16 * mm, rightMargin=16 * mm, topMargin=13 * mm, bottomMargin=11 * mm,
    title='Muhammed Anshad A - Product Designer', author='Muhammed Anshad A',
    subject='Resume', creator='itsmyportfolio.com',
)

name_s = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=22, leading=24, textColor=INK, spaceAfter=2)
title_s = ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=ACCENT, spaceAfter=4)
contact_s = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.8, leading=12.5, textColor=GRAY)
avail_s = ParagraphStyle('avail', fontName='Helvetica-Oblique', fontSize=8.6, leading=12, textColor=LIGHT, spaceBefore=1)
summary_s = ParagraphStyle('summary', fontName='Helvetica', fontSize=9.7, leading=14, textColor=INK)
clients_s = ParagraphStyle('clients', fontName='Helvetica', fontSize=9, leading=13, textColor=GRAY, spaceBefore=6)
sec_s = ParagraphStyle('sec', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=INK, spaceBefore=12)
rl_s = ParagraphStyle('rl', fontName='Helvetica-Bold', fontSize=10.3, leading=12.5, textColor=INK)
rr_s = ParagraphStyle('rr', fontName='Helvetica', fontSize=8.7, leading=12.5, textColor=GRAY, alignment=2)
bullet_s = ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.9, textColor=INK)
skill_s = ParagraphStyle('skill', fontName='Helvetica', fontSize=9.3, leading=13.8, textColor=INK)

story = []


def rule(color=LINE, w=0.8, sb=2, sa=6):
    story.append(HRFlowable(width='100%', thickness=w, color=color, spaceBefore=sb, spaceAfter=sa))


def section(label):
    story.append(Paragraph(label.upper(), sec_s))
    rule(ACCENT, 1.1, 3, 5)


def bullets(items):
    story.append(ListFlowable(
        [ListItem(Paragraph(t, bullet_s), leftIndent=10, value='•') for t in items],
        bulletType='bullet', start='•', leftIndent=10, bulletColor=ACCENT, bulletFontSize=8, spaceBefore=2,
    ))


def role(title, company, dates, place, items):
    left = '%s &nbsp;&middot;&nbsp; %s' % (title, company)
    right = '%s &nbsp;&middot;&nbsp; %s' % (dates, place)
    t = Table([[Paragraph(left, rl_s), Paragraph(right, rr_s)]], colWidths=[CW * 0.66, CW * 0.34])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    story.append(t)
    bullets(items)


def link(href, text):
    return '<a href="%s" color="%s">%s</a>' % (href, LINKC, text)


# ---- header ----
story.append(Paragraph('Muhammed Anshad A', name_s))
story.append(Paragraph('Product Designer', title_s))
story.append(Paragraph(
    link('mailto:anuanshadpgm@gmail.com', 'anuanshadpgm@gmail.com') + ' &nbsp;&middot;&nbsp; '
    + link('tel:+919895054973', '+91 98950 54973') + ' &nbsp;&middot;&nbsp; India &nbsp;&middot;&nbsp; '
    + link('https://itsmyportfolio.com', 'itsmyportfolio.com') + ' &nbsp;&middot;&nbsp; '
    + link('https://www.linkedin.com/in/an5had', 'linkedin.com/in/an5had'),
    contact_s))
story.append(Paragraph('Open to Product Designer roles — remote or relocation', avail_s))
rule(INK, 1.0, 7, 8)

# ---- summary ----
story.append(Paragraph(
    'Product designer with 5+ years shipping end-to-end digital products across enterprise, analytics, fintech '
    'and consumer domains. I work from discovery and research through UX, UI, prototyping and developer handoff, '
    'and I optimise for outcomes: products that ship, get used and move the metrics. Strong with ambiguity, '
    'data-heavy problems and design systems at scale, partnering closely with PMs, engineers and stakeholders.',
    summary_s))
story.append(Paragraph(
    '<b>Selected clients:</b> Wheels Up, HIG Capital, Dexcom, CyberProof, Bansal Group', clients_s))

# ---- experience ----
section('Experience')
role('Senior UI/UX Designer', 'Exult Global', 'Feb 2024 – Present', 'India', [
    'Lead UX and product design across enterprise and analytics products for clients including Wheels Up, '
    'HIG Capital, Dexcom and CyberProof.',
    'Wheels Up (USA): partnered directly with the VP of Business Intelligence to consolidate 50+ internal '
    'dashboards into a scalable Figma design system, cutting report-generation time by 25% across operations, '
    'sales and finance.',
    'Own discovery through delivery: research, component-based dashboards and decision tools, validated with '
    'stakeholders and shipped with engineers via iterative design sprints and a documented design system.',
])
role('UI/UX Designer', 'JIC IT Solutions', 'Jul 2023 – Feb 2024', 'India', [
    'Designed and shipped customer-facing and B2B products end to end across multiple industries.',
    'Jobin Arabia: an applicant tracking system for the GCC (admin and employer-facing) covering job posting, '
    'candidate pipelines and status tracking.',
    'Sea Arabia: a travel and experience booking platform with a vendor-management CMS.',
    'Bansal TMT &amp; Bansal Hospital: loyalty and discount-management mobile apps with matching admin CMS web apps.',
])
role('UI/UX Designer', 'WeCreate (Mintyfusion)', 'Jul 2021 – Apr 2023', 'Remote', [
    'Redesigned and enhanced web and mobile products across fintech and service industries through user '
    'research, streamlined task flows and clean, intuitive UI.',
    'Designed SolarEnvoy, which reached #6 in Productivity on the App Store, recognised for clarity and user '
    'satisfaction.',
])
role('Creative Design Consultant', 'Freelance', 'Aug 2020 – Jul 2021', 'Remote', [
    'Delivered end-to-end UX and visual design for startups and SMEs, including Shutterup and Skillbus.',
    'Built cohesive design languages that improved engagement and usability across brand platforms.',
])

# ---- skills ----
section('Skills')
for lbl, items in [
    ('Product', 'Product Strategy, Discovery, 0-to-1 Product Design, Prioritisation, Roadmap Input, Outcomes &amp; Metrics'),
    ('Research', 'User Research, Interviews, Usability Testing, A/B Testing, Journey Mapping, Personas, Data-Driven Insights'),
    ('Craft', 'End-to-End UX/UI, Interaction Design, Prototyping, Wireframing, Information Architecture, Responsive Design'),
    ('Systems', 'Design Systems, Component Libraries, Developer Handoff, Data Visualisation, KPI Dashboards'),
    ('Tools', 'Figma, Framer, Protopie, Adobe XD, FigJam, Zeplin, HTML/CSS'),
]:
    story.append(Paragraph('<b>%s:</b> %s' % (lbl, items), skill_s))

# ---- education ----
section('Education')
edu = Table([[
    Paragraph('<b>B.Tech, Computer Science Engineering</b> &nbsp;&middot;&nbsp; MES College of Engineering', rl_s),
    Paragraph('India &nbsp;&middot;&nbsp; 2021', rr_s),
]], colWidths=[CW * 0.74, CW * 0.26])
edu.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
]))
story.append(edu)

doc.build(story)
print('Wrote', OUT)
