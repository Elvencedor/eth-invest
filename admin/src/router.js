import Vue from 'vue'
import VueRouter from 'vue-router'

// Layouts
import Main from './layouts/Main'
import Default from './layouts/Default'

// Pages
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Users from './pages/users'
import NewUser from './pages/users/new'
import EditUser from './pages/users/edit'
import Deposits from './pages/deposits'
import Withdrawals from './pages/Withdrawals'
import Investments from './pages/Investments'
import Plans from './pages/plans'
import NewPlan from './pages/plans/new'
import EditPlan from './pages/plans/edit'

Vue.use(VueRouter)

const router = new VueRouter({
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        selector: to.hash
      }
    } else {
      return { x: 0, y: 0 }
    }
  },
  mode: 'history',
  routes: [
    {
      path: '',
      name: 'default',
      component: Default,
      children: [
        {
          path: '/',
          name: 'home',
          component: Home
        }
      ]
    },
    {
      path: '',
      name: 'main',
      component: Main,
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: Dashboard
        },
        {
          path: '/users',
          name: 'users',
          component: Users
        },
        {
          path: '/users/new',
          name: 'newUser',
          component: NewUser
        },
        {
          path: '/users/:id',
          name: 'editUser',
          component: EditUser
        },
        {
          path: '/deposits',
          name: 'deposits',
          component: Deposits
        },
        {
          path: '/withdrawals',
          name: 'withdrawals',
          component: Withdrawals
        },
        {
          path: '/investments',
          name: 'investments',
          component: Investments
        },
        {
          path: '/plans',
          name: 'plans',
          component: Plans
        },
        {
          path: '/plans/new',
          name: 'newPlan',
          component: NewPlan
        },
        {
          path: '/plans/:id',
          name: 'editPlan',
          component: EditPlan
        }
      ]
    }
  ]
})

export default router
