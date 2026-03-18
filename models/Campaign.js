/**
 * BrandCampaign model
 *
 * Collection: brandCampaigns
 * Owner: Teammate (brand-side module)
 *
 * Schema:
 *   brandName      {string}  required
 *   campaignTitle  {string}  required
 *   description    {string}  optional
 *   platform       {string}  required  e.g. "Instagram", "TikTok", "YouTube"
 *   budget         {number}  optional
 *   deadline       {Date}    optional
 *   requirements   {string}  optional  content brief / deliverable details
 *   status         {string}  default "open"  — open | in_review | completed
 *   internalNotes  {string}  optional
 *   createdAt      {Date}    set on insert
 *   updatedAt      {Date}    set on insert and every update
 */

export const COLLECTION = "brandCampaigns";

export const VALID_STATUSES = ["open", "in_review", "completed"];

/**
 * Build a new campaign document ready for insertion.
 * Applies defaults and coerces types.
 */
export function createCampaignDoc(data) {
  const now = new Date();
  return {
    brandName: data.brandName.trim(),
    campaignTitle: data.campaignTitle.trim(),
    description: data.description?.trim() || null,
    platform: data.platform.trim(),
    budget: data.budget !== undefined && data.budget !== null ? Number(data.budget) : null,
    deadline: data.deadline ? new Date(data.deadline) : null,
    requirements: data.requirements?.trim() || null,
    status: data.status || "open",
    internalNotes: data.internalNotes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Build an $set payload for partial updates.
 * Only includes fields that were provided in data.
 */
export function buildUpdateDoc(data) {
  const allowedFields = [
    "brandName",
    "campaignTitle",
    "description",
    "platform",
    "budget",
    "deadline",
    "requirements",
    "status",
    "internalNotes",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] === undefined) continue;
    if (field === "deadline") {
      updates[field] = new Date(data[field]);
    } else if (field === "budget") {
      updates[field] = Number(data[field]);
    } else {
      updates[field] = typeof data[field] === "string" ? data[field].trim() : data[field];
    }
  }

  updates.updatedAt = new Date();
  return updates;
}

/**
 * Validate fields for a create or update operation.
 * Returns an array of error strings (empty = valid).
 */
export function validate(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!data.brandName?.trim()) errors.push("brandName is required");
    if (!data.campaignTitle?.trim()) errors.push("campaignTitle is required");
    if (!data.platform?.trim()) errors.push("platform is required");
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (data.deadline !== undefined && data.deadline !== null && isNaN(Date.parse(data.deadline))) {
    errors.push("deadline must be a valid date string");
  }

  if (data.budget !== undefined && data.budget !== null && isNaN(Number(data.budget))) {
    errors.push("budget must be a number");
  }

  return errors;
}

/**
 * Build a MongoDB filter object from query params.
 * Supports: status, platform, brandName
 */
export function buildFilter(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.platform) filter.platform = query.platform;
  if (query.brandName) filter.brandName = { $regex: query.brandName, $options: "i" };
  if (query.campaignTitle) filter.campaignTitle = { $regex: query.campaignTitle, $options: "i" };
  return filter;
}
