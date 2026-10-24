import eleventyImage from "@11ty/eleventy-img";
import path from "node:path";
import { readFileSync } from "node:fs";
import CleanCSS from "clean-css";

const cleanCss = new CleanCSS({ level: 2 });

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

  // Strip the newline/indentation that a bare {% tag %} on its own line
  // would otherwise leave behind -- without this every {% for %}/{% if %}
  // block in the templates emits a blank, whitespace-only line into the
  // output HTML (fails html-validate's no-trailing-whitespace rule).
  eleventyConfig.setNunjucksEnvironmentOptions({
    trimBlocks: true,
    lstripBlocks: true,
  });

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
        formats = ["avif", "webp", "jpeg"],
      } = options;

      const inputPath = path.join("src/images/gallery", src);
      let metadata;
      try {
        metadata = await eleventyImage(inputPath, {
          // No trailing `null` (= "also emit the original full-resolution
          // size") here: for a 72px thumbnail, widths:[120] must mean
          // 120w is the ceiling. Appending null blew that range open to
          // the full ~1360w source, so the browser's srcset algorithm had
          // nothing between 120w and 1360w to pick for a 72px slot and
          // chose the full-size image -- ~600KB of wasted thumbnail
          // downloads per carousel, and part of why LCP looked worse than
          // it should. Callers that want a genuine "up to full size" range
          // (hero, gallery slides) already pass widths up to 1600/2000,
          // which eleventy-img naturally caps at the source's real size.
          widths,
          formats,
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
      };
      // generateHTML stringifies every key it's given, so an `undefined`
      // value becomes the literal attribute class="undefined" -- only set
      // the key at all when there's a real class to add.
      if (cls) {
        imageAttributes.class = cls;
      }
      if (fetchpriority) {
        imageAttributes.fetchpriority = fetchpriority;
      }

      return eleventyImage.generateHTML(metadata, imageAttributes, {
        whitespaceMode: "inline",
      });
    }
  );

  // Emits a <link rel="preload" as="image"> for the hero's AVIF srcset, so
  // the browser's preload scanner can start fetching it immediately from
  // <head> instead of waiting to reach the <picture> markup in the body --
  // matters for LCP on the hero image specifically.
  eleventyConfig.addAsyncShortcode("heroImagePreload", async function (src) {
    const inputPath = path.join("src/images/gallery", src);
    const metadata = await eleventyImage(inputPath, {
      widths: [480, 768, 1080, 1600, 2000],
      formats: ["avif"],
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
    const srcset = metadata.avif.map((entry) => `${entry.url} ${entry.width}w`).join(", ");
    return `<link rel="preload" as="image" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high">`;
  });

  // Returns just the largest-JPEG URL for a gallery image (plain string, for
  // use inside sitemap.xml's <image:loc> -- Eleventy shortcodes are
  // Nunjucks *tags*, not callable globals, so this is invoked as
  // `{% imageUrl file %}`, never `{{ imageUrl(file) }}`).
  eleventyConfig.addAsyncShortcode(
    "imageUrl",
    async function (src) {
      const inputPath = path.join("src/images/gallery", src);
      const metadata = await eleventyImage(inputPath, {
        widths: [2000],
        formats: ["jpeg"],
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
      const jpegs = metadata.jpeg;
      return jpegs[jpegs.length - 1].url;
    }
  );

  // ---- Filters ----
  eleventyConfig.addFilter("whatsappUrl", function (number, message) {
    const text = encodeURIComponent(message || "");
    return `https://wa.me/${number}?text=${text}`;
  });

eleventyConfig.addFilter("jsonify", function (obj) {
    return JSON.stringify(obj);
  });

  // Is a config value "really set" (not empty, not a TODO_OWNER placeholder)?
  function isSet(val) {
    return Boolean(val) && !(typeof val === "string" && val.startsWith("TODO"));
  }
  eleventyConfig.addFilter("isSet", isSet);

  eleventyConfig.addFilter("heroSlide", function (slides) {
    return (
      slides.find((s) => s.hero && s.show && !s.missing) ||
      slides.find((s) => s.show && !s.missing)
    );
  });

  // Picks the gallery photo flagged "stays": true for the Stays section
  // (a bedroom/living-room shot, ideally); falls back to the last visible
  // slide if nothing is flagged yet, so the section never breaks while the
  // owner hasn't tagged a photo.
  eleventyConfig.addFilter("staysSlide", function (slides) {
    const visible = slides.filter((s) => s.show && !s.missing);
    return visible.find((s) => s.stays) || visible[visible.length - 1];
  });

  eleventyConfig.addFilter("visibleSlides", function (slides) {
    return slides.filter((s) => s.show && !s.missing);
  });

  eleventyConfig.addFilter("findSlideByFile", function (slides, file) {
    return slides.find((s) => s.file === file && s.show && !s.missing);
  });

  // The Reviews nav link only makes sense once the Reviews section
  // actually renders (it hides itself while reviews.json is empty).
  eleventyConfig.addFilter("filterNav", function (navItems, reviews) {
    if (reviews && reviews.length > 0) return navItems;
    return navItems.filter((item) => item.href !== "#reviews");
  });

  // Builds the full JSON-LD @graph for the page (one LodgingBusiness/EventVenue
  // node, WebSite, WebPage, FAQPage) from the raw data files. Built in JS
  // rather than assembled in Nunjucks so optional fields can be added
  // conditionally without fragile object-merge template logic.
  eleventyConfig.addShortcode(
    "schemaGraph",
    function (site, content, faq, buildDate) {
      const url = (relativeUrl) => {
        const cleanPrefix = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
        const cleanUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
        return `${cleanPrefix}${cleanUrl}`;
      };

      const villaId = `${site.baseUrl}/#villa`;
      const websiteId = `${site.baseUrl}/#website`;
      const webpageId = `${site.baseUrl}/#webpage`;
      const ogImage = `${site.baseUrl}${url("/images/site/og-image.jpg")}`;

      const amenities = [
        "Lawn",
        "Rooftop terrace with gazebo",
        "Garden swing",
        "Badminton",
        "Table tennis",
        "Kitchen",
        "On-site caretaker",
        "On-site parking",
      ];

      const sameAs = [site.instagram, site.googleMapsUrl, site.airbnbUrl].filter(isSet);

      const villaNode = {
        "@type": ["LodgingBusiness", "EventVenue"],
        "@id": villaId,
        name: site.name,
        alternateName: site.alternateNames,
        description: content.meta.description,
        url: `${site.baseUrl}/`,
        telephone: site.phoneE164,
        image: [ogImage],
        logo: `${site.baseUrl}${url("/assets/brand/logo.svg")}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${site.address.street}, ${site.address.locality}`,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        },
        hasMap: site.googleMapsUrl,
        priceRange: site.priceRange,
        numberOfRooms: 4,
        amenityFeature: amenities,
        maximumAttendeeCapacity: 50,
        areaServed: "Mumbai",
        containedInPlace: { "@type": "Place", name: "Gorai, Borivali West, Mumbai" },
      };

      if (site.geo && site.geo.lat && site.geo.lng) {
        villaNode.geo = {
          "@type": "GeoCoordinates",
          latitude: site.geo.lat,
          longitude: site.geo.lng,
        };
      }
      if (isSet(site.email)) villaNode.email = site.email;
      if (isSet(site.checkIn)) villaNode.checkinTime = site.checkIn;
      if (isSet(site.checkOut)) villaNode.checkoutTime = site.checkOut;
      if (sameAs.length > 0) villaNode.sameAs = sameAs;

      const graph = [
        villaNode,
        {
          "@type": "WebSite",
          "@id": websiteId,
          name: site.name,
          url: `${site.baseUrl}/`,
          inLanguage: "en-IN",
          publisher: { "@id": villaId },
        },
        {
          "@type": "WebPage",
          "@id": webpageId,
          url: `${site.baseUrl}/`,
          name: content.meta.title,
          about: { "@id": villaId },
          primaryImageOfPage: ogImage,
          isPartOf: { "@id": websiteId },
          datePublished: buildDate,
          dateModified: buildDate,
          inLanguage: "en-IN",
        },
        {
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ];

      return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    }
  );

  // url filter that respects pathPrefix, usable in templates: {{ "/foo.css" | url }}
  eleventyConfig.addFilter("url", function (relativeUrl) {
    if (!relativeUrl) return pathPrefix;
    if (/^https?:\/\//.test(relativeUrl)) return relativeUrl;
    const cleanPrefix = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
    const cleanUrl = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${cleanPrefix}${cleanUrl}` || "/";
  });

  // Inlines a CSS file's contents (tokens.css, fonts.css, main.css) straight
  // into <head> as a single <style> block, instead of 3 separate
  // render-blocking <link rel="stylesheet"> requests (Section 7.6: "Critical
  // CSS inlined, or a single small CSS file"). fonts.css's @font-face rules
  // use paths relative to assets/css/ (../fonts/...); those only resolve
  // correctly from a real external stylesheet, so once inlined into the
  // page itself they're rewritten to pathPrefix-aware absolute URLs.
  eleventyConfig.addShortcode("inlineCSS", function (relativePath) {
    const filePath = path.join("src", relativePath);
    const css = readFileSync(filePath, "utf8");
    const cleanPrefix = pathPrefix.endsWith("/") ? pathPrefix.slice(0, -1) : pathPrefix;
    const rewritten = css.split('"../fonts/').join(`"${cleanPrefix}/assets/fonts/`);
    const minified = cleanCss.minify(rewritten);
    if (minified.errors.length) {
      console.warn(`[inlineCSS] WARNING: could not minify ${relativePath}: ${minified.errors.join("; ")}`);
      return rewritten;
    }
    return minified.styles;
  });

  eleventyConfig.addGlobalData("pathPrefix", pathPrefix);
  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().split("T")[0]);
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

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
