# What is the Purpose of This Project?

## Learning Outcomes

- Gaining familiarity and using cloud computing resources, specifically through AWS
- Deploying cloud resources using automated tools, specifically SAM and GitHub workflows
- Deepen understanding of backend systems, and using proper architecture to achieve the desired results, specifically in Node JS using Typescript
- Deepen understanding of frontend systems, specifically using React and Vite with Typescript
- Develop a greater ability to write proper tests, including unit and integration tests, specifically with Jest and TS-Mockito
- Use minimal AI coding resources (treat it as a TA and instructor, not as a tool to accomplish the actual code), specifically so I can gain the skills to effectively use AI in other projects (and because I want to have fun building)
- Develop a usable application, and actually use it to store my recipes

## Tech Stack

Backend:

- AWS Lambda
- AWS SQS
- AWS DynamoDB
- AWS ApiGateway
- NodeJS
- Some sort of Vector Database (coming soon)(?)

Frontend:

- React with Vite
- AWS CloudFront
- AWS Certificate Manager
- AWS Route53

Both:

- AWS S3
- AWS CloudFormation/SAM
- GitHub Workflows (for CI)

## What is this application?

The application is a recipe website, built for saving and sharing recipes for both your personal use and for other's use as well.

Application Benchmarks:

1. Have both an authenticated and guest view of the website. Further details below on what this entails.
2. Efficiently store recipes for retrieval and for search
3. Keep track of metrics such as most recently added recipes, favorited recipes, and the number of "stars" (favorited) the recipe has accrued
4. In the guest view of the website, a user should be able to:
    * View recently added recipes
    * View a "top 10 list" of most favorited recipes
    * Search for any public recipe
    * Be able to click on a recipe to view it's details and linked recipes
5. In the authenticated (logged in) view of the webiste, a user should be able to:
    * Make edits to their account: profile picture, username/email/password change, logout, delete the account
    * Username and email must be unique
    * Temp auth tokens stored for 1 - 1.5 hours, long-lasting remember me tokens stored for 2 weeks (?)
    * Do all the same as an guest viewer
    * Additonally, view a list of favorited recipes
    * When viewing a particular recipe, be able to favorite that recipe
    * Post a recipe
    * Edit a posted recipe
    * Delete a posted recipe
    * Leave comments on a recipe (?)
    * Have a "remember me" feature for logging back in
6. Features of the recipes themselves
    * Primary Key will consist of recipe name (partition) and username (sort)
    * Contain instructions, ingredients, cook times, how many it feeds, linked recipes, category, etc.
    * Displays the username of who posted it, if this username is changed it should update on all of that user's recipes
    * Searchable - this may involve keyword search or a vector database RAG-type search
7. Benchmark Metrics:
    * Post a recipe in ≈ 1 second
    * Retrieve most recent recipes in ≈ 1 second
    * Retrieve favorited recipes in ≈ 1 second
    * Change username/email/password in ≈ 1 second
    * Return search results in ≈ 5 seconds? No clue what might be good here
