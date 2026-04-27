# Users

**What does a User need to consist of, on the server and on the client side?**

Server-side:

* Username (unique) (parition key)
* Email (unique) - maybe implement some sort of email update service eventually?
* Password (hashed and salted, bcrypt)
* Profile picture url - stored in S3

Client-side:

* Username
* email
* profile picture url

*A user is associated with a list of favorited recipes and a list of posted recipes. I don't think we need to contain any of that info on the user itself, since the 
username is a unique partition key and can be used in other tables for that purpose*

**Long Term Auth**

Server-side:

* TokenID (parition key)
* AuthToken (hashed)
* Associated username
* Created at
* Last used at
* expires at
* revoked at
* ttlAt

Client-side:

* TokenID + authtoken => `${tokenId}.${token}`
* associated username

**Short Term Auth**

Server-side:

* token id (parition key)
* AuthToken (hashed)
* Associated username
* created at
* last used at
* expires at
* revoked at
* ttlAt

Client-side:
* tokenId + authtoken, same as above
* associated username

*Use crypto.randomBytes(32).toString("base64url") for generating the auth token itself (more secure) then hash it for storage in dynamo*  
*Use crypto.createHash("sha256").update(token).digest("hex") to hash the thing, store the hashed version and compare*  
*To generate the tokenId, use crypto.randomBytes(16).toString("hex") and store this. User gets tokenId.raw_token, when they send it back can validate with that*

Explanation of AuthTokens:

When an AuthToken is created, it gets the token id, the actual token, the associated
username, and the following times: createdAt, lastUsedAt, expiresAt, revokedAt, and ttlAt.

- createdAt is when the token was created, mostly for auditing purposes
- lastUsedAt is when the user last used the authToken
- expiresAt is when the AuthToken expires. For both short-term and long term, this is an x number of minutes from lastUsedAt, up to some maximum computed with createdAt + maximumTimeToLive. expiresAt must not exceed createdAt + maximumTimeToLive. If the user does not use the auth token within the x number of minutes, this is not necessary
- revokedAt is specifically when the AuthToken is revoked. It begins as undefined, and occurs when the user logs out or logs out of all devices, or if there is a feature to clear cache it also happens then.
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


API Endpoints:

GET /user/{username}
Headers: Authorization: `Bearer ${short-term-auth-token}`

- Returns the UserDto of the given user, if the auth token matches that user's auth token

POST /auth/register
Headers: None

- Must provide the request object with the necessary fields
- Returns the UserDto of the created user, the short-term auth token, and the long-term auth token if requested

POST /auth/login
Headers: None

- Must provide the login credentials, the username/email and password
- Returns the UserDto of the created user, the short-term auth token, and the long-term auth token if requested

GET /auth/me
Headers: Authorization: `Bearer ${long-term-auth-token}`

- Checks if the long term authentication is still good
- Returns the UserDto and short term token

POST /auth/logout
Headers: Authorization: `Bearer ${short-term-auth-token}`
 
- Revokes the given auth token

PATCH /user/{username}
Headers: Authorization `Bearer ${short-term-auth-token}`

- Updates username, email, or profile picture, given those fields

POST /auth/change-password/{username}
Headers: Authorization: `Bearer ${short-term-auth-token}`

- Changes the user's password


### Databases needed:

**cookbook-users**

Parition key: Username  
Sort key: none

GSI:  
Parition key: email  
Sort key: none  

- Stores the users

**cookbook-long-term-auth**

Partition key: tokenId  
Sort key: none  
TTL: ttlAt

GSI:  
Partition key: username  
Sort key: createdAt

- Stores the long-term auth tokens

**cookbook-short-term-auth**

Partition key: tokenId  
Sort key: none  
TTL: ttlAt

GSI:  
Parition key: username  
Sort Key: createdAt  

- Stores the short-term auth tokens

### S3 Needed:

**cookbook-profile-pictures**

- Only the lambda can access this bucket, using the lambda execution role

### Lambdas and Endpoints Needed:

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/change-password/{username}
- GET /auth/me
- GET /user/{username}
- PATCH /user/{username}

1 Lambda per endpoint, use Services and DAOs