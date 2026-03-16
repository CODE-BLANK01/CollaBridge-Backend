/**
 * Application model
 *
 * Collection: applications
 *
 * Schema:
 *   campaignId     {string}  required — stringified ObjectId of the campaign
 *   campaignTitle  {string}  required
 *   brandName      {string}  required
 *   creatorName    {string}  required
 *   message        {string}  default ""
 *   draftLink      {string}  default ""
 *   status         {string}  default "pending"
 *   createdAt      {Date}
 *   updatedAt      {Date}
 */

export const COLLECTION = "applications";

export const VALID_STATUSES = [
  "pending",
  "under review",
  "revision requested",
  "approved",
  "deal closed",
  "rejected",
];

export function createApplicationDoc(data) {
  const now = new Date();
  return {
    campaignId: data.campaignId.trim(),
    campaignTitle: data.campaignTitle.trim(),
    brandName: data.brandName.trim(),
    creatorName: data.creatorName.trim(),
    message: data.message?.trim() || "",
    draftLink: data.draftLink?.trim() || "",
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

export function buildUpdateDoc(data) {
  const allowedFields = ["message", "draftLink", "status"];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] =
        typeof data[field] === "string" ? data[field].trim() : data[field];
    }
  }
  updates.updatedAt = new Date();
  return updates;
}

export function validate(data, isUpdate = false) {
  const errors = [];
  if (!isUpdate) {
    if (!data.campaignId?.trim()) errors.push("campaignId is required");
    if (!data.campaignTitle?.trim()) errors.push("campaignTitle is required");
    if (!data.brandName?.trim()) errors.push("brandName is required");
    if (!data.creatorName?.trim()) errors.push("creatorName is required");
  }
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  return errors;
}

export function buildFilter(query = {}) {
  const filter = {};
  if (query.campaignId) filter.campaignId = query.campaignId;
  if (query.creatorName)
    filter.creatorName = { $regex: query.creatorName, $options: "i" };
  if (query.brandName)
    filter.brandName = { $regex: query.brandName, $options: "i" };
  return filter;
}
