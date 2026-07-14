## Mobo - Mood Booster

Mood Booster is a responsive mood-tracking and motivation web application that encourages users to notice meaningful moments in their daily lives.

Users grow a virtual plant by posting daily reflections, photos, and emotions. As users continue posting, their plant earns experience points and progresses through different growth stages.

The application combines journaling, emotional awareness, social interaction, and game-like rewards.

## Project Movitvation

Many people struggle to find motivation, meaning, or enjoyment in their daily lives. However, meaningful experiences can often be found in small moments, such as:

- Seeing something beautiful on the way to school or work
- Writing down something they feel grateful for
- Saving a photo of something cute or memorable
- Recognizing a difficult emotion
- Sharing an encouraging moment with a friend

The app encourages users to pay attention to these moments and create a daily reflection habit.

## Core Features

1. User authentication
   Users can:

- Register for an account
- Login/Log out
- View and update profile
- Access protected pages

2. Plant Selection

New users can choose a plant from a list stored in the database.

Example plants: tulip, sunflower, etc

Each plant begins as a seed.

3. Daily Reflection Posts

Users can create a daily post containing:

- A written reflection
- An optional image
- An emotion
- A visibility setting

Possible emotions include: happy, angry, anxiety, etc
Each emotion will have an emoji representing itself

Every honest reflection earns points. Negative emotions are not treated as failures. For example:

- Happy posts may provide sunlight
- Sad posts may provide rain
- Peaceful posts may provide nutrients
- Anxious posts may unlock calming activities

4. Plant Growth

A user's plant grows as the user earns points.

Possible stages:

- Seed
- Sprout
- Small plant
- Young plant
- Mature plant
- Flowering plant

5. The plant dashboard displays:

- Plant name
- Plant type
- Growth stage
- Growth percentage
- Plant age
- Date planted
- Total points
- Current streak
- Progress toward the next stage
- Progress toward the next reward

6. Rewards

Users can unlock rewards when they reach point milestones.

Possible rewards include:

- New plants
- Flowerpots
- Garden decorations
- Profile badges
- Background themes
- Plant animations

7. Users can:

- Send friend requests
- Accept or decline friend requests
- View friends' posts
- React to posts
- Leave supportive comments
- See friends'plant

8. Privacy

Each post can be: private, seen by friends

## Techstack

1. Frontend

- React
- React Router
- Tailwind CSS
- Fetch API or Axios

2. Backend

- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate : database migration tool

3. Database

- MySQL

### MVP scope

The first version includes:

- user registration and login
- plant selection
- daily text reflection
- emotion selection
- point calculalation
- plant grows
- personal plant dashboard
- responsive mobile interface
- deployment

#### Simple flow for MVP test:

register -> choose plant -> create post -> plant points increase
