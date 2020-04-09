import Vue from 'vue'
import VueRouter from 'vue-router'

// Layouts
import Default from './layouts/Default'
import Main from './layouts/Main'

// Pages
import Register from './pages/Register'
import Login from './pages/Login'
import Verification from './pages/Verification'
import ForgotPassword from './pages/ForgotPassword'
import PasswordReset from './pages/PasswordReset'
import ResendConfirmation from './pages/ResendConfirmation'
import EmailUpdate from './pages/EmailUpdate'
import Terms from './pages/Terms'
import Support from './pages/Support'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Deposits from './pages/Deposits'
import Withdrawals from './pages/Withdrawals'
import Investments from './pages/Investments'
import Invest from './pages/Invest'
import Referrals from './pages/Referrals'
import verify from './pages/verifyPaystack'

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
        },
        {
          path: '/login',
          name: 'login',
          component: Login
        },
        {
          path: '/register',
          name: 'register',
          component: Register
        },
        {
          path: '/verification',
          name: 'verification',
          component: Verification
        },
        {
          path: '/forgot_password',
          name: 'forgot_password',
          component: ForgotPassword
        },
        {
          path: '/password_reset',
          name: 'password_reset',
          component: PasswordReset
        },
        {
          path: '/resend_confirmation',
          name: 'resend_confirmation',
          component: ResendConfirmation
        },
        {
          path: '/email_update',
          name: 'email_update',
          component: EmailUpdate
        },
        {
          path: '/terms',
          name: 'terms',
          component: Terms
        },
        {
          path: '/support',
          name: 'support',
          component: Support
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
          path: '/settings',
          name: 'settings',
          component: Settings
        },
        {
          path: '/deposits',
          name: 'deposits',
          component: Deposits
        },
        {
          path: '/verify',
          name: 'verify',
          component: verify
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
          path: '/invest',
          name: 'invest',
          component: Invest
        },
        {
          path: '/referrals',
          name: 'referrals',
          component: Referrals
        }
      ]
    }
  ]
})

export default router
