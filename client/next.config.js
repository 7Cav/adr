/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [
      {
        source: "/_next/static/chunks/app/skunkworks/:path*.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, must-revalidate",
          },
        ],
      },
    ];
  },
};
