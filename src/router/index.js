import { createRouter, createWebHistory } from 'vue-router'

import SplashView from '../views/SplashView.vue'
import HomeView from '../views/HomeView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '../views/SignUpView.vue'
import ProfileView from '../views/ProfileView.vue'
import FriendsView from '../views/FriendsView.vue'
import MessagesView from '../views/MessagesView.vue'
// import GroupchatView from '../views/GroupchatView.vue'
import AssignmentView from '../views/AssignmentView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AssignmentList from '@/components/AssignmentList.vue'
import AssignmentDetails from '@/components/AssignmentDetails.vue'

const routes = [
  { path: '/', name: 'splash', component: SplashView },

  {
    path: '/home', name: 'home', component: HomeView,
    children: [
      { path: '/dashboard', name: 'dashboard', component: DashboardView },
      { path: '/groupchat', name: 'groupchat', component: AssignmentList },
      { path: '/profile', name: 'profile', component: ProfileView },
      { path: '/friends', name: 'friends', component: FriendsView },
      { path: '/messages', name: 'messages', component: MessagesView },
      {
        path: '/assignments', name: 'assignments', component: AssignmentView,
        children: [
          {
            path: '', name: 'assignmentList', component: AssignmentList,
            children: [
              { path: '/assignments/:assignmentId', name: 'assignmentDetails', component: AssignmentDetails, props: true }
            ]
          }
        ]
      }

    ]
  },

  { path: '/signin', name: 'signin', component: SignInView },
  { path: '/signup', name: 'signup', component: SignUpView },
  { path: '/messages/:friendId', name: 'messages-friend', component: MessagesView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
