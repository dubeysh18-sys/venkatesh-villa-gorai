import eleventyImage from "@11ty/eleventy-img";
import path from "node:path";

const pathPrefix = process.env.PATH_PREFIX || "/";

export default function (eleventyConfig) {
  // Static passthroughs
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/assets/brand");
  eleventyConfig.addPassthroughCopy({ "src/images/site": "images/site" });
  eleventyConfig.addPassthroughCopy("src/CNAME");

  eleventyConfig.setServerOptions({ port: 8080 });

  // ---- Image shortcode: builds AVIF + WebP + JPEG at multiple widths ----
  eleventyConfig.addAsyncShortcode(
    "image",
    async function (src, alt, options = {}) {
      if (!alt && alt !== "") {
        throw new Error(`Missing \`alt\` text for image: ${src}`);
      }
      const {
        widths = [480, 768, 1080, 1600, 2000],
        sizes = "100vw",
        loading = "lazy",
        fetchpriority = null,
        cls = "",
      } = options;

      const inputPath = path.join("src/images/gallery", src);
      let metadata;
      try {
        metadata = await eleventyImage(inputPath, {
          widths: [...widths, null],
          formats: ["avif", "webp", "jpeg"],
          outputDir: "_site/images/optimized/",
          urlPath: `${pathPrefix}images/optimized/`,
          filenameFormat: function (id, src, width, format) {
            const base = path
              .basename(src, path.extname(src))
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return `${base}-${width}w.${format}`;
          },
        });
      } catch (err) {
        console.warn(`[image] WARNING: could not process ${src}: ${err.message}`);
        return "";
      }

      const imageAttributes = {
        alt,
        sizes,
        loading: fetchpriority ? "eager" : loading,
        decoding: "async",
        class: cls || undefined,
      };
      if (fetchpriority) {
        imageAttributes.fetchpriority = fetchpriority;
      }

      return eleventyImage.generateHTML(metadata, imageAttributes, {
        whitespaceMode: "inline",
      });
    }
  );

  // Expose raw metadata (used for <picture> hero + preload + OG image source)
  eleventyConfig.addAsyncShortcode(
    "imageMeta",
    async function (src, options = {}) {
      const { widths = [480, 768, 1080, 1600, 2000] } = options;
      const inputPath = path.join("src/images/gallery", src);
      return eleventyImage(inputPath, {
        widths: [...widths, null],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "_site/images/optimized/",
        urlPath: `${pathPrefix}images/optimized/`,
        filenameFormat: function (id, src, width, format) {
          const base = path
            .basename(src, path.extname(src))
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return `${base}-${width}w.${format}`;
        },
      });
    }
  );

  // ---- Filters ----
  eleventyConfig.addFilter("whatsappUrl", function (number, message) {
    const text = encodeURIComponent(message || "");
    return `https://wa.me/${number}?text=${text}`;
  });

  eleventyConfig.addFilter("dirUrl", function (googleMapsUrl, directionsUrl) {
    return directionsUrl || googleMapsUrl;
  });

  eleventyConfig.addFilter("year", function () {
    return new Date().getFullYear();
  });

  eleventyConfig.addFilter("isoDate", function () {
    return new Date().toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("jsonify", function (obj) {
    return JSON.stringify(obj);
  });

  // url filter that respects pathPrefix, usable in templates: {{ "/foo.css" | url }}
  eleventyConfig.addFilter("url", function (relativeUrl) {
    if (!relativeUrl) return pathPrefix;
    if (/^https?:\/\//.test(relativeUrl)) return relativeUrl;
    const cleanPrefix = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
    const cleanUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${cleanPrefix}${cleanUrl}` || "/";
  });

  eleventyConfig.addGlobalData("pathPrefix", pathPrefix);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    pathPrefix,
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
