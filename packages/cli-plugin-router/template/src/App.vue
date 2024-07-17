<script setup>
  import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
  header {
    line-height: 1.5;
    max-height: 100vh;
  }

  nav {
    margin-top: 2rem;
    width: 100%;
    font-size: 12px;
    text-align: center;
  }

  nav a.router-link-exact-active {
    color: var(--color-text);
  }

  nav a.router-link-exact-active:hover {
    background-color: transparent;
  }

  nav a {
    display: inline-block;
    border-left: 1px solid var(--color-border);
    padding: 0 1rem;
  }

  nav a:first-of-type {
    border: 0;
  }

  @media (width >= 1024px) {
    header {
      display: flex;
      place-items: center;
      padding-right: calc(var(--section-gap) / 2);
    }

    header .wrapper {
      display: flex;
      place-items: flex-start;
      flex-wrap: wrap;
    }

    nav {
      margin-top: 1rem;
      margin-left: -1rem;
      padding: 1rem 0;
      font-size: 1rem;
      text-align: left;
    }
  }
</style>
