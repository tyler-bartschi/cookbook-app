# Profile Pictures

Profile pictures are uploaded by `S3ImageStorage` and referenced on the canonical `User` row as a CloudFront URL.

## AWS Storage Resources

`packages/server/template.yaml` defines:

- `profilePicturesBucket`: private S3 bucket named `cookbook-profile-pictures-bartschi`.
- `profilePicturesDistribution`: CloudFront distribution in front of the bucket.
- `profilePicturesOAC`: CloudFront origin access control.
- `profilePicturesBucketPolicy`: allows CloudFront read access to S3 objects.

The bucket blocks public ACLs and public policies, uses AES-256 server-side encryption, enables versioning, and has bucket-owner-enforced object ownership.

The Lambda functions that upload or delete images receive S3 permissions through `S3CrudPolicy`.

## URL Model

The server returns profile picture URLs built from:

```text
<PROFILE_PICTURE_CLOUDFRONT_BASE_URL>/profile-pictures/<userId>/<filename>.<extension>
```

`PROFILE_PICTURE_CLOUDFRONT_BASE_URL` is normalized by removing trailing slashes.

`UserDto.profilePictureUrl` and `PublicUserDto.profilePictureUrl` are either an empty string or a URL.

## S3 Key Model

The uploaded object key is:

```text
profile-pictures/<userId>/<filename>.<imageFileExtension>
```

The filename is the SHA-256 hash of the request's base64 image string.

Consequences:

- Uploading identical base64 data for the same user and extension produces the same key.
- Uploading different bytes produces a different filename.
- The extension is not normalized or restricted by the shared schema.
- The S3 `ContentType` is set to `image/<imageFileExtension>`.

## Registration Upload Behavior

`POST /auth/register` may include image fields.

During registration:

1. The service checks username and email uniqueness.
2. If image fields are present, the service hashes the base64 string into a filename.
3. The image is uploaded to S3.
4. The returned CloudFront URL is stored on the new user.
5. The user is created in DynamoDB.

If image upload fails during registration:

- The error is logged.
- Registration continues.
- The new user is created with `profilePictureUrl` as an empty string.

This means profile picture upload is best-effort during registration, not transactional with user creation.

## Profile Picture Update Behavior

`PATCH /user/me/profile-picture` requires short-term auth but does not require password verification.

Update flow:

1. Validate short-term auth token.
2. Load the associated user.
3. Hash the new base64 image string into a filename.
4. Upload the new object to S3.
5. If the user has an existing `profilePictureUrl`, attempt to delete that old object.
6. Update the user's canonical row with the new URL and `updated_at`.
7. Return the updated `UserDto`.

If old-image deletion fails:

- The server logs the deletion error.
- The server attempts to delete the newly uploaded image as rollback.
- The endpoint returns `500` with a message about failing to delete the old profile picture.
- The user row is not updated to the new URL.

If rollback deletion of the new image also fails:

- The rollback failure is logged.
- The endpoint still returns the original old-image deletion failure.

## Delete Safety Checks

`S3ImageStorage.deleteProfilePicture` receives a URL and extracts its path as the S3 key.

Before deletion, it checks:

- The key is non-empty.
- The key starts with `profile-pictures/`.
- If `userId` is provided, the key starts with `profile-pictures/<userId>/`.

These checks prevent the profile-picture delete path from deleting arbitrary bucket objects or another user's profile picture.

## Validation Limits

The shared request schemas only validate that:

- `imageBytesAsBase64String` is a non-empty string.
- `imageFileExtension` is a non-empty string.

The current code does not enforce:

- Accepted file extensions.
- MIME sniffing.
- Maximum image size.
- Image dimensions.
- Whether the base64 string actually represents a valid displayable image.

Those may be useful future constraints, but they are not current behavior.
