/**
 * CreatorCollaboration model
 *
 * Collection: creatorCollaborations
 * Owner: Abdullah (creator-side module)
 *
 * Schema:
 *   creatorName    {string}  required
 *   brandName      {string}  required
 *   campaignTitle  {string}  required
 *   platform       {string}  required  e.g. "Instagram", "TikTok", "YouTube"
 *   dueDate        {Date}    optional
 *   submissionLink {string}  optional  URL to draft content
 *   status         {string}  default "draft"  — draft | revision_requested | final
 *   personalNotes  {string}  optional
 *   createdAt      {Date}    set on insert
 *   updatedAt      {Date}    set on insert and every update
 */

export const COLLECTION = "creatorCollaborations";

export const VALID_STATUSES = ["draft", "revision_requested", "final"];

/**
 * Build a new collaboration document ready for insertion.
 * Applies defaults and coerces types.
 */
export function createCollaborationDoc(data) {
  const now = new Date();
  return {
    creatorName: data.creatorName.trim(),
    brandName: data.brandName.trim(),
    campaignTitle: data.campaignTitle.trim(),
    platform: data.platform.trim(),
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    submissionLink: data.submissionLink?.trim() || null,
    status: data.status || "draft",
    personalNotes: data.personalNotes?.trim() || null,
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
    "creatorName",
    "brandName",
    "campaignTitle",
    "platform",
    "dueDate",
    "submissionLink",
    "status",
    "personalNotes",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (data[field] === undefined) continue;
    if (field === "dueDate") {
      updates[field] = new Date(data[field]);
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
    if (!data.creatorName?.trim()) errors.push("creatorName is required");
    if (!data.brandName?.trim()) errors.push("brandName is required");
    if (!data.campaignTitle?.trim()) errors.push("campaignTitle is required");
    if (!data.platform?.trim()) errors.push("platform is required");
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (data.dueDate !== undefined && data.dueDate !== null && isNaN(Date.parse(data.dueDate))) {
    errors.push("dueDate must be a valid date string");
  }

  return errors;
}

/**
 * Build a MongoDB filter object from query params.
 * Supports: status, platform, brandName, creatorName
 */
export function buildFilter(query = {}) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.platform) filter.platform = query.platform;
  if (query.brandName) filter.brandName = { $regex: query.brandName, $options: "i" };
  if (query.creatorName) filter.creatorName = { $regex: query.creatorName, $options: "i" };
  return filter;
}
