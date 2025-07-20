# 🗄️ Database Optimization Guide

## Overview

This guide covers comprehensive database optimizations for production-level performance, including schema improvements, indexing strategies, and recommendation systems.

## 🚀 **Schema Optimizations**

### 1. **User Model Enhancements**

#### New Fields Added:
- `skills_summary`: Cached top skills for quick search
- `experience_summary`: Calculated experience level
- `search_score`: For recommendation ranking
- `profile_completeness`: Profile completion percentage

#### Indexes Added:
```javascript
// Text search with weights
UserSchema.index({
  first_name: 'text',
  last_name: 'text',
  title: 'text',
  bio: 'text',
  skills_summary: 'text',
}, {
  weights: {
    first_name: 10,
    last_name: 8,
    title: 6,
    bio: 4,
    skills_summary: 5,
  },
  name: 'user_text_search'
});

// Performance indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ githubId: 1 }, { sparse: true });
UserSchema.index({ location_id: 1 });
UserSchema.index({ is_online: 1 });
UserSchema.index({ last_seen: -1 });
UserSchema.index({ created_at: -1 });
UserSchema.index({ search_score: -1 });
UserSchema.index({ profile_completeness: -1 });
UserSchema.index({ experience_summary: 1 });

// Compound indexes
UserSchema.index({ 
  location_id: 1, 
  experience_summary: 1, 
  is_online: 1 
});

UserSchema.index({ 
  skills_summary: 1, 
  experience_summary: 1, 
  search_score: -1 
});
```

### 2. **Post Model Enhancements**

#### New Fields Added:
- `popularity_score`: Calculated based on views, applications, recency
- `skill_match_score`: For user-post matching
- `search_keywords`: Extracted keywords for better search

#### Indexes Added:
```javascript
// Enhanced text search with weights
PostSchema.index({
  title: 'text',
  description: 'text',
  tech_stack: 'text',
  project_type: 'text',
  'requirements.desired_skills': 'text',
  'requirements.desired_roles': 'text',
  search_keywords: 'text',
}, {
  weights: {
    title: 10,
    description: 6,
    tech_stack: 8,
    project_type: 7,
    'requirements.desired_skills': 9,
    'requirements.desired_roles': 9,
    search_keywords: 5,
  },
  name: 'post_text_search'
});

// Performance indexes
PostSchema.index({ posted_by: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ created_at: -1 });
PostSchema.index({ updated_at: -1 });
PostSchema.index({ views_count: -1 });
PostSchema.index({ applications_count: -1 });
PostSchema.index({ popularity_score: -1 });
PostSchema.index({ location_id: 1 });
PostSchema.index({ experience_level: 1 });
PostSchema.index({ work_mode: 1 });
PostSchema.index({ project_type: 1 });

// Compound indexes
PostSchema.index({ 
  status: 1, 
  created_at: -1 
});

PostSchema.index({ 
  status: 1, 
  location_id: 1, 
  experience_level: 1 
});

PostSchema.index({ 
  status: 1, 
  tech_stack: 1, 
  popularity_score: -1 
});

PostSchema.index({ 
  status: 1, 
  project_type: 1, 
  created_at: -1 
});
```

### 3. **UserSkill Model Enhancements**

#### New Fields Added:
- `skill_score`: Calculated score based on proficiency and experience

#### Indexes Added:
```javascript
// Enhanced text search
UserSkillSchema.index({ skill_name: 'text' }, {
  weights: {
    skill_name: 10,
  },
  name: 'skill_text_search'
});

// Performance indexes
UserSkillSchema.index({ user_id: 1 });
UserSkillSchema.index({ skill_name: 1 });
UserSkillSchema.index({ proficiency_level: 1 });
UserSkillSchema.index({ is_top: 1 });
UserSkillSchema.index({ skill_score: -1 });
UserSkillSchema.index({ order: 1 });

// Compound indexes
UserSkillSchema.index({ 
  user_id: 1, 
  is_top: 1, 
  order: 1 
});

UserSkillSchema.index({ 
  skill_name: 1, 
  proficiency_level: 1, 
  skill_score: -1 
});

UserSkillSchema.index({ 
  user_id: 1, 
  skill_score: -1 
});
```

## 🎯 **Recommendation System**

### 1. **Post Recommendations for Users**

```typescript
// Get personalized post recommendations
const recommendations = await RecommendationEngine.getPostRecommendations(
  userId,
  {
    location_id: 'location123',
    experience_level: 'intermediate',
    skills: ['React', 'Node.js'],
    project_type: 'web-app',
    work_mode: 'remote',
    limit: 20,
    page: 0
  }
);
```

#### Match Score Calculation:
- **Skill Matching (40%)**: Ratio of matching skills
- **Experience Level (25%)**: Compatibility with required experience
- **Location Matching (15%)**: Geographic proximity
- **Recency Bonus (10%)**: Recent posts get higher scores
- **Popularity Bonus (10%)**: Popular posts get higher scores

### 2. **User Recommendations for Posts**

```typescript
// Get personalized user recommendations for a post
const userRecommendations = await RecommendationEngine.getUserRecommendations(
  postId,
  {
    location_id: 'location123',
    experience_level: 'advanced',
    limit: 20,
    page: 0
  }
);
```

#### Match Score Calculation:
- **Skill Matching (40%)**: Ratio of matching skills
- **Experience Level (25%)**: Compatibility with required experience
- **Location Matching (15%)**: Geographic proximity
- **Profile Completeness (10%)**: Complete profiles get higher scores
- **Online Status (10%)**: Online users get higher scores

## 🔍 **Advanced Search System**

### 1. **User Search with Multiple Filters**

```typescript
const searchResults = await AdvancedSearch.searchUsers({
  query: 'React Developer',
  location_id: 'location123',
  experience_level: 'intermediate',
  skills: ['React', 'TypeScript'],
  status: 'online',
  sort_by: 'relevance',
  sort_order: 'desc',
  limit: 20,
  page: 0
});
```

### 2. **Post Search with Multiple Filters**

```typescript
const searchResults = await AdvancedSearch.searchPosts({
  query: 'Full Stack Developer',
  location_id: 'location123',
  experience_level: 'advanced',
  skills: ['React', 'Node.js', 'MongoDB'],
  project_type: 'web-app',
  work_mode: 'remote',
  status: 'open',
  sort_by: 'popularity',
  sort_order: 'desc',
  limit: 20,
  page: 0
});
```

### 3. **Skill Autocomplete**

```typescript
const skills = await AdvancedSearch.searchSkills('React', 10);
```

## 📊 **Performance Optimizations**

### 1. **Index Strategy**

#### Primary Indexes:
- **Text Search**: For full-text search capabilities
- **Single Field**: For exact matches and sorting
- **Compound**: For complex queries with multiple conditions

#### Index Considerations:
- **Covered Queries**: Use indexes that cover all fields in the query
- **Selectivity**: High-cardinality fields make better indexes
- **Size**: Monitor index size and impact on write performance

### 2. **Query Optimization**

#### Best Practices:
```javascript
// Use lean() for read-only operations
const users = await UserModel.find(query).lean();

// Use projection to limit fields
const users = await UserModel.find(query, 'first_name last_name title').lean();

// Use aggregation for complex calculations
const stats = await PostModel.aggregate([
  { $match: { status: 'open' } },
  { $group: { _id: '$project_type', count: { $sum: 1 } } }
]);

// Use pagination with skip/limit
const posts = await PostModel.find(query)
  .sort({ created_at: -1 })
  .skip(page * limit)
  .limit(limit)
  .lean();
```

### 3. **Caching Strategy**

#### Redis Caching:
```typescript
// Cache popular searches
await redis.setex(`search:${query}`, 3600, JSON.stringify(results));

// Cache user recommendations
await redis.setex(`recommendations:${userId}`, 1800, JSON.stringify(recommendations));

// Cache search analytics
await redis.setex('analytics:search', 3600, JSON.stringify(analytics));
```

## 🔄 **Data Maintenance**

### 1. **Automatic Updates**

#### Pre-save Middleware:
```javascript
// Update derived fields automatically
UserSchema.pre('save', async function(next) {
  if (this.isModified('first_name') || this.isModified('last_name')) {
    // Calculate profile completeness
    let completeness = 0;
    if (this.first_name) completeness += 20;
    if (this.last_name) completeness += 10;
    // ... more calculations
    this.profile_completeness = Math.min(completeness, 100);
  }
  next();
});
```

### 2. **Background Jobs**

#### Recommendation Updates:
```typescript
// Update user skills summary
await RecommendationEngine.updateUserSkillsSummary(userId);

// Update post popularity scores
await PostModel.updateMany({}, [
  {
    $set: {
      popularity_score: {
        $add: [
          { $multiply: ['$views_count', 0.3] },
          { $multiply: ['$applications_count', 0.7] },
          { $multiply: [{ $subtract: [1, { $divide: [{ $subtract: [new Date(), '$created_at'] }, 2592000000] }] }, 10] }
        ]
      }
    }
  }
]);
```

## 📈 **Monitoring & Analytics**

### 1. **Query Performance**

#### MongoDB Profiler:
```javascript
// Enable profiler for slow queries
db.setProfilingLevel(1, { slowms: 100 });

// Analyze slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 });
```

### 2. **Index Usage**

#### Index Statistics:
```javascript
// Check index usage
db.users.getIndexes();

// Analyze index usage
db.users.aggregate([
  { $indexStats: {} }
]);
```

### 3. **Search Analytics**

```typescript
const analytics = await AdvancedSearch.getSearchAnalytics();
console.log('Search Analytics:', analytics);
```

## 🚀 **Production Deployment**

### 1. **Index Creation**

```bash
# Create indexes in production
mongo your-database --eval "
db.usermodels.createIndex({
  first_name: 'text',
  last_name: 'text',
  title: 'text',
  bio: 'text',
  skills_summary: 'text'
}, {
  weights: {
    first_name: 10,
    last_name: 8,
    title: 6,
    bio: 4,
    skills_summary: 5
  },
  name: 'user_text_search'
});
"
```

### 2. **Performance Monitoring**

```javascript
// Monitor query performance
const startTime = Date.now();
const results = await UserModel.find(query).lean();
const queryTime = Date.now() - startTime;

if (queryTime > 100) {
  console.warn(`Slow query detected: ${queryTime}ms`);
}
```

### 3. **Database Maintenance**

```bash
# Regular maintenance tasks
# 1. Update statistics
db.users.updateMany({}, { $set: { updated_at: new Date() } });

# 2. Clean up old data
db.posts.deleteMany({ 
  status: 'closed', 
  updated_at: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } 
});

# 3. Optimize collections
db.users.reIndex();
db.posts.reIndex();
```

## 📋 **Checklist for Production**

- [ ] All indexes created and optimized
- [ ] Text search indexes with proper weights
- [ ] Compound indexes for complex queries
- [ ] Recommendation engine implemented
- [ ] Advanced search with multiple filters
- [ ] Caching strategy implemented
- [ ] Background jobs for data maintenance
- [ ] Performance monitoring in place
- [ ] Query optimization completed
- [ ] Database maintenance schedule established

This optimization guide provides a comprehensive approach to database performance, search capabilities, and recommendation systems for production-level applications. 