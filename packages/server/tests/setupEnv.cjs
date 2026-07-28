process.env.PROFILE_PICTURE_CLOUDFRONT_BASE_URL ??= "https://example.cloudfront.net";

jest.spyOn(console, "error").mockImplementation(() => {});
