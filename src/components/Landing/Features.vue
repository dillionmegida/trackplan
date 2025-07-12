<script setup lang="ts">
import { LINKS } from '@/constants/links';

</script>

<template>
  <section class="features">
    <div class="container">
      <h2>With Trackplan...</h2>
      <div class="features-list">
        <div class="feature-item">
          <p>
            Whether you're planning a party, relocating, applying for jobs, or any other event,
            Trackplan helps you manage the items you need to do. And we have made it less complex to
            manage these or have a better overview of your tasks.
          </p>
          <img src="/easy-overview.png" alt="''" />
        </div>
        <div class="feature-item">
          <img src="/group-in-categories.png" alt="''" />
          <p>
            You can group checklist items in categories and track how much progress you have made on
            each category. Uncategorized items will be grouped together.
          </p>
        </div>
        <div class="feature-item">
          <p>
            And you can be part of other organizations or invite people to your organization. When
            you invite someone, you can select what programs they should have access to. This way,
            multiple people can check items in a program.
          </p>
          <img src="/organizations-list.png" alt="''" />
        </div>
        <div class="feature-item">
          <p>
            These are the features we have right now, but we are working on more features and your
            feedback will help us know where to focus on improving. <RouterLink class="get-started-link" :to="LINKS.login">Get started</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.features {
  padding: 10rem 0;
  background-color: var(--white);

  @media (max-width: 900px) {
   padding-top: 3rem;
  }
}

.features-list {
  display: flex;
  gap: 2rem;
  flex-direction: column;
}

.feature-item {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr;
  padding-bottom: 2rem;
  p {
    margin-top: 2rem;
    font-size: clamp(1rem, 1.5vw, 1rem);
    color: #64748b;
    line-height: 1.3;
  }

  &:not(:last-child) {
    border-bottom: 2px solid #ecedef;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;

    p {
      order: 1;
    }

    img {
      order: 2;
    }
  }

  .get-started-link {
    background-color: #333;
    color: #fff;
    padding: 0rem 0.2rem;
    text-decoration: none;
    transition: background-color 0.2s;
    font-size: 0.9rem;
    border-radius: 2px;

    &:hover {
      background-color: rgb(103, 141, 103);
    }
  }
}
</style>
