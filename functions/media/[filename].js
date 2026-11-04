
/*
 * Area71 MPS - R2 Video Streaming
 * URL: /media/area71-mps-introduction-mobile.mp4
 * R2 binding: MPS_MEDIA
 */

const VIDEO_NAME = "area71-mps-introduction-mobile.mp4";

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  if (params.filename !== VIDEO_NAME) {
    return new Response("Not found", { status: 404 });
  }

  if (!env.MPS_MEDIA) {
    return new Response("Video storage not configured", {
      status: 503
    });
  }

  try {
    const metadata = await env.MPS_MEDIA.head(VIDEO_NAME);

    if (!metadata) {
      return new Response("Video not found", { status: 404 });
    }

    const size = metadata.size;
    let start = 0;
    let end = size - 1;
    let partial = false;

    const rangeHeader = request.headers.get("Range");

    function invalidRange() {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${size}`,
          "Accept-Ranges": "bytes"
        }
      });
    }

    if (rangeHeader && request.method === "GET") {
      const match = /^bytes=(\d*)-(\d*)$/.exec(
        rangeHeader.trim()
      );

      if (!match || (!match[1] && !match[2])) {
        return invalidRange();
      }

      if (!match[1]) {
        const suffix = Number(match[2]);

        if (!Number.isSafeInteger(suffix) || suffix < 1) {
          return invalidRange();
        }

        start = Math.max(0, size - suffix);
      } else {
        start = Number(match[1]);

        if (!Number.isSafeInteger(start) || start >= size) {
          return invalidRange();
        }

        if (match[2]) {
          const requestedEnd = Number(match[2]);

          if (!Number.isSafeInteger(requestedEnd)) {
            return invalidRange();
          }

          end = Math.min(requestedEnd, size - 1);
        }
      }

      if (end < start) {
        return invalidRange();
      }

      partial = true;
    }

    const headers = new Headers();

    metadata.writeHttpMetadata(headers);

    headers.set("Content-Type", "video/mp4");
    headers.set("Content-Disposition", "inline");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("ETag", metadata.httpEtag);

    const length = end - start + 1;

    headers.set(
      "Content-Length",
      String(partial ? length : size)
    );

    if (partial) {
      headers.set(
        "Content-Range",
        `bytes ${start}-${end}/${size}`
      );
    }

    if (request.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers
      });
    }

    const video = await env.MPS_MEDIA.get(
      VIDEO_NAME,
      partial
        ? { range: { offset: start, length } }
        : undefined
    );

    if (!video || !video.body) {
      return new Response("Video unavailable", {
        status: 500
      });
    }

    return new Response(video.body, {
      status: partial ? 206 : 200,
      headers
    });

  } catch (error) {
    console.error("MPS video streaming error:", error);

    return new Response("Video temporarily unavailable", {
      status: 500
    });
  }
}
