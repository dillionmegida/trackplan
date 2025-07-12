<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { LINKS } from '@/constants/links';
</script>

<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <header class="hero">
      <div class="container">
        <nav class="navbar">
          <div class="logo">TrackPlan</div>
          <div class="nav-links">
            <RouterLink :to="LINKS.login" class="get-started-link">Get Started</RouterLink>
          </div>
        </nav>
        
        <div class="hero-content">
          <h1>Plan, Track, & Succeed</h1>
          <p class="lead">The all-in-one project management platform designed to keep your team organized and productive.</p>
          <RouterLink :to="LINKS.login" class="get-started-link">Get Started Here</RouterLink>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Why Choose TrackPlan?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your project's progress with intuitive dashboards and real-time updates.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h3>Team Collaboration</h3>
            <p>Work together seamlessly with your team members in one centralized platform.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📅</div>
            <h3>Deadline Management</h3>
            <p>Never miss important dates with our smart deadline tracking system.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of teams already using TrackPlan to manage their projects.</p>
        <RouterLink :to="LINKS.login" class="get-started-link">Go to Login</RouterLink>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
/* Base Styles */
:root {
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  --text: #1f2937;
  --text-light: #6b7280;
  --bg-light: #f9fafb;
  --white: #ffffff;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;

  .get-started-link {
    color: #fff;
    font-weight: 600;
    background-color: #000;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;

    &:hover {
      background-color: #3b82f6;
    }
  }
}

/* Typography */
h1, h2, h3 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: var(--text);
}

h1 {
  font-size: clamp(1.4rem, 8vw, 3.5rem);
  margin-bottom: 1.5rem;
}

h2 {
  font-size: clamp(1.4rem, 8vw, 2.5rem);
  text-align: center;
  margin-bottom: 3rem;
}

p {
  color: var(--text-light);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.lead {
  font-size: clamp(1rem, 5vw, 1.25rem);
  max-width: 700px;
  margin: 0 auto 2rem;
}

.get-started-link {
  color: #fff;
  font-weight: 600;
  background-color: #000;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3b82f6;
  }
}

.btn-outline {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  margin-right: 1rem;
}

.btn-outline:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Layout */
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text);
  line-height: 1.5;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0 6rem;
  position: relative;
  overflow: hidden;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 4rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background-color: var(--white);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: var(--white);
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: var(--shadow);
  transition: transform 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 6rem 0;
  text-align: center;
}

.cta h2,
.cta p {
  color: white;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta .btn-primary {
  background-color: white;
  color: var(--primary);
  margin-top: 1.5rem;
}

.cta .btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
  
  h2 {
    font-size: 2rem;
  }
  
  .hero {
    padding: 1rem 0 4rem;
  }
  
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    display: flex;
    gap: 1rem;
    width: 100%;
    justify-content: center;
  }
  
  .btn-outline {
    margin-right: 0;
  }
}
</style>