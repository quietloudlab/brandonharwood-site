const { DateTime } = require("luxon");
const eleventyImage = require("@11ty/eleventy-img");
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Split filter for strings
  eleventyConfig.addFilter("split", (string, separator) => string.split(separator));

  // Date formatting filters
  eleventyConfig.addFilter("date", (dateObj, format) => DateTime.fromJSDate(dateObj).toUTC().toFormat(format));
  eleventyConfig.addFilter("dateIso", date => date.toISOString());
  eleventyConfig.addFilter("dateReadable", date => DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL));

  // Limit filter to slice arrays
  eleventyConfig.addFilter("limit", (arr, limit) => arr.slice(0, limit));

  // Filter to exclude specific tags
  eleventyConfig.addFilter("filterTagList", tags => {
    const excludedTags = ["all", "nav", "post", "posts"];
    return (tags || []).filter(tag => !excludedTags.includes(tag));
  });

  // Collection to gather posts from all directories
  eleventyConfig.addCollection("allPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob([
      "src/content/weblogs/**/*.md",
      "src/content/built-things/**/*.md",
      "src/content/collections/**/*.md",
      "src/content/questions/**/*.md",
      "src/content/weird-interactions/**/*.md"
    ]).sort((a, b) => b.date - a.date);  // Sort by most recent date
  });

  // Collection to group posts by their tags
  eleventyConfig.addCollection("postsByTag", function(collectionApi) {
    let tagPosts = {};
    const excludedTags = ["all", "nav", "post", "posts"];

    collectionApi.getFilteredByGlob([
      "src/content/weblogs/**/*.md",
      "src/content/built-things/**/*.md",
      "src/content/collections/**/*.md",
      "src/content/questions/**/*.md",
      "src/content/weird-interactions/**/*.md"
    ]).forEach(post => {
      const tags = (post.data.tags || []).filter(tag => !excludedTags.includes(tag));
      tags.forEach(tag => {
        if (!tagPosts[tag]) {
          tagPosts[tag] = [];
        }
        tagPosts[tag].push(post);
      });
    });

    // Sort posts within each tag by date
    for (let tag in tagPosts) {
      tagPosts[tag].sort((a, b) => b.date - a.date);
    }

    return tagPosts;
  });

  // Add an image shortcode to handle responsive images
  eleventyConfig.addShortcode("image", async function(src, alt, loading = "lazy", className = "") {
    let imagePath;
    
    if (this.page.inputPath.includes('/posts/')) {
      let postFolder = this.page.inputPath.replace(/^\.\/src\/content\/posts\//, "").replace(/\/index\.md$/, "");
      imagePath = `src/content/posts/${postFolder}/${src}`;
    } else {
      imagePath = src;
    }

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

  // Copy static assets and styles to the output directory
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy({
    "src/content/posts/**/": {
      "*.jpg": "img/",
      "*.png": "img/",
      "*.gif": "img/"
    }
  });

  // Readable date for templates
  eleventyConfig.addFilter("readableDate", dateObj => new Date(dateObj).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // HTML date string (for <time> elements)
  eleventyConfig.addFilter("htmlDateString", dateObj => new Date(dateObj).toISOString().split('T')[0]);

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
