# Whome.fun - Fun Quiz Aggregation Platform

## 1. Concept & Vision

**Whome.fun** is a fun quiz discovery and participation platform targeting Chinese social media users (小红书 style). The experience is content-first: users browse curated quizzes, participate in them, and share their results. No accounts, no friction. The personality is playful, visually engaging, and optimized for mobile-first consumption with viral sharing mechanics built in.

**Core experience**: Browse → Take Quiz → See Result → Share → Explore More

---

## 2. Design Language

### Aesthetic Direction
uQuiz-inspired layout and card-based UI, but with a distinct brand identity. Playful yet clean — not childish, not corporate.

### Color Palette
```
Primary:      #6366F1 (Indigo - main CTAs, active states)
Secondary:    #EC4899 (Pink - accents, result highlights)
Background:   #F8FAFC (Light gray - page background)
Surface:      #FFFFFF (Cards, modals)
Text Primary: #1E293B (Dark slate - headings)
Text Secondary: #64748B (Muted - descriptions, metadata)
Success:      #10B981 (Green - correct/success states)
Warning:      #F59E0B (Amber - attention)
```

### Typography
- **Headings**: Inter (Google Fonts) - Bold, clean
- **Body**: Inter - Regular/Medium
- **Chinese fallback**: "PingFang SC", "Microsoft YaHei"
- Scale: 14px base, 1.25 ratio

### Spatial System
- Base unit: 4px
- Component padding: 16px (4 units)
- Card gap: 24px (6 units)
- Section spacing: 48px (12 units)
- Max content width: 1280px

### Motion Philosophy
- Page transitions: Subtle fade (200ms ease-out)
- Card hover: Scale 1.02, shadow lift (150ms)
- Button press: Scale 0.98 (100ms)
- Result reveal: Staggered fade-in (300ms per item)

### Visual Assets
- Quiz covers: 16:9 aspect ratio, rounded corners (12px)
- Category icons: Lucide React icons
- Result cards: Gradient backgrounds per result type

---

## 3. Layout & Structure

### URL Structure
```
/[lang]/                     → Homepage
/[lang]/categories/[slug]    → Category listing
/[lang]/tests/[slug]         → Quiz intro page
/[lang]/tests/[slug]/quiz    → Quiz taking
/[lang]/tests/[slug]/result  → Quiz result
```

Supported languages: `en`, `zh`

### Homepage Layout
1. **Header** - Fixed, blur backdrop
   - Logo (left)
   - Category nav (center): Trending | Personality | Career | Love | Fun
   - Language switcher (right)

2. **Hero Section** - Full-width, gradient background
   - Headline: "Discover yourself through fun quizzes"
   - Subheadline: "Explore your personality, career, relationships and hidden traits"
   - Search bar (future phase)

3. **Featured Quiz** - Large card, spotlight position

4. **Popular Quizzes** - Horizontal scroll on mobile, grid on desktop

5. **Category Grid** - 2x2 on mobile, 4 columns on desktop

6. **Footer** - Minimal: copyright, language links

### Category Page Layout
1. **Category Header** - Title, description, quiz count
2. **Quiz Grid** - Responsive grid of QuizCards
3. **Pagination** - Load more button (no infinite scroll for SEO)

### Quiz Detail Page Layout
1. **Quiz Header** - Cover image, title, description
2. **Quiz Meta** - Taker count, duration, category badge
3. **Start CTA** - Large prominent button
4. **Preview** - First 2-3 questions shown (optional)

### Quiz Flow Layout
1. **Progress Bar** - Top, shows current position
2. **Question Card** - Center, single question focus
3. **Options** - Grid of selectable options
4. **Navigation** - Back/Next buttons

### Result Page Layout
1. **Result Hero** - Result type name, visual treatment
2. **Result Description** - 2-3 paragraph intro
3. **Trait List** - Key characteristics
4. **Career Recommendations** - Related suggestions
5. **Share Section** - ShareCard + social buttons
6. **Related Quizzes** - 3-4 recommendations

---

## 4. Features & Interactions

### Quiz Browsing
- Click quiz card → navigate to quiz detail
- Category nav click → navigate to category page
- Hover on card → subtle scale + shadow lift

### Quiz Taking
- Select option → highlight selected, enable Next
- Next click → advance to next question, save answer in context
- Back click → return to previous question
- Complete final question → auto-navigate to result
- Progress bar updates with each question

### Result Sharing
- ShareCard displays: result type, quiz title, Whome.fun branding
- "Copy Link" → clipboard copy, toast confirmation
- "Save Image" → generates PNG via Canvas, downloads
- Web Share API on supported mobile browsers

### Error States
- Quiz not found → 404 page with "Back to home" CTA
- MDX parse error → graceful fallback, log error
- Image load fail → placeholder gradient

### Empty States
- No quizzes in category → "More quizzes coming soon" message

---

## 5. Component Inventory

### Header
- **Default**: White background, full nav visible
- **Scrolled**: Blur backdrop, subtle shadow
- **Mobile**: Hamburger menu for nav

### QuizCard
- **Default**: Cover image, title, category badge, meta
- **Hover**: Scale 1.02, shadow elevation
- **Loading**: Skeleton placeholder

### CategoryCard
- **Default**: Icon, name, quiz count
- **Hover**: Background tint, icon animation

### QuestionCard
- **Default**: Question text, options grid
- **Option Default**: Border, subtle background
- **Option Selected**: Primary border, checkmark icon
- **Option Hover**: Background tint

### ResultCard
- **Default**: Gradient background, result type, description
- **Animated**: Staggered reveal on mount

### ShareCard
- **Default**: Result visual, quiz title, branding
- **Generating**: Loading spinner overlay
- **Actions**: Copy link, save image, social share

### Button
- **Primary**: Indigo background, white text
- **Secondary**: White background, indigo border/text
- **Ghost**: Transparent, text only
- **Disabled**: Grayed out, no pointer events
- **Loading**: Spinner, disabled state

### ProgressBar
- **Default**: Gray track, indigo fill
- **Animated**: Width transition 300ms

---

## 6. Technical Approach

### Framework & Build
- **Next.js 15** with App Router
- **TypeScript** strict mode
- **Tailwind CSS** for styling
- **MDX** via `next-mdx-remote` + `gray-matter` for frontmatter

### i18n Architecture
```
app/[lang]/           # Dynamic segment for locale
├── page.tsx
├── categories/[slug]/page.tsx
└── tests/[slug]/
    ├── page.tsx
    ├── quiz/page.tsx
    └── result/page.tsx
```

Dictionary files:
```
i18n/dictionaries/
├── en.json
└── zh.json
```

### MDX Content Structure
```
content/
└── tests/
    └── infp-career.mdx
```

MDX frontmatter:
```yaml
---
title:
  en: "INFP Career Direction Test"
  zh: "INFP职业方向测试"
slug: "infp-career"
category: "personality"  # personality | career | love | fun
duration: "5 min"
coverImage: "/images/quizzes/infp-career/cover.jpg"
ogImage: "/images/quizzes/infp-career/og-share.jpg"
featured: true
questions:
  - question:
      en: "Which do you prefer?"
      zh: "你更喜欢什么？"
    options:
      - text:
          en: "Creating new content"
          zh: "创造新内容"
        score:
          creative: 1
          analytical: 0
      - text:
          en: "Analyzing data"
          zh: "分析数据"
        score:
          creative: 0
          analytical: 1
results:
  creative:
    title:
      en: "Creative Expressor"
      zh: "创造表达型"
    description:
      en: "You thrive in environments that allow artistic expression..."
      zh: "你在允许艺术表达的环境中茁壮成长..."
    traits:
      en: ["Imaginative", "Original", "Emotionally aware"]
      zh: ["富有想象力", "原创", "情感敏锐"]
    careers:
      en: ["Writer", "Designer", "Artist"]
      zh: ["作家", "设计师", "艺术家"]
  analytical:
    title:
      en: "Logical Thinker"
      zh: "逻辑思考型"
    description:
      en: "You excel at analyzing complex problems..."
      zh: "你擅长分析复杂问题..."
    traits:
      en: ["Logical", "Detail-oriented", "Objective"]
      zh: ["逻辑性强", "注重细节", "客观"]
    careers:
      en: ["Data Analyst", "Engineer", "Researcher"]
      zh: ["数据分析师", "工程师", "研究员"]
---
```

### Image Asset Structure
```
public/
├── images/
│   ├── quizzes/
│   │   └── infp-career/
│   │       ├── cover.jpg          # 16:9, 800x450 recommended
│   │       └── og-share.jpg       # 1200x630 for social sharing
│   └── categories/
│       ├── personality.jpg
│       ├── career.jpg
│       ├── love.jpg
│       └── fun.jpg
```

### State Management
- **QuizContext** (React Context + useReducer)
  - State: currentQuestionIndex, answers, isComplete, result
  - Actions: SELECT_OPTION, NEXT_QUESTION, PREV_QUESTION, CALCULATE_RESULT
- **localStorage persistence** reserved for Phase 2

### Score Calculation
1. Sum scores per result type across all answered questions
2. Result type with highest total wins
3. Tie-breaker: first result type in MDX order

### Data Flow
```
MDX File → gray-matter (parse) → next-mdx-remote (render) → Page Component
                                        ↓
                              TypeScript types (validation)
```

### Static Generation
- `generateStaticParams` for all category and test pages
- ISR revalidation: 60 seconds (future: on-demand)

### Performance Targets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Mobile-first lazy loading for images

---

## 7. Scalability Considerations

### 1000+ Quizzes Architecture
- Filesystem MDX with directory indexing
- Static generation with dynamic routes
- CDN cache headers for quiz pages
- Image optimization via Next.js Image component

### Future Extensions (Phase 2+)
- Search functionality
- User progress (localStorage)
- More result types per quiz
- Quiz collections/favorites
- Social authentication
- Quiz creation editor
- Admin dashboard

---

## 8. File Structure

```
whome.fun/
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx             # Locale-specific layout
│   │   ├── page.tsx               # Homepage
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # Category listing
│   │   └── tests/
│   │       └── [slug]/
│   │           ├── page.tsx       # Quiz intro
│   │           ├── quiz/
│   │           │   └── page.tsx   # Quiz taking
│   │           └── result/
│   │               └── page.tsx   # Quiz result
│   ├── layout.tsx                 # Root layout
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── QuizCard.tsx
│   ├── CategoryCard.tsx
│   ├── QuestionCard.tsx
│   ├── OptionButton.tsx
│   ├── ProgressBar.tsx
│   ├── ResultCard.tsx
│   ├── ShareCard/
│   │   ├── ShareCard.tsx
│   │   ├── ShareButtons.tsx
│   │   └── useShare.ts
│   └── ui/                        # Reusable primitives
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Card.tsx
├── content/
│   └── tests/
│       └── infp-career.mdx        # Demo quiz
├── lib/
│   ├── mdx.ts                     # MDX loading utilities
│   ├── quiz.ts                    # Score calculation
│   ├── types.ts                   # TypeScript interfaces
│   └── i18n.ts                    # Dictionary loading
├── i18n/
│   ├── config.ts                  # Locale config
│   └── dictionaries/
│       ├── en.json
│       └── zh.json
├── public/
│   └── images/
│       ├── quizzes/
│       │   └── infp-career/
│       │       ├── cover.jpg
│       │       └── og-share.jpg
│       └── categories/
│           ├── personality.jpg
│           ├── career.jpg
│           ├── love.jpg
│           └── fun.jpg
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. Phase 1 Deliverables

### Must Ship
- [x] Homepage with hero, featured quiz, popular quizzes, category grid
- [x] Category listing page (`/categories/[slug]`)
- [x] Quiz detail page (`/tests/[slug]`)
- [x] Quiz taking flow (questions + answers)
- [x] Result page with ShareCard
- [x] One complete demo quiz (INFP Career)
- [x] Full i18n support (EN + ZH)
- [x] Mobile-responsive design

### Out of Scope (Phase 1)
- User accounts / authentication
- Quiz creation / editor
- Backend / database
- Payment system
- Comments / likes
- Search
- User progress persistence
