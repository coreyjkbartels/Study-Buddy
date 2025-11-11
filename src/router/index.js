import { createRouter, createWebHistory } from 'vue-router'

import SplashView from '../views/SplashView.vue'
import HomeView from '../views/HomeView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '../views/SignUpView.vue'
import ProfileView from '../views/ProfileView.vue'
import FriendsView from '../views/FriendsView.vue'
import MessagesView from '../views/MessagesView.vue'
import Header from '../components/Header.vue'
import GroupchatView from '../views/GroupchatView.vue'
import Assignment from '../views/Assignment.vue'

const routes = [
  { path: '/', name: 'splash', component: SplashView },
  { path: '/home', name: 'home', component: HomeView },
  { path: '/signin', name: 'signin', component: SignInView },
  { path: '/signup', name: 'signup', component: SignUpView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/friends', name: 'friends', component: FriendsView },
  { path: '/messages', name: 'messages', component: MessagesView },
  { path: '/messages/:friendId', name: 'messages-friend', component: MessagesView },
  { path: '/groupchat', name: 'groupchat', component: GroupchatView },
  { path: '/header', name: 'header', component: Header },
  { path: '/assignment', name: 'assignment', component: Assignment }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
