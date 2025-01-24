const { DateTime } = require("luxon");
const eleventyImage = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  // Custom date filter to ensure UTC handling
  eleventyConfig.addFilter("date", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toUTC().toFormat(format);
  });

  // Collection to get all blog posts sorted by date
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/posts/**/*.md")
      .sort((a, b) => new Date(b.date || b.page.date) - new Date(a.date || a.page.date));
  });

  // Add an image shortcode to process and optimize images
  eleventyConfig.addShortcode("image", async function(src, alt, loading, className) {
    let postFolder = this.page.inputPath
      .replace(/^\.\/src\/content\/posts\//, "")
      .replace(/\/index\.md$/, "");

    let metadata = await eleventyImage(`src/content/posts/${postFolder}/${src}`, {
      widths: [300, 600, 1200],
      formats: ["jpeg", "webp"],
      outputDir: "./_site/img/"
    });

    let imageAttributes = {
      alt,
      class: className,
      sizes: "(max-width: 600px) 100vw, 600px",
      loading,
      decoding: "async",
    };

    return eleventyImage.generateHTML(metadata, imageAttributes);
  });

  // Pass through static files and post-specific images
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/content/posts");
  eleventyConfig.addPassthroughCopy("src/content/posts/**/img_*.jpg");

return {
  dir: {
    input: "src",
    output: "_site",
    includes: "_includes",
    layouts: "layouts"
  },
  pathPrefix: "/",
  templateFormats: ["njk", "md"],
  markdownTemplateEngine: "njk"
};
};
