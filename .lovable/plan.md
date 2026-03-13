

## Plan: Create Privacy Policy & Terms of Service Pages

### What we'll build
Two static Italian-language pages (`/privacy-policy` and `/termini-di-servizio`) with complete legal text tailored to Verde D'Oro Microgreens — a local food business based in Reggio Emilia selling microgreens online.

### Approach
- Create two new page components following the existing pattern (Layout wrapper, Helmet for SEO, prose styling for content)
- Add routes in `App.tsx`
- The pages will be static (no CMS/database needed) since legal pages rarely change
- Style with the same `prose` classes used for blog article content rendering
- The footer already supports legal links — these pages will be linked there

### Files to create/modify

1. **`src/pages/PrivacyPolicy.tsx`** — Full Italian privacy policy covering: data controller info, types of data collected, purposes, legal basis (GDPR), cookies, third parties, user rights, retention, contact info.

2. **`src/pages/TerminiServizio.tsx`** — Full Italian terms of service covering: general conditions, product descriptions, ordering process, pricing, shipping, returns, liability, applicable law, dispute resolution.

3. **`src/App.tsx`** — Add two lazy-loaded routes: `/privacy-policy` and `/termini-di-servizio` under the public layout.

### Content approach
Both pages will use Verde D'Oro's actual business details (email: microgreens.verdedoro@gmail.com, location: Reggio Emilia) drawn from the existing codebase. The privacy policy will reference GDPR (Reg. UE 2016/679) and the terms will reference Italian Consumer Code (D.Lgs. 206/2005). Placeholder `[data]` will be used for the last-updated date which you can fill in.

### Design
- Same `Layout` wrapper as all other pages (Navigation + Footer)
- Centered content column (`max-w-4xl mx-auto`) with `prose` typography
- Section headings with the brand's `font-display` style
- Breadcrumb schema for SEO

