// utils/checkLinkedIn.js

const axios = require("axios");

/**
 * Normalize LinkedIn URL
 */
const normalizeUrl = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
};

/**
 * Extract follower count from LinkedIn HTML (best-effort)
 */
const extractFollowers = (html) => {
  try {
    const match = html.match(/"followerCount":(\d+)/);
    return match ? parseInt(match[1]) : null;
  } catch {
    return null;
  }
};

/**
 * Check if a LinkedIn company page is valid
 * @param {string} linkedinUrl
 */
exports.checkLinkedInCompany = async (linkedinUrl) => {
  try {
    if (!linkedinUrl) {
      return { valid: false, message: "LinkedIn URL is required" };
    }

    const normalizedUrl = normalizeUrl(linkedinUrl);

    // Safety: LinkedIn company URLs must include "/company/"
    if (!normalizedUrl.includes("linkedin.com/company/")) {
      return { valid: false, message: "Invalid LinkedIn company URL format" };
    }

    // Fetch the LinkedIn page
    const response = await axios.get(normalizedUrl, {
      timeout: 8000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;

    // Detect LinkedIn "Not Found" or restricted pages
    if (
      html.includes("Page Not Found") ||
      html.includes("This page doesn’t exist")
    ) {
      return { valid: false, message: "LinkedIn company page not found" };
    }

    // Extract follower count (optional)
    const followers = extractFollowers(html);

    return {
      valid: true,
      message: "LinkedIn company page is valid",
      followers: followers || "Not visible",
      statusCode: response.status,
    };
  } catch (error) {
    console.error("LinkedIn Check Error:", error.message);

    return {
      valid: false,
      message:
        error.response?.status === 404
          ? "LinkedIn page does not exist"
          : "Could not verify LinkedIn company page",
      statusCode: error.response?.status || 0,
    };
  }
};
