// utils/checkWebsite.js
const axios = require("axios");

/**
 * Normalize URL — ensure https:// exists
 */
const normalizeUrl = (url) => {
  if (!url) return null;
  url = url.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
};

/**
 * Check if a company website exists and looks like a business site
 */
const checkCompanyWebsite = async (websiteUrl) => {
  try {
    const normalizedUrl = normalizeUrl(websiteUrl);
    if (!normalizedUrl) {
      return { valid: false, message: "Invalid website URL" };
    }

    // Check base website
    const baseResponse = await axios.get(normalizedUrl, {
      timeout: 6000,
      validateStatus: (status) => status < 500,
    });

    if (baseResponse.status < 200 || baseResponse.status >= 400) {
      return {
        valid: false,
        statusCode: baseResponse.status,
        message: "Website is not reachable",
      };
    }

    // Check important business pages
    const importantPages = ["/about", "/contact", "/services", "/careers"];
    const pagesFound = [];

    for (let page of importantPages) {
      try {
        const res = await axios.get(normalizedUrl + page, {
          timeout: 4000,
          validateStatus: (status) => status < 500,
        });
        if (res.status >= 200 && res.status < 400) {
          pagesFound.push(page);
        }
      } catch (_) {}
    }

    return {
      valid: true,
      statusCode: baseResponse.status,
      pagesFound,
      normalizedUrl,
      message: "Website verified successfully",
    };
  } catch (err) {
    return {
      valid: false,
      statusCode: 0,
      message: "Website verification failed",
    };
  }
};

module.exports = { checkCompanyWebsite, normalizeUrl };
