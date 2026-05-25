# Review & Rate Project Demo Script

## 3-4 Minute Screen Recording Flow

### 0:00 - 0:25 | Introduction

Hi, this is my Review & Rate project. It is a full-stack MERN application where users can discover companies, search by company name or location, view ratings and reviews, create an account, add companies, and submit reviews.

The frontend is built with React, TypeScript, and Vite. The backend is built with Node.js, Express, TypeScript, MongoDB Atlas, and Mongoose. I deployed the backend on Render and the frontend on Vercel.

### 0:25 - 1:05 | Home Page And Company Listing

On the home page, users can see the company list with logo, name, location, average rating, review count, and founded date.

I added sorting so companies can be ordered by name, rating, or date. I also added pagination-style loading so the API supports larger datasets instead of loading everything at once.

The UI follows the provided review platform style and keeps the main actions visible: search, filter by city, add company, and open company details.

### 1:05 - 1:40 | Search And Filter

Now I will demonstrate search. The search works across company name, location, city, and description.

For example, searching by a company name returns matching companies. Searching by a location keyword like Indore, AB road, or Palasia also returns matching companies.

The city field works as an additional location filter. On the backend, I used a MongoDB query with case-insensitive matching so the user does not need to type exact capitalization.

### 1:40 - 2:20 | Authentication

Next, I will show authentication. Users can sign up or log in from the top navigation.

The backend validates the input, hashes passwords with bcrypt, and returns a JWT token. The frontend stores the token in local storage and sends it with protected API requests using an Axios interceptor.

Protected actions, like adding a company or adding a review, require login. If the user is not logged in, the app opens the login modal and shows a clear message.

### 2:20 - 3:00 | Add Company And Reviews

After logging in, I can add a company with name, location, city, founded date, logo, and description.

Then I can open a company's detail page and add a review with a subject, review text, and rating. The backend stores the review and recalculates the company's average rating and review count.

Users can also like and share reviews. These actions update the review data and refresh the detail view.

### 3:00 - 3:35 | Backend And Deployment Decisions

For the backend, I separated the code into routes, controllers, models, validators, middleware, and services. This keeps the project easier to maintain.

I used Zod for request validation, centralized error handling, Helmet for security headers, CORS configuration for the deployed Vercel frontend, and rate limiting to protect the API.

MongoDB Atlas is used as the production database. Render hosts the API, and Vercel hosts the frontend. The frontend uses `VITE_API_URL` to call the deployed backend.

### 3:35 - 4:00 | Closing

Overall, this project demonstrates a complete full-stack review platform with authentication, company management, searching and filtering, review submission, ratings, protected routes, and production deployment.

The key decisions were using TypeScript across the stack, validating backend input, keeping the API modular, and deploying the frontend and backend separately with environment-based configuration.
