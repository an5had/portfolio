# -*- coding: utf-8 -*-
"""Undeniable 2-page resume for Muhammed Anshad A (Senior UI/UX Designer)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem, Table, TableStyle,
)
from reportlab.lib.styles import ParagraphStyle

ACCENT = HexColor('#E8492B')
INK = HexColor('#15171C')
GRAY = HexColor('#4F555D')
LIGHT = HexColor('#8A9098')
LINE = HexColor('#DEDED9')
SOFT = HexColor('#FBEDE9')
LINKC = '#1F4ED8'

OUT = 'public/anshad-resume.pdf'
CW = 178 * mm  # content width (A4 210 - 2*16)

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    leftMargin=16 * mm, rightMargin=16 * mm, topMargin=12 * mm, bottomMargin=9 * mm,
    title='Muhammed Anshad A - Senior UI/UX Designer', author='Muhammed Anshad A',
    subject='Resume', creator='itsmyportfolio.com',
)

name_s = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=23, leading=25, textColor=INK, spaceAfter=2)
title_s = ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=ACCENT, spaceAfter=5)
contact_s = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.9, leading=12.5, textColor=GRAY)
avail_s = ParagraphStyle('avail', fontName='Helvetica-Oblique', fontSize=8.6, leading=12, textColor=LIGHT, spaceBefore=2)
summary_s = ParagraphStyle('summary', fontName='Helvetica', fontSize=9.7, leading=14, textColor=INK)
sec_s = ParagraphStyle('sec', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=INK, spaceBefore=7)
rl_s = ParagraphStyle('rl', fontName='Helvetica-Bold', fontSize=10.3, leading=12.5, textColor=INK)
rr_s = ParagraphStyle('rr', fontName='Helvetica', fontSize=8.7, leading=12.5, textColor=GRAY, alignment=2)
sub_s = ParagraphStyle('sub', fontName='Helvetica-Oblique', fontSize=8.8, leading=12, textColor=ACCENT, spaceBefore=1)
bullet_s = ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.3, leading=12.9, textColor=INK)
skill_s = ParagraphStyle('skill', fontName='Helvetica', fontSize=9.3, leading=13.8, textColor=INK)
proj_s = ParagraphStyle('proj', fontName='Helvetica', fontSize=9.3, leading=13.2, textColor=INK)
statn_s = ParagraphStyle('statn', fontName='Helvetica-Bold', fontSize=17, leading=18, textColor=ACCENT, alignment=1)
statl_s = ParagraphStyle('statl', fontName='Helvetica', fontSize=7.6, leading=9.4, textColor=GRAY, alignment=1)

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


def role(title, company, dates, place, items, sub=None):
    left = '%s &nbsp;&middot;&nbsp; %s' % (title, company)
    right = '%s &nbsp;&middot;&nbsp; %s' % (dates, place)
    t = Table([[Paragraph(left, rl_s), Paragraph(right, rr_s)]], colWidths=[CW * 0.64, CW * 0.36])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t)
    if sub:
        story.append(Paragraph(sub, sub_s))
    bullets(items)


def link(href, text):
    return '<a href="%s" color="%s">%s</a>' % (href, LINKC, text)


def stats_band(items):
    cells = [[Paragraph(n, statn_s), Paragraph(l, statl_s)] for n, l in items]
    t = Table([cells], colWidths=[CW / len(items)] * len(items))
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), SOFT),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('LINEAFTER', (0, 0), (-2, -1), 0.6, LINE),
        ('ROUNDEDCORNERS', [5, 5, 5, 5]),
    ]))
    story.append(Spacer(1, 4))
    story.append(t)


# ---- header ----
story.append(Paragraph('Muhammed Anshad A', name_s))
story.append(Paragraph('Senior UI/UX Designer', title_s))
story.append(Paragraph(
    link('mailto:anuanshadpgm@gmail.com', 'anuanshadpgm@gmail.com') + ' &nbsp;&middot;&nbsp; '
    + link('tel:+919895054973', '+91 98950 54973') + ' &nbsp;&middot;&nbsp; India &nbsp;&middot;&nbsp; '
    + link('https://itsmyportfolio.com', 'itsmyportfolio.com') + ' &nbsp;&middot;&nbsp; '
    + link('https://www.linkedin.com/in/an5had', 'linkedin.com/in/an5had'),
    contact_s))
story.append(Paragraph('Open to senior UI/UX and product design roles &middot; remote or relocation', avail_s))
rule(INK, 1.0, 7, 7)

# ---- summary ----
story.append(Paragraph(
    'Senior UI/UX designer with 5+ years building digital products that pair genuine usability with business '
    'strategy, across enterprise analytics, fintech and consumer domains. I work end to end, from research and '
    'half-formed requirements through to scalable design systems and engineering handoff, and I measure success by '
    'what ships, gets adopted and moves the metric. Currently designing enterprise BI and AI-informed products at '
    '<b>Exult Global</b> for clients across the US and GCC.',
    summary_s))

# ---- impact band ----
stats_band([
    ('60+', 'dashboards unified<br/>into one BI system'),
    ('40%', 'boost to usability<br/>(Wheels Up)'),
    ('25%', 'faster report<br/>generation'),
    ('#6', 'Productivity, App Store<br/>(SolarEnvoy)'),
    ('5+', 'years across<br/>US &amp; GCC clients'),
])

# ---- experience ----
section('Professional Experience')
role('Senior UI/UX Designer', 'Exult Global', 'Feb 2024 – Present', 'India', [
    'Lead UX and product design across enterprise and analytics platforms for high-profile clients including '
    'Wheels Up, Dexcom, HIG Capital, Zayo and CyberProof.',
    'Wheels Up (USA): partnered directly with the VP of Business Intelligence to build an internal Figma BI '
    'design system that <b>unified 60+ dashboards</b>, <b>raised usability 40%</b> and <b>cut report-generation '
    'time 25%</b> across operations, sales, maintenance and finance.',
    'Own discovery through delivery: research, IA, component-based dashboards, design systems and prototyping, '
    'validated with executives and shipped with engineers via iterative design sprints.',
])
role('UI/UX Designer', 'JIC IT Solutions', 'Jul 2023 – Feb 2024', 'India', [
    'Sea Arabia: a GCC travel and tourism platform, plus an independently designed vendor portal and CMS for '
    'activity management and content updates.',
    'Jobin Arabia: an end-to-end HR management system (HRMS) covering onboarding, attendance, approvals and '
    'role-based workflows.',
    'Bansal TMT &amp; Bansal Hospital: loyalty and discount-management mobile apps with matching admin CMS web apps.',
    'Delivered user-centred designs through research, prototyping and close collaboration with PMs and developers.',
])
role('UI/UX Designer', 'WeCreate (Mintyfusion)', 'Jul 2021 – Apr 2023', 'Remote', [
    'Redesigned and enhanced web and mobile products across fintech and service industries through user research, '
    'streamlined task flows and clean, intuitive UI.',
    'Designed SolarEnvoy, which reached <b>#6 in Productivity on the App Store</b>, recognised for its clarity and '
    'user satisfaction.',
])
role('Creative Design Consultant', 'Freelance', 'Aug 2020 – Jul 2021', 'Remote', [
    'Delivered end-to-end UX and visual design for startups and SMEs, including Shutterup and Skillbus.',
    'Built cohesive design languages that improved engagement and usability across brand platforms.',
])

# ---- skills ----
section('Core Skills')
for lbl, items in [
    ('UX &amp; Interaction', 'End-to-end UX/UI, User Flows, Wireframing, Prototyping, Journey Mapping, Information Architecture, Responsive Design'),
    ('Research &amp; Usability', 'User Research, Usability Testing, A/B Testing, Persona Development, Task Flows, Data-Driven Insights'),
    ('Systems &amp; Data', 'Design Systems, Component Libraries, Data Visualisation, KPI Dashboards, Developer Handoff'),
    ('Product &amp; Collaboration', 'Product Strategy, Discovery, Cross-functional Collaboration, Agile, Stakeholder Alignment'),
    ('Emerging', 'AI-powered product design, prototyping with AI tools, design-and-tech trend research'),
    ('Tools', 'Figma, Framer, Adobe XD, Protopie, FigJam, Zeplin, HTML/CSS'),
]:
    story.append(Paragraph('<b>%s:</b> %s' % (lbl, items), skill_s))

# ---- writing + education ----
section('Writing &amp; Education')
story.append(Paragraph(
    '<b>Writing:</b> Publishes on UX, AI and product design, including '
    + link('https://medium.com/@an5had/ai-powered-usability-testing-the-revolution-our-ux-research-toolkit-needs-2ecbb1a3eb1f',
            '"AI-Powered Usability Testing"') + ' on Medium.', skill_s))
edu = Table([[
    Paragraph('<b>B.Tech, Computer Science Engineering</b> &nbsp;&middot;&nbsp; MES College of Engineering', rl_s),
    Paragraph('India &nbsp;&middot;&nbsp; 2021', rr_s),
]], colWidths=[CW * 0.74, CW * 0.26])
edu.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
]))
story.append(edu)

doc.build(story)
print('Wrote', OUT)
