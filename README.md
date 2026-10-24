# YatraAI

### AI-Based Travel Recommendation System

YatraAI is a travel recommendation and trip planning web application developed as a college project.

The main purpose of this project is to help users find suitable travel destinations in India based on their budget, interests, season, climate preference, trip duration, and group size.

The project uses a **rule-based recommendation system** to compare user preferences with destination data and suggest suitable places.

[**Live Project**](https://yatra-vibe-finder.onrender.com/)

---

## Features

- Destination recommendations based on user preferences
- Budget-based travel suggestions
- Interest-based destination matching
- Climate and season-based recommendations
- Match score for recommended destinations
- Estimated trip cost
- Suggested itinerary
- Destination details and images
- Weather information
- User login and signup
- Save favourite destinations
- Trip reminders
- Browser notifications

---

## How the Recommendation System Works

YatraAI uses a **rule-based recommendation system**.

The working process is:

1. The user enters travel preferences.
2. The system checks factors such as budget, interests, season, climate, duration, and group size.
3. These preferences are compared with the available destination data.
4. Different rules and weights are applied.
5. A match score is calculated.
6. The destinations with better scores are shown first.

The project does not currently use a trained machine learning model.

The recommendation is based on predefined rules and weighted scoring.

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| Routing | TanStack Router |
| Data Handling | TanStack Query |
| Backend | Node.js, Nitro |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Backend Service | Supabase |
| Weather API | Open-Meteo |
| Build Tool | Vite |
| Testing | Vitest, Testing Library |
| Deployment | Render |
| Version Control | Git, GitHub |

---

## Simple Tech Stack Explanation

The frontend of YatraAI is developed using **React and TypeScript**.

**Tailwind CSS** and **Radix UI** are used for designing the user interface.

**Node.js and Nitro** are used for server-side functionality.

**Supabase** is used for authentication and database services.

The database used in the project is **PostgreSQL**.

**Open-Meteo API** is used to show weather information.

The application is deployed on **Render**.

The source code is managed using **Git and GitHub**.

---

## Data Storage

The project uses two main types of data.

### Destination Data

Information about travel destinations is stored in the application data layer.

This includes details such as:

- Destination name
- Budget range
- Interests
- Climate
- Best season
- Attractions
- Travel information

### User Data

User-related data is stored in **Supabase PostgreSQL**.

This includes:

- User account details
- Saved destinations
- Trip information
- Reminders

**Supabase Auth** is used for login and signup.

---

## Basic Architecture

```text
User
 |
 v
React + TypeScript
 |
 v
Rule-Based Recommendation System
 |
 +---- Destination Data
 |
 +---- Weather API
 |
 v
Supabase
 |
 +---- Authentication
 |
 +---- PostgreSQL Database
 |
 v
Render Deployment
```

---

## Getting Started

### Requirements

- Node.js
- npm
- Supabase account

Clone the project:

```bash
git clone https://github.com/Ayushkumar2552/yatra-vibe-finder.git
```

Open the project folder:

```bash
cd yatra-vibe-finder
```

Install dependencies:

```bash
npm ci
```

Create the environment file:

```bash
cp .env.example .env
```

Add your Supabase configuration inside the `.env` file.

Run the project:

```bash
npm run dev
```

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Check code quality |
| `npx tsc --noEmit` | Check TypeScript errors |

---

## Project Structure

```text
src/
  components/   UI components
  data/         Destination data
  lib/          Recommendation logic
  routes/       Application pages
  test/         Test files

public/         Images and media

supabase/
  migrations/   Database files

render.yaml     Render deployment configuration
```

---

## Deployment

YatraAI is deployed on **Render**.

The production application is connected to the `main` branch of the GitHub repository.

Any new update pushed to the main branch can be deployed to the live application.

---

## Future Scope

In the future, the project can be improved by adding:

- Machine learning-based recommendations
- More destinations
- Hotel recommendations
- Transport information
- Interactive maps
- Real-time travel costs
- Better itinerary planning
- Group trip planning
- More personalised recommendations

---

## Live Project

https://yatra-vibe-finder.onrender.com/

## GitHub Repository

https://github.com/Ayushkumar2552/yatra-vibe-finder
