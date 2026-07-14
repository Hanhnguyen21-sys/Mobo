## Tables

1. users
   id
   username
   email
   password_hash
   profile_image_url
   created_at

2. plant_types
   id
   name
   description
   image_url
   required_points

3. user_plants
   id
   user_id
   plant_type_id
   nickname
   total_points
   growth_stage
   planted_at
   last_activity_at

4. emotions
   id
   name
   category
   icon

5. posts
   id
   user_id
   emotion_id
   content
   image_url
   visibility
   points_earned
   created_at

6. friendships
   id
   requester_id
   receiver_id
   status
   created_at

7. reactions
   id
   user_id
   post_id
   reaction_type
   created_at

8. comments
   id
   user_id
   post_id
   content
   created_at

9. rewards
   id
   name
   description
   required_points
   image_url

10. user_rewards
    id
    user_id
    reward_id
    unlocked_at

11. notifications
    id
    user_id
    message
    notification_type
    is_read
    created_at

### Initial API Endpoints

1. Authentication
   POST /api/auth/register
   POST /api/auth/login
   GET /api/auth/me

#### Notes:

- Register -> create new user -> return JWT token
- Login -> verify user -> return token
- /me -> use token generated after logging in to verify current user

- register token and login token are different because JWT token is created by combining
  many information: user_id, expiration time, created time, etc. Hence, if both tokens are from
  same user, but they are created at different times

2. Plants
   GET /api/plants : show all plant choices
   POST /api/user-plants : save plant the user picked , also requires valid jwt
   GET /api/user-plants/current : show user's plant on their dashboard

3. Posts
   POST /api/posts
   GET /api/posts/me
   GET /api/posts/:postId
   PUT /api/posts/:postId
   DELETE /api/posts/:postId

4. Friends
   POST /api/friends/requests
   GET /api/friends/requests
   PUT /api/friends/requests/:requestId
   GET /api/friends

5. Social Feed
   GET /api/feed
   POST /api/posts/:postId/reactions
   POST /api/posts/:postId/comments

6. Rewards
   GET /api/rewards
   GET /api/rewards/me
