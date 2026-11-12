<template>
  <div class="layout">
    <nav class="sidebar" :class="{ collapsed }">
      <div class="sidebar-header">
        <span v-if="!collapsed">SMILE</span>
        <button @click="collapsed = !collapsed">☰</button>
      </div>
      <ul class="nav-list">
        <li v-for="item in items" :key="item.route">
          <router-link :to="item.route" class="nav-link">
            <span class="icon">{{ item.icon }}</span>
            <span v-if="!collapsed" class="label">{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const collapsed = ref(false)
const items = [
  { icon: '🙂', title: 'Face', route: '/hub/smilefa' },
  { icon: '🗨️', title: 'Speech', route: '/hub/speech' },
  { icon: '👁️', title: 'Pupil', route: '/hub/plr' },
  { icon: '💪', title: 'Arm', route: '/hub/pronator' },
]
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  min-width: 1280px;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #1e293b;
  color: #fff;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li + li::before {
  content: '';
  display: block;
  width: 16px;
  height: 24px;
  margin: 8px 16px;
  pointer-events: none;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 24'%3E%3Cpath d='M8 0v20M2 16l6 6 6-6' stroke='currentColor' stroke-width='2' fill='none'/%3E%3C/svg%3E")
    center / contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 24'%3E%3Cpath d='M8 0v20M2 16l6 6 6-6' stroke='currentColor' stroke-width='2' fill='none'/%3E%3C/svg%3E")
    center / contain no-repeat;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Active state via vue-router */
.nav-link.router-link-exact-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.content {
  flex: 1;
  min-height: 0; /* Allow flex child to shrink so overflow-y: auto can scroll */
  padding: 2rem;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
}

.content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
