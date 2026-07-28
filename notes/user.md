# Users

**What does a User need to consist of, on the server and on the client side?**

Server-side:

* UserId (unique) (partition key)
* Username (unique)
* Email (unique) - maybe implement some sort of email update service eventually?
* Password (hashed and salted, bcrypt)
* Profile picture url - stored in S3

Client-side (private):

* UserId
* Username
* email
* profile picture url

Client-side (public):

* Username
* profile picture url

*A user is associated with a list of favorited recipes and a list of posted recipes. I don't think we need to contain any of that info on the user itself, since the 
username is a unique partition key and can be used in other tables for that purpose*


**Note:** TTL must be in *seconds*, but milliseconds

**Long Term Auth**

Server-side:

* TokenID (Partition key)
* AuthToken (hashed)
* Associated userId
* Created at
* Last used at
* expires at
* revoked at
* ttlAt

Client-side:

* TokenID + authtoken => `${tokenId}.${token}`
* associated userId

**Short Term Auth**

Server-side:

* token id (Partition key)
* AuthToken (hashed)
* Associated userId
* created at
* last used at
* expires at
* revoked at
* ttlAt

Client-side:
* tokenId + authtoken, same as above
* associated userId

*Use crypto.randomBytes(32).toString("base64url") for generating the auth token itself (more secure) then hash it for storage in dynamo*  
*Use crypto.createHash("sha256").update(token).digest("hex") to hash the thing, store the hashed version and compare*  
*To generate the tokenId, use crypto.randomBytes(16).toString("hex") and store this. User gets tokenId.raw_token, when they send it back can validate with that*

Explanation of AuthTokens:

When an AuthToken is created, it gets the token id, the actual token, the associated
username, and the following times: createdAt, lastUsedAt, expiresAt, revokedAt, and ttlAt.

- createdAt is when the token was created, mostly for auditing purposes
- lastUsedAt is when the user last used the authToken
- expiresAt is when the AuthToken expires. For both short-term and long term, this is an x number of minutes from lastUsedAt, up to some maximum computed with createdAt + maximumTimeToLive. expiresAt must not exceed createdAt + maximumTimeToLive. If the user does not use the auth token within the x number of minutes, this is not necessary
- revokedAt is specifically when the AuthToken is revoked. It begins as null, and occurs when the user logs out or logs out of all devices, or if there is a feature to clear cache it also happens then.
- ttlAt is for DynamoDB's TTL feature, normally this is set to whatever expiresAt is set to. When revoked, this will be set to the revokedAt time plus a short period, maybe a day.
- The AuthToken is considered invalid if the current time exceeds the expiresAt or revokedAt time, considering the maximumTimeToLive as well.

Register flow:

- new user info is sent
- info validated and saved
- returns the new user object (always)
- returns the new short-term auth token (always)
- returns the new long-term auth token (if remember me is selected)
- returns an error if failed

Register Request Object therefore needs to have:

- Username
- Email
- Password
- Profile Image data (the actual bytes)
- Remember me?

Register Response Object therefore needs to have:

- Username
- email
- profile picture url (S3 url)
- short term auth token
- long term auth token (if provided)

Login flow:

- user info is sent
- info validated
- returns the user object (always)
- returns the new short-term auth token (always)

Auth Flow:

- when site loads, if a auth token is present send it
- server validates, returns either the user or a 401
- frontend handles accordingly


## API Endpoints:


POST /auth/register
Headers: None

- Must provide the request object with the necessary fields
- Returns the UserDto of the created user, the short-term auth token, and the long-term auth token if requested

POST /auth/login
Headers: None

- Must provide the login credentials, the username/email and password
- Returns the UserDto of the logged-in user, the short-term auth token, and the long-term auth token if requested

GET /auth/session
Headers: Authorization: `Bearer ${long-term-auth-token}`

- Checks if the long term authentication is still good
- Returns the UserDto and short term token
- Used for re-opening the site when "remember me" was selected, so on the same level as login
- Body not allowed in this request

POST /auth/logout
Headers: Authorization: `Bearer ${short-term-auth-token}`
 
- Revokes the given auth token, returns nothing

POST /auth/update-password  
Headers: Authorization: `Bearer ${short-term-auth-token}`

- Changes the user's password, returns a new short-term-auth-token

GET /user/{type}/{id}  
Headers: none

- type can be "username", "email" or "userId", and will get the user by whichever type is provided
- Returns the publicUserDto of the given user, namely username and profile picture
- body not allowed

GET /user/me  
Headers: Authorization: `Bearer ${short-term-auth-token}`

- returns the UserDto of the currently logged in user, including username, email,
and profile picture
- body not allowed

PATCH /user/me/username  
Headers: Authorization `Bearer ${short-term-auth-token}`

- Updates username, gets the user by auth token
- Requires password authentication
- Returns UserDto

PATCH /user/me/email  
Headers: Authorization `Bearer ${short-term-auth-token}`

- Updates email, get the user by auth token
- Requires password authentication
- Returns UserDto

PATCH /user/me/profile-picture
Headers: Authorization `Bearer ${short-term-auth-token}`

- Updates user profile picture, gets the user by auth token
- Returns UserDto


### Databases needed:

**cookbook_users**

Partition key: user_id  
Sort key: none


- Stores the users
- Requires 3 entries per user: first one with the actual generated user_id,
second one with USERNAME#username for a unique username, and a third one
with EMAIL#email for a unique email
- Will have to use a transaction lookup, add, delete for changing usernames 
and emails

**cookbook_long_term_auth**

Partition key: tokenId  
Sort key: none  
TTL: ttlAt
**Note:** TTL must be in *seconds*, but milliseconds

GSI:  
Partition key: username  
Sort key: createdAt

- Stores the long-term auth tokens

**cookbook_short_term_auth**

Partition key: tokenId  
Sort key: none  
TTL: ttlAt
**Note:** TTL must be in *seconds*, but milliseconds

GSI:  
Partition key: username  
Sort Key: createdAt  

- Stores the short-term auth tokens

### S3 Needed:

**cookbook_profile_pictures**

- Only the lambda can access this bucket, using the lambda execution role
- frontend access profile pictures through a CloudFront distribution, for 
security and privacy
- Need to set the CloudFront to the free plan once it gets pushed up

### Lambdas and Endpoints Needed:

1 Lambda per endpoint, use Services and DAOs


POST  /auth/register           201, 400, 409, 422 (password doesn't meet requirements)
POST  /auth/login              200, 400, 401
POST  /auth/logout             204, 401
GET   /auth/session            200, 401
POST  /auth/update-password    200, 400, 401, 422 (password doesn't meet requirements)

GET   /user/{type}/{id}        200, 400, 404
GET   /user/me                 200, 401
PATCH /user/me/username        200, 400, 401, 409
PATCH /user/me/email           200, 400, 401, 409
PATCH /user/me/profile-picture 200, 400, 401, 422 (image data malformed)

**All can return 500

400 bad-request
401 unauthorized
403 forbidden
404 not-found
409 conflict
422 validation-error
500 internal-server-error


**Note:** TTL must be in *seconds*, not milliseconds
**Note:** Lots of things need to change: need to use an immutable userId
for the partition key in the tables, this is better. use mulitiple
indexes for lookup, and use multiple entries for uniqueness: USERNAME#alice
and EMAIL#alice@gmail.com for the unique emails, allowing dynamodb to 
do transactional read/writes

Usernames must have a minimum of 3 characters, passwords must have a minimum of 8
Usernames must have a max of 32 characters, passwords must have a max of 32

All errors coming from AuthService or the DAOs get caught as 500 errors
Errors coming from other services should have the appropriate HTTP code attached
