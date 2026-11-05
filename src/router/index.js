import { createRouter, createWebHashHistory } from 'vue-router'
import AppView from '../views/AppView.vue'
import LoginView from '@/views/LoginView.vue'
import HubView from '@/views/HubView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/intake',
      name: 'intake',
      component: () => import('../views/IntakeView.vue'),
    },
    {
      path: '/hub',
      name: 'hub',
      component: HubView,
      children: [
        {
          path: '',
          name: 'smilefa',
          component: () => import('../views/modules/SmileFaView.vue'),
        },
        {
          path: 'speech',
          name: 'speech',
          component: () => import('../views/modules/SpeechView.vue'),
        },
        {
          path: 'plr',
          name: 'plr',
          component: () => import('../views/modules/PlrView.vue'),
        },
        {
          path: 'pronator',
          name: 'pronator',
          component: () => import('../views/modules/PronatorView.vue'),
        },
      ],
    },
    {
      path: '/app',
      name: 'app',
      component: AppView,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        },
      ],
    },
  ],
})

export default router
