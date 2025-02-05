const { DateTime } = require("luxon");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // Filters
  eleventyConfig.addFilter("date", (dateObj, format) => DateTime.fromJSDate(dateObj).toUTC().toFormat(format));
  eleventyConfig.addFilter("dateIso", date => date.toISOString());
  eleventyConfig.addFilter("dateReadable", date => DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL));
  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));
  
  eleventyConfig.addFilter("split", (string, separator) => string.split(separator));
  eleventyConfig.addFilter("filterTagList", tags => {
    const excludedTags = ["all", "nav", "post", "posts"];
    return (tags || []).filter(tag => !excludedTags.includes(tag));
  });

  // Collections
  eleventyConfig.addCollection("allPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob([
      "src/content/weblogs/**/*.md",
      "src/content/built-things/**/*.md",
      "src/content/collections/**/*.md",
      "src/content/questions/**/*.md",
      "src/content/weird-interactions/**/*.md"
    ]).sort((a, b) => b.date - a.date);
  });

  // Add collections for different content types
  eleventyConfig.addCollection("weblogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/weblogs/*.md");
  });

  eleventyConfig.addCollection("builtThings", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/built-things/*.md");
  });

  // Image shortcode with generalized paths
  eleventyConfig.addShortcode("image", async function(src, alt, loading = "lazy", className = "") {
    let postFolder = this.page.inputPath.replace(/^\.\/src\/content\/.*?\//, "").replace(/\/index\.md$/, "");
    let imagePath = `src/content/${postFolder}/${src}`;

    try {
      let metadata = await eleventyImage(imagePath, {
        widths: [300, 600, 1200],
        formats: ["jpeg", "webp"],
        outputDir: "./_site/img/",
        urlPath: "/img/"
      });

      let imageAttributes = {
        alt,
        class: className,
        sizes: "(max-width: 600px) 100vw, 600px",
        loading,
        decoding: "async",
      };

      return eleventyImage.generateHTML(metadata, imageAttributes);
    } catch (error) {
      console.error(`Error processing image ${imagePath}:`, error);
      return `<!-- Error processing image ${imagePath} -->`;
    }
  });

  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("src/static");
  // eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy({
    "src/content/**/": {
      "*.jpg": "img/",
      "*.png": "img/",
      "*.gif": "img/"
    }
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "layouts"
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk"
  };
};
