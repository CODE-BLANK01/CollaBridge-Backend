/**
 * seed.js — CollaBridge database seeder
 * Generates 500+ campaigns + 600+ collaborations = 1100+ entries
 *
 * Usage:
 *   OPENSSL_CONF=./openssl.cnf node seed.js
 *   OPENSSL_CONF=./openssl.cnf node seed.js --wipe-only
 *
 * Login credentials after seeding:
 *   brand    brand@collabridge.com   / password123
 *   creator  creator@collabridge.com / password123
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, getDB } from "./config/db.js";

const WIPE_ONLY = process.argv.includes("--wipe-only");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randBool = (p = 0.5) => Math.random() < p;

/** Returns a Date between `start` and `end` (both Date objects) */
function randDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ─── Reference data ──────────────────────────────────────────────────────────

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter", "Facebook", "Pinterest", "LinkedIn", "Snapchat"];

const BRANDS = [
  "Nike", "Adidas", "Puma", "Gymshark", "Lululemon",
  "Glossier", "Fenty Beauty", "NARS", "Charlotte Tilbury", "Rare Beauty",
  "Zara", "H&M", "ASOS", "Urban Outfitters", "Reformation",
  "Apple", "Samsung", "Sony", "Bose", "Beats",
  "Red Bull", "Monster Energy", "GoPro", "DJI", "Insta360",
  "Sephora", "Ulta Beauty", "MAC Cosmetics", "NYX", "e.l.f.",
  "Spotify", "Skillshare", "NordVPN", "Squarespace", "Shopify",
  "HelloFresh", "Factor Meals", "Magic Spoon", "Liquid IV", "AG1",
  "Dyson", "Ninja", "KitchenAid", "Vitamix", "Instant Pot",
  "Revolve", "PrettyLittleThing", "Fashion Nova", "Shein", "Nasty Gal",
];

const CAMPAIGN_ADJECTIVES = [
  "Summer", "Winter", "Spring", "Fall", "Holiday", "Limited Edition",
  "Exclusive", "New Season", "Fresh", "Bold", "Iconic", "Next-Gen",
  "Signature", "Heritage", "Premium", "Essential", "Ultimate", "Classic",
];

const CAMPAIGN_TYPES = [
  "Collection Drop", "Brand Launch", "Product Reveal", "Awareness Campaign",
  "Influencer Series", "Collab Campaign", "Relaunch", "Anniversary Edition",
  "Flash Sale", "Challenge", "Haul Series", "Unboxing Series", "Review Series",
  "Tutorial Series", "Day-in-the-Life", "Behind the Scenes", "GRWM Series",
  "Transformation Series", "Before & After", "Try-On Haul", "Duet Series",
];

const DESCRIPTION_TEMPLATES = [
  (brand, type, platform) =>
    `${brand} is looking for authentic ${platform} creators to promote the new ${type}. We want real stories, not scripted ads.`,
  (brand, type, platform) =>
    `Exciting ${type} opportunity with ${brand}. Targeting 18–34 demographic on ${platform} with high engagement rates.`,
  (brand, type, platform) =>
    `${brand} is launching a major ${type} campaign across ${platform}. We need creative voices who align with our brand DNA.`,
  (brand, _, platform) =>
    `Join ${brand}'s creator program and help us reach new audiences on ${platform}. We believe in giving creators full creative freedom.`,
  (brand, type) =>
    `${brand}'s ${type} is our biggest campaign this quarter. Looking for top-tier creators with genuine communities.`,
];

const REQUIREMENTS_TEMPLATES = [
  (platform) =>
    `2x ${platform} posts, 4x Stories, 1x Reel. Must use branded hashtag. No competitor mentions. Content due 5 days before go-live.`,
  (platform) =>
    `3x original ${platform} videos (45–90s each). Brand must appear in first 3 seconds. Include swipe-up link or bio link.`,
  (platform) =>
    `1x long-form ${platform} video (8–12 min) with dedicated segment. Script approval required before filming.`,
  (platform) =>
    `${platform} content package: 2 feed posts + 6 Stories + 1 highlight. Natural integration preferred. No hard sells.`,
  () =>
    `Full creative freedom on concept and format. Must tag brand account and include campaign hashtag. Embargo applies until campaign launch.`,
];

const INTERNAL_NOTES_TEMPLATES = [
  "Creator must not have worked with direct competitors in last 90 days.",
  "Budget includes 2 rounds of revisions. Third revision charged separately.",
  "Legal review required before any mention of health claims.",
  "Priority market: US, UK, CA, AU only.",
  "Creator must have minimum 5% engagement rate on last 10 posts.",
  "Usage rights: 12 months, paid ads included. Clarify in contract.",
  "Requires signed NDA before full brief is shared.",
  "Micro-influencer focus: 50k–250k followers preferred.",
  "Campaign tied to product launch. Strict embargo on all content.",
  "Retainer opportunity for top performers. Mention in outreach.",
  null,
  null,
  null,
];

const CAMPAIGN_STATUSES = ["open", "open", "open", "in_review", "in_review", "completed"];

const CREATOR_FIRST = [
  "Emma", "Luca", "Mia", "Kai", "Zoe", "Noah", "Ava", "Ethan",
  "Sofia", "Aiden", "Luna", "Jayden", "Chloe", "Mason", "Lily",
  "Logan", "Ella", "Lucas", "Aria", "Jackson", "Scarlett", "Olivia",
  "Amara", "Theo", "Isla", "Felix", "Nora", "Mateo", "Layla", "Omar",
  "Freya", "Caleb", "Aurora", "Ezra", "Violet", "Remy", "Hazel",
  "Jax", "Ivy", "Silas", "Sage", "Finn", "Rio", "Blake", "Sasha",
  "Drew", "Quinn", "Rowan", "Piper", "Skylar", "Avery", "Harper",
  "Indigo", "Juno", "Kade", "Lexi", "Marco", "Nadia", "Oscar",
  "Petra", "Rafe", "Stella", "Tatum", "Uma", "Vega", "Wren",
];

const CREATOR_LAST = [
  "Chen", "Rossi", "Tanaka", "Williams", "Kim", "Patel", "Garcia",
  "Martin", "Brown", "Davis", "Wilson", "Moore", "Taylor", "Anderson",
  "Jackson", "White", "Harris", "Thompson", "Clark", "Lewis",
  "Robinson", "Walker", "Hall", "Allen", "Young", "Hernandez",
  "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams",
  "Baker", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner",
  "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins",
  "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook", "Morgan",
];

const COLLAB_STATUSES = ["draft", "draft", "revision_requested", "final", "final"];

const PERSONAL_NOTES_TEMPLATES = [
  (brand) => `Initial briefing done with ${brand}. Waiting on product shipment before filming.`,
  (brand) => `${brand} approved first draft. Minor edits requested on the hook. Re-cutting now.`,
  (brand) => `All content submitted to ${brand}. Awaiting final sign-off. Invoice sent.`,
  (brand) => `${brand} loved the concept. Going ahead with full production this week.`,
  () => "Shoot scheduled. Location confirmed. Props sourced.",
  () => "First draft done. Sending to brand tomorrow for review.",
  () => "Revision round 2 in progress. Brand wants a warmer colour grade.",
  () => "All deliverables approved and live. Adding to portfolio.",
  () => "Rate card negotiated and signed. Starting creative development.",
  () => "Campaign complete. 480k views in first 48 hours.",
  () => "Waiting on contract signature before starting.",
  () => null,
];

const SUBMISSION_LINK_BASES = [
  "https://drive.google.com/collab",
  "https://dropbox.com/sh/collab",
  "https://wetransfer.com/collab",
  "https://frame.io/review/collab",
];

// ─── Generators ──────────────────────────────────────────────────────────────

function generateCampaigns(count) {
  const docs = [];
  const now = new Date();
  const past = new Date("2024-01-01");
  const future = new Date("2026-06-30");

  for (let i = 0; i < count; i++) {
    const brand = pick(BRANDS);
    const adj = pick(CAMPAIGN_ADJECTIVES);
    const type = pick(CAMPAIGN_TYPES);
    const platform = pick(PLATFORMS);
    const status = pick(CAMPAIGN_STATUSES);
    const descFn = pick(DESCRIPTION_TEMPLATES);
    const reqFn = pick(REQUIREMENTS_TEMPLATES);
    const createdAt = randDate(past, now);

    docs.push({
      brandName: brand,
      campaignTitle: `${brand} ${adj} ${type}`,
      description: descFn(brand, type, platform),
      platform,
      budget: randBool(0.85) ? randInt(2000, 80000) : null,
      deadline: randBool(0.8) ? randDate(now, future) : null,
      requirements: randBool(0.9) ? reqFn(platform) : null,
      status,
      internalNotes: pick(INTERNAL_NOTES_TEMPLATES),
      createdAt,
      updatedAt: createdAt,
    });
  }

  return docs;
}

function generateCollaborations(count) {
  const docs = [];
  const past = new Date("2024-01-01");
  const future = new Date("2026-06-30");
  const now = new Date();

  // Pre-generate a pool of creator names
  const creatorPool = [];
  for (let i = 0; i < 120; i++) {
    creatorPool.push(`${pick(CREATOR_FIRST)} ${pick(CREATOR_LAST)}`);
  }

  for (let i = 0; i < count; i++) {
    const creatorName = pick(creatorPool);
    const brand = pick(BRANDS);
    const adj = pick(CAMPAIGN_ADJECTIVES);
    const type = pick(CAMPAIGN_TYPES);
    const platform = pick(PLATFORMS);
    const status = pick(COLLAB_STATUSES);
    const notesFn = pick(PERSONAL_NOTES_TEMPLATES);
    const createdAt = randDate(past, now);
    const hasLink = status === "final" || (status === "revision_requested" && randBool(0.6));
    const slug = `${creatorName.replace(" ", "-").toLowerCase()}-${brand.toLowerCase().replace(/\s/g, "-")}-${i}`;

    docs.push({
      creatorName,
      brandName: brand,
      campaignTitle: `${brand} ${adj} ${type}`,
      platform,
      dueDate: randBool(0.8) ? randDate(now, future) : null,
      submissionLink: hasLink ? `${pick(SUBMISSION_LINK_BASES)}-${slug}` : null,
      status,
      personalNotes: notesFn(brand),
      createdAt,
      updatedAt: createdAt,
    });
  }

  return docs;
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function seed() {
  await connectDB();
  const db = getDB();

  await Promise.all([
    db.collection("users").deleteMany({}),
    db.collection("brandCampaigns").deleteMany({}),
    db.collection("creatorCollaborations").deleteMany({}),
  ]);
  console.log("✓ Cleared: users, brandCampaigns, creatorCollaborations");

  if (WIPE_ONLY) {
    console.log("Wipe-only mode — skipping insert.");
    process.exit(0);
  }

  // ── Users (2 only) ──────────────────────────────────────────────────────────
  const now = new Date();
  const [brandHash, creatorHash] = await Promise.all([
    bcrypt.hash("password123", 12),
    bcrypt.hash("password123", 12),
  ]);

  await db.collection("users").insertMany([
    { name: "CollaBridge Brand", email: "brand@collabridge.com", password: brandHash, role: "brand", createdAt: now, updatedAt: now },
    { name: "CollaBridge Creator", email: "creator@collabridge.com", password: creatorHash, role: "creator", createdAt: now, updatedAt: now },
  ]);
  console.log("✓ Inserted 2 users");

  // ── Campaigns (500) ─────────────────────────────────────────────────────────
  const campaignDocs = generateCampaigns(500);
  await db.collection("brandCampaigns").insertMany(campaignDocs);
  console.log(`✓ Inserted ${campaignDocs.length} campaigns`);

  // ── Collaborations (600) ────────────────────────────────────────────────────
  const collabDocs = generateCollaborations(600);
  await db.collection("creatorCollaborations").insertMany(collabDocs);
  console.log(`✓ Inserted ${collabDocs.length} collaborations`);

  const total = 2 + campaignDocs.length + collabDocs.length;
  console.log(`\n✓ Total documents inserted: ${total}`);
  console.log("\n── Login credentials ─────────────────────────────────────");
  console.log("  brand    brand@collabridge.com    / password123");
  console.log("  creator  creator@collabridge.com  / password123");
  console.log("──────────────────────────────────────────────────────────\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
