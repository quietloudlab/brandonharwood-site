const { DateTime } = require("luxon");
const eleventyImage = require("@11ty/eleventy-img");
const comments = require("./_data/comments/comments.js");
const axios = require('axios');

module.exports = function(eleventyConfig) {
  // Add comments data to global data
  eleventyConfig.addGlobalData("comments", comments);

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

  // Add debug filter
  eleventyConfig.addFilter("dump", (obj, spaces = 2) => {
    return JSON.stringify(obj, null, spaces);
  });

  // Add debug data
  eleventyConfig.addGlobalData("debug", true);

  eleventyConfig.addFilter("getExcerpt", function(post) {
    if (!post || !post.data) {
      return "";
    }

    // First try to get the content from data.page.excerpt if it exists
    if (post.data.page && post.data.page.excerpt) {
      return post.data.page.excerpt;
    }

    // Otherwise try to get raw content
    const content = post.template?.rawContent || '';
    
    // Clean up the content
    const plainText = content
      .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
      .replace(/<[^>]*>/g, '')        // Remove HTML tags
      .replace(/\n/g, ' ')            // Replace newlines with spaces
      .replace(/\s+/g, ' ')           // Normalize spaces
      .trim();
    
    // Get first 150 words
    const words = plainText.split(/\s+/).slice(0, 150);
    return words.join(' ') + (words.length >= 150 ? '...' : '');
  });

  // Collections
  eleventyConfig.addCollection("allPosts", function(collectionApi) {
    return collectionApi.getAll().filter(item => {
      // Filter for items that should be in the feed
      return item.data.type !== undefined;
    });
  });

  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: function (data) {
      if (data.page.inputPath.includes("/weblogs/")) return "post";
      if (data.page.inputPath.includes("/collections/")) return "collection";
      if (data.page.inputPath.includes("/made-things/")) return "experiment";
      if (data.page.inputPath.includes("/weird-interactions/")) return "interaction";
      if (data.page.inputPath.includes("/questions/")) return "post";
      return "base";  // Default layout if not matched
    },
    type: function (data) {
      if (data.page.inputPath.includes("/weblogs/")) return "weblog";
      if (data.page.inputPath.includes("/collections/")) return "collection";
      if (data.page.inputPath.includes("/made-things/")) return "made thing";
      if (data.page.inputPath.includes("/weird-interactions/")) return "weird interaction";
      if (data.page.inputPath.includes("/questions/")) return "answered question";
      return "unknown";
    },
    linkPreviewImage: async function(data) {
      if (data?.items) {
        return await Promise.all(data.items.map(async (item) => {
          if (item.type === "link") {
            try {
              const response = await axios.get(`https://api.microlink.io/?url=${item.content}`);
              return response.data?.data?.image?.url || 'https://via.placeholder.com/400';
            } catch (error) {
              console.error(`Error fetching link preview for ${item.content}:`, error);
              return 'https://via.placeholder.com/400';
            }
          }
          return '';
        }));
      }
      return [];
    }
  });

  // Add collections for different content types
  eleventyConfig.addCollection("weblogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/weblogs/*.md")
      .sort((a, b) => {
        const dateA = a.data.date || a.date;
        const dateB = b.data.date || b.date;
        return dateB.getTime() - dateA.getTime();
      });
  });

  eleventyConfig.addCollection("collections", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/collections/*.md")
      .sort((a, b) => {
        const dateA = a.data.date || a.date;
        const dateB = b.data.date || b.date;
        return dateB.getTime() - dateA.getTime();
      });
  });

  eleventyConfig.addCollection("madeThings", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/made-things/*.md")
      .sort((a, b) => {
        const dateA = a.data.date || a.date;
        const dateB = b.data.date || b.date;
        return dateB.getTime() - dateA.getTime();
      });
  });

  eleventyConfig.addCollection("weirdInteractions", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/weird-interactions/*.md")
      .sort((a, b) => {
        const dateA = a.data.date || a.date;
        const dateB = b.data.date || b.date;
        return dateB.getTime() - dateA.getTime();
      });
  });

  eleventyConfig.addCollection("questions", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/questions/*.md")
      .sort((a, b) => {
        const dateA = a.data.date || a.date;
        const dateB = b.data.date || b.date;
        return dateB.getTime() - dateA.getTime();
      });
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

  eleventyConfig.addFilter('removeDefaultTags', function(tags) {
    const defaultTags = ['post', 'all', 'posts'];
    return tags ? tags.filter(tag => !defaultTags.includes(tag)) : [];
  });

// Filters and Passthrough Copies (keep everything else as-is)
eleventyConfig.addPassthroughCopy("src/images");
eleventyConfig.addPassthroughCopy("src/static");
eleventyConfig.addPassthroughCopy("src/scripts");
eleventyConfig.addPassthroughCopy("admin");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "layouts",
      layouts: "layouts"
    },
    templateFormats: ["njk", "md"],
    markdownTemplateEngine: "njk"
  };
};