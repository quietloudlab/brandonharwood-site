const { DateTime } = require("luxon");
const eleventyImage = require("@11ty/eleventy-img");
const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Custom date filter to ensure UTC handling
  eleventyConfig.addFilter("date", (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toUTC().toFormat(format);
  });

  // Add date filters
  eleventyConfig.addFilter("dateIso", date => date.toISOString());
  eleventyConfig.addFilter("dateReadable", date => 
    DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL)
  );

  // Add slice filter for limiting arrays
  eleventyConfig.addFilter("slice", (array, start, end) => {
    return array.slice(start, end);
  });

  // Add filter to remove specific tags from tag list
  eleventyConfig.addFilter("filterTagList", function(tags) {
    const excludedTags = ["all", "nav", "post", "posts"];
    return (tags || []).filter(tag => !excludedTags.includes(tag));
  });

  // Get Previous/Next post filters
  eleventyConfig.addFilter("getPreviousCollectionItem", (collection) => {
    return collection.slice(-1)[0] || null;
  });

  eleventyConfig.addFilter("getNextCollectionItem", (collection) => {
    return collection[0] || null;
  });

  // Create tag-based collections
  eleventyConfig.addCollection("tagList", function(collection) {
    const excludedTags = ["all", "nav", "post", "posts"];
    let tagSet = new Set();
    
    collection.getAll().forEach(item => {
      if (!item.data.tags) return;
      item.data.tags
        .filter(tag => !excludedTags.includes(tag))
        .forEach(tag => tagSet.add(tag));
    });
    
    return [...tagSet].sort();
  });

  // Add a collection for all posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/posts/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Add collections for each tag
  eleventyConfig.addCollection("postsByTag", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("src/content/posts/**/*.md");
    let tagPosts = {};
    const excludedTags = ["all", "nav", "post", "posts"];
    
    posts.forEach(post => {
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

  // Update the image shortcode to handle both post pages and index listing
  eleventyConfig.addShortcode("image", async function(src, alt, loading, className) {
    // If src already includes the full path, use it directly
    let imagePath = src;
    
    // If we're in a post page, construct the path from the current page
    if (this.page.inputPath.includes('/posts/')) {
      let postFolder = this.page.inputPath
        .replace(/^\.\/src\/content\/posts\//, "")
        .replace(/\/index\.md$/, "");
      imagePath = `src/content/posts/${postFolder}/${src}`;
    }

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
  });

  // Remove the old passthrough copy for images
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  
  // Update the image handling to use a more specific path and output structure
  eleventyConfig.addPassthroughCopy({
    "src/content/posts/**/": {
      "*.jpg": "img/",
      "*.png": "img/",
      "*.gif": "img/"
    }
  });

  // Add date filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  // Load comments data
  eleventyConfig.addGlobalData("comments", () => {
    const commentsDir = path.join(__dirname, '_data/comments');
    const comments = {};
    
    if (fs.existsSync(commentsDir)) {
      fs.readdirSync(commentsDir).forEach(file => {
        if (file.endsWith('.json')) {
          const slug = file.replace('.json', '');
          const content = fs.readFileSync(path.join(commentsDir, file), 'utf8');
          comments[slug] = JSON.parse(content);
        }
      });
    }
    
    return comments;
  });

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
