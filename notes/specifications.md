# Cookbook Website Specifications

---

## Purpose

To provide a common interface to post and find recipes to fit all types of cooking needs, including cooking meals,
desserts, breads, and baking.

Technical purpose is to help develop full-stack skills and fluency with specific technologies. Those technologies
include React with Typescript, Java using Javalin, and MySQL.

---

## Diagrams

[Wireframes in Figma](https://www.figma.com/design/Hx3vtKCXFi5g6MMalYhWxy/CookBook-Wireframes?node-id=2-2&t=raKiuMf55VLQ5qZJ-0)

[UML Diagrams in LucidChart](https://lucid.app/lucidchart/07936146-58ea-48e8-a4fc-107e084cbcad/edit?beaconFlowId=2009C4B2BFB40410&page=0_0&invitationId=inv_63e03314-02dd-492b-8ab9-c7e369dcdf79#)

---

## Endpoints

### Register a new user

path: /api/user/create  
method: POST

**Request:**

Headers: None  
Body (JSON):  
{  
"username": username,  
"email": email,  
"password": plainTextPassword,  
}

Username and email are unique, all fields must be provided.

**Response:**

Success:  
Status: 201 (Created)  
Body (JSON):  
{  
"username": username,  
"authToken": authToken,  
"favorites": list of recipeIDs and names (should be empty when registered)  
}

Failures:  
Status: 400 (Bad Request - malformed attempt), 409 (Conflict - existing user), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

### Login a user

path: /api/user/login  
method: POST

**Request:**

Headers: None  
Body (JSON):  
{  
"identifier": usernameOrEmail,  
"password": plainTextPassword,  
}

Since both username and email are unique, you can log in with either. All fields must be provided.

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"username": username,  
"authToken": authToken,  
"favorites": list of recipe names and IDs  
}

Failures:  
Status: 400 (Bad request - malformed attempt), 401 (Unauthorized - bad pass or user), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

### Logout a user

path: /api/user/logout  
method: DELETE

**Request:**

Headers: Authentication  
Body:  
None

**Response:**

Success:  
Status: 200 (OK)  
Body:  
None

Failures:  
Status: 401 (Unauthorized - no authentication), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

### Get User for Display

path: /api/user/{username}  
method: GET

**Request:**

Headers: Authentication  
Body:  
None

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"username": username,  
"email": email,  
"favorites": list of favorited recipeIDs and names  
}

Failures:  
Status: 400 (bad request - malformed), 401 (Unauthorized - bad auth), 404 (Not found - username doesn't exist), 500 (
Server error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

### Change Authentication Credentials

path: /api/user/change  
method: PUT

**Request:**

Headers: Authentication  
Body (JSON):  
{  
"username": currentUsername,  
"password": currentPassword,  
"field": "username"/"email"/"password",  
"value": newValue  
}

Username must be provided as the old username and password must be provided as the old password, used for verifying
proper credentials before change. Field must be one of the three options listed (which one to change) and the value
contains the new value to replace the existing. New usernames and emails must remain unique.

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"username": username,  
"email": email,  
"authToken": authToken,  
"favorites": list of recipeIDs and names  
}

Failures:  
Status: 400 (Bad request - malformed), 401 (Unauthorized - bad auth or incorrect password), 409 (Conflict - existing
user or email), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

## Get Recently Added Recipes

path: /api/recipe/recents  
method: GET

**Request:**

Headers: None  
Body:  
None

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"recents": list of recipe IDs and Names  
}

Failure:  
Status: 404 (Not found - no recent recipes), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}

\* will have to use SQL join to get both recipe IDs and names

---

## Get Recipe

path: /api/recipe/{recipeID}  
method: GET  

**Request:**

Headers: None  
Body:  
None  

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"recipeID": recipeID,  
"recipeName": recipeName,  
"postedBy": postedBy,  
"ingredientsList": list of ingredients for the recipe, as a Collection\<Ingredient>,  
"cookTime": cook time,  
"directions": list of instructions, as a Collection\<String>,  
"categoryByType": TypeCategory enum,  
"amount": amount,  
"otherRecipes": list of recipe IDs and names, as a Collection\<recipeTuple>,  
"temperature": temperature,  
"description": description  
}  

Failures:  
Status: 404 (Not found - no recipe by that ID), 500 (Server Error)  
Body (JSON):  
{  
"message": errorMessage  
}  

// note to self - when asking for a recipe to display, backend will also have to return a list of recipeIDs paired with
names for the other recipes portion, because the RecipeData itself only stores a list of the ids. Also, add a java data
object that's just a recipe id and name?

---

## Get Favorites

path: /api/recipe/favorites

**Request:**

Headers: Authentication  
Body: None

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"favorites": list of recipeIDs and names  
}

Failures:
Status: 401 (Unauthorized - bad auth), 404 (Not found - no favorites yet?), 500 (Server error)

---

## Add Recipe

path: /api/recipe/create

**Request:**

Headers: Authentication  
Body (JSON):  
{  
"recipeName": name of recipe,  
"ingredientsList": list of ingredients,  
"cookTime": cook time,  
"directions": list of instructions,  
"categoryByType": category,  
"amount": amount,  
"otherRecipes": other recipes needed,  
"temperature": temperature,  
"description": description  
}

**Response:**

Success:  
Status: 200 (OK)  
Body (JSON):  
{  
"recipeID": recipeID,  
"recipeName": recipeName,  
"postedBy": postedBy,  
"ingredientsList": list of ingredients for the recipe, as a Collection\<Ingredient>,  
"cookTime": cook time,  
"directions": list of instructions, as a Collection\<String>,  
"categoryByType": TypeCategory enum,  
"amount": amount,  
"otherRecipes": list of recipe IDs and names, as a Collection\<recipeTuple>,  
"temperature": temperature,  
"description": description  
}  

Failures:  
Status: 400 (Bad request - malformed), 401 (Unauthorized - bad auth), 409 (Conflict - existing recipe), 500 (Server error)  
Body (JSON):  
{  
"message": errorMessage  
}

---

## Search Engine

- List of all recipes by a certain user can be obtained just with SQL search
- Build a map of keywords, with the key being the keyword and the value being a list of all recipeIDs containing the
  keyword
- Save this map into a SQL table for persistence across reloads
- Update map each time a new recipe is added
- Have a ScheduledExecutorService to update the map each day?
- Build the map in one function, then replace the map being used after the new map is built
- A user types in the query on the frontend, it sends the query to the backend that will search the map and respond with
  an ordered list, top of the list is the closest match
- If more than 50% of the query's characters match a key, the key is included in the result to account for misspelling?
  these are given lower priority. OR see if I can write an algorithm that will determine how many changes are necessary
  to create the token given the user's word. Lower number of edits means the word is closer, therefore include in search
  result.
- exact matches at the top
- Phrase matches have higher priority
- tokenize into individual words, somehow ignore filler words that don't matter - use a predefined list of stopwords,
  include it as a set for the tokenizer to ignore
- If searching, give priority to name matches? - maybe in the dictionary store both the recipe id and a boolean together
  representing the recipe and if the token is part of the name. Then, in the searching algorithm, it can prioritize the
  ones where the boolean is true
- When tokenizing, include: name (set boolean to True in the recipeIndex object), ingredientsList (deal with the
  Ingredient object somehow, probably just a toString), cookTime, directions, and description

---

## Miscellaneous Notes

- Use JDK logging to log events on the server - log to a database table

---

## Java Data Models

UserData:

| Field           | Type                     | Description                                        |
|-----------------|--------------------------|----------------------------------------------------|
| username        | String (255)             |                                                    |
| email           | String (255)             |                                                    |
| password        | String (255)             |                                                    |
| favoriteRecipes | Collection\<recipeTuple> | list of recipeIDs and names the user has favorited |

AuthData:

| Field       | Type          |
|-------------|---------------|
| username    | String (255)  |
| authToken   | String (255)  |
| dateCreated | LocalDateTime |

RecipeData:

| Field           | Type                    | Description                                                           |
|-----------------|-------------------------|-----------------------------------------------------------------------|
| recipeID        | int                     | id of recipe, generated by SQL                                        |
| recipeName      | String (255)            | Name of the recipe                                                    |
| postedBy        | String (255)            | Username of poster                                                    |
| ingredientsList | Collection\<Ingredient> | List of ingredients for the recipe                                    |
| cookTime        | String (255)            | How long to cook, example: 30 minutes, 1.5 hours, 2-3 minutes         |
| directions      | Collection\<String>     | List of instructions, each instruction is a String                    |
| categoryByType  | TypeCategory            | Which category the recipe fits in, defined using an enum              |
| amount          | int                     | Either how many items or how many people it serves                    |
| otherRecipes    | Collection\<int>        | List of other recipeIDs that are necessary for this one (sauces, etc) |
| temperature     | int                     | Temperature the recipe cooks at, if applicable                        |
| description     | String (any length)     | Description of the recipe                                             |

Ingredient:

| Field      | Type         | Description                           |
|------------|--------------|---------------------------------------|
| amount     | String (255) | how much is needed                    |
| amountType | String (255) | what measurement is used (cups, tbps) |
| name       | String (255) | ingredient name                       |

ENUM - TypeCategory:

| Type      | Description                          |
|-----------|--------------------------------------|
| Breakfast | Breakfast foods                      |
| Entree    | Main dishes                          |
| Side      | Sides to accompany entrees           |
| Salad     | Salads (duh)                         |
| Soup      | Soups                                |
| Dessert   | Desserts                             |
| Bread     | Any type of bread                    |
| Snack     | Snacks, appetizers, dips, etc        |
| Sauce     | Something that classifies as a sauce |
| Beverage  | Any kind of drink                    |

searchTable:

| key                 | value       |
|---------------------|-------------|
| String (token)(255) | recipeIndex |

recipeIndex:

| Field      | Type    | Description                                                                   |
|------------|---------|-------------------------------------------------------------------------------|
| id         | int     | Recipe id, matches SQL id                                                     |
| partOfName | boolean | True if the matching token is part of the name of the recipe, false otherwise |

recipeTuple:

| Field | Type   | Description |
|-------|--------|-------------|
| id    | int    | recipeID    |
| name  | String | recipeName  |

---

## SQL Data Tables

users:

| Field           | Type         | Additional                            |
|-----------------|--------------|---------------------------------------|
| id              | int          | NOT_NULL, AUTO_INCREMENT, PRIMARY_KEY |
| username        | VARCHAR(255) | NOT_NULL, INDEX                       |
| email           | VARCHAR(255) | NOT_NULL, INDEX                       |
| password        | VARCHAR(255) | NOT_NULL                              |
| favoriteRecipes | TEXT         | DEFAULT NULL                          |

auth:

| Field       | Type         | Additional                            |
|-------------|--------------|---------------------------------------|
| id          | int          | NOT_NULL, AUTO_INCREMENT, PRIMARY_KEY |
| userID      | int          | NOT_NULL, FOREIGN_KEY                 |
| authToken   | VARCHAR(255) | NOT_NULL, UNIQUE, INDEX               |
| dateCreated | DATETIME     | NOT_NULL, INDEX                       |

recipes:

| Field          | Type                   | Additional                            |
|----------------|------------------------|---------------------------------------|
| id             | int                    | NOT_NULL, AUTO_INCREMENT, PRIMARY_KEY |
| name           | VARCHAR(255)           | NOT_NULL, INDEX                       |
| categoryByType | ENUM(see TypeCategory) | DEFAULT NULL, INDEX                   |
| cookTime       | VARCHAR(255)           | DEFAULT NULL                          |
| temperature    | int                    | DEFAULT NULL                          |
| amount         | int                    | DEFAULT NULL, INDEX                   |
| postedBy       | int                    | NOT_NULL, FOREIGN_KEY                 |
| description    | TEXT                   | DEFAULT NULL                          |
| ingredients    | TEXT                   | DEFAULT NULL                          |
| directions     | TEXT                   | DEFAULT NULL                          |
| otherRecipes   | TEXT                   | DEFAULT NULL                          |

recentlyAddedRecipes:

| Field     | Type     | Additional                            |
|-----------|----------|---------------------------------------|
| id        | int      | NOT_NULL, AUTO_INCREMENT, PRIMARY_KEY |
| recipeID  | int      | NOT_NULL, FOREIGN_KEY                 |
| dateAdded | DATETIME | NOT_NULL, INDEX                       |

\* maximum allowed in recentlyAddedRecipes is 10. If another recipie is added that will put the total over 10, delete
the oldest recipe and add the new one in its place

searchEngine:

| Field | Type         | Additional                    | Description                             |
|-------|--------------|-------------------------------|-----------------------------------------|
| key   | VARCHAR(255) | NOT_NULL, UNIQUE, PRIMARY_KEY | unique search token                     |
| value | TEXT         | DEFAULT NULL                  | list of recipeIndex linked to the token |

logs

| Field   | Type          | Additional                            |
|---------|---------------|---------------------------------------|
| id      | int           | NOT_NULL, AUTO_INCREMENT, PRIMARY_KEY |
| level   | VARCHAR(16)   | NOT_NULL, INDEX                       |
| message | VARCHAR(4096) | DEFAULT NULL                          |
| date    | DATETIME      | NOT_NULL, INDEX                       |