<script setup lang="ts">
import { LINKS } from '@/constants/links'
</script>

<template>
  <header class="hero">
    <div class="container">
      <nav class="navbar">
        <div class="logo">
          <img src="/logo-black.png" alt="" />
        </div>
        <div class="nav-links">
          <RouterLink :to="LINKS.login" class="get-started-link">Dashboard</RouterLink>
        </div>
      </nav>

      <div class="hero-content">
        <h1>A Simple Planning System</h1>
        <p class="lead">
          Are you planning an event and need a simple way to keep track of everything you have to
          do? Trackplan helps you organize, manage, and check off your to-dos—so nothing slips
          through the cracks.
        </p>
        <RouterLink :to="LINKS.login" class="get-started-link">Get Started Here</RouterLink>
        <img class="hero-image" src="/landing.png" />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.hero {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0 6rem;
  position: relative;
  line-height: 1.5;

  @media (max-width: 900px) {
    padding-bottom: 2rem;
  }
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  .nav-links {
    display: flex;
    gap: 1rem;

    .get-started-link {
      color: #fff;
      font-weight: 600;
      background-color: #000;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s;

      &:hover {
        background-color: #3b82f6;
      }
    }
  }
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);

  img {
    width: 60px;
  }
}

.hero-content {
  padding: 2rem 0;
  position: relative;

  @media (max-width: 768px) {
    padding: 0;
  }

  h1 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    font-size: clamp(1.3rem, 7vw, 3.2rem);
  }

  .lead {
    font-size: clamp(1rem, 5vw, 1.25rem);
    max-width: 700px;
    margin-bottom: 2rem;
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

  .hero-image {
    position: absolute;
    right: 0;
    bottom: -280px;
    border: 2px solid #000;
    max-width: 600px;

    @media (max-width: 900px) {
      position: relative;
      inset: 0;
      margin-top: 3rem;
      max-width: 100%;
      /* bottom: -350px; */
    }

    @media (max-width: 768px) {
      bottom: -370px;
    }

    @media (max-width: 550px) {
      bottom: -300px;
    }

    @media (max-width: 400px) {
      bottom: -220px;
    }
  }
}
</style>