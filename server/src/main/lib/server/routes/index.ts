import * as authMw from '../middleware/auth'
import * as authCtrl from '../controllers/auth'
import * as tfaCtrl from '../controllers/tfa'
import * as userCtrl from '../controllers/user'
import * as referralCtrl from '../controllers/referral'
import * as planCtrl from '../controllers/plan'
import * as withdrawalCtrl from '../controllers/withdrawal'
import * as depositCtrl from '../controllers/deposit'
import * as investmentCtrl from '../controllers/investment'
import * as statCtrl from '../controllers/stat'
import * as verificationCtrl from '../controllers/verification'
import * as passwordCtrl from '../controllers/password'
import * as supportCtrl from '../controllers/support'
import * as adminUserCtrl from '../controllers/admin/user'
import * as adminDepositCtrl from '../controllers/admin/deposit'
import * as adminWithdrawalCtrl from '../controllers/admin/withdrawal'
import * as adminInvestmentCtrl from '../controllers/admin/investments'
import * as adminPlanCtrl from '../controllers/admin/plans'
import * as adminStatCtrl from '../controllers/admin/stat'
import * as paystackCtrl from '../controllers/paystack'

export const APP_ROUTES = [
  // PUBLIC ROUTES

  {
    path: '/session',
    method: 'post',
    action: authCtrl.createSession
  },
  {
    path: '/session',
    method: 'delete',
    action: authCtrl.deleteSession
  },
  {
    path: '/users',
    method: 'post',
    action: userCtrl.registerUser
  },
  {
    path: '/user/:username',
    method: 'get',
    action: userCtrl.fetchUser
  },
  // Account
  {
    path: '/account/activate',
    method: 'post',
    action: verificationCtrl.activateUser
  },
  // Password
  {
    path: '/password/forgot',
    method: 'post',
    action: passwordCtrl.forgotPassword
  },
  {
    path: '/password/reset',
    method: 'post',
    action: passwordCtrl.resetPassword
  },
  {
    path: '/confirmation/send',
    method: 'post',
    action: userCtrl.resendConfirmationMail
  },
  {
    path: '/stats/conversion',
    method: 'get',
    action: statCtrl.fetchConversion
  },
  {
    path: '/support',
    method: 'post',
    action: supportCtrl.action
  },

  // GUARDED ROUTES

  // users
  {
    path: '/users',
    method: 'put',
    action: userCtrl.updateUser,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/updatePassword',
    method: 'put',
    action: userCtrl.updatePassword,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/updateEmail',
    method: 'put',
    action: userCtrl.updateEmail,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/self',
    method: 'get',
    action: userCtrl.fetchSelf,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/transfer',
    method: 'post',
    action: userCtrl.transferFund,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/referrals',
    method: 'get',
    action: referralCtrl.fetchUserReferrals,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/users/:userId',
    method: 'delete',
    action: userCtrl.deleteUser,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  // plans
  {
    path: '/plans',
    method: 'get',
    action: planCtrl.fetchPlans
    // middleware: [authMw.checkAuth]
  },
  {
    path: '/plans/:planId/invest',
    method: 'post',
    action: investmentCtrl.createInvestment,
    middleware: [authMw.checkAuth]
  },
  // deposits
  {
    path: '/deposits',
    method: 'get',
    action: depositCtrl.fetchDeposit,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/deposits',
    method: 'post',
    action: depositCtrl.createDeposit,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/updateDeposit/:id',
    method: 'put',
    action: depositCtrl.updateDeposit,
    middleware: [authMw.checkAuth]
  },

  // paystack endpoints
  {
    path: '/paystackSave',
    method: 'post',
    action: paystackCtrl.createTx,
    middleware: [authMw.checkAuth]
  },
  // withdrawals
  {
    path: '/withdrawals',
    method: 'get',
    action: withdrawalCtrl.fetchWithdrawals,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/withdrawals',
    method: 'post',
    action: withdrawalCtrl.requestWithdrawal,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/withdrawals/:id',
    method: 'delete',
    action: withdrawalCtrl.cancelWithdrawal,
    middleware: [authMw.checkAuth]
  },
  // investment
  {
    path: '/investments',
    method: 'get',
    action: investmentCtrl.fetchSubscriptions,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/stats',
    method: 'get',
    action: statCtrl.fetchStats,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/tfa',
    method: 'get',
    action: tfaCtrl.setupTfa,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/tfa',
    method: 'post',
    action: tfaCtrl.verifyTfa,
    middleware: [authMw.checkAuth]
  },
  {
    path: '/tfa',
    method: 'delete',
    action: tfaCtrl.destroyTfa,
    middleware: [authMw.checkAuth]
  },
  // Admin routes
  // Users
  {
    path: '/admin/users',
    method: 'get',
    action: adminUserCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/users',
    method: 'post',
    action: adminUserCtrl.store,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/users/:id',
    method: 'get',
    action: adminUserCtrl.show,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/users/:id',
    method: 'put',
    action: adminUserCtrl.update,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/users/:id',
    method: 'delete',
    action: adminUserCtrl.destroy,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  // Deposits
  {
    path: '/admin/deposits',
    method: 'get',
    action: adminDepositCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/deposits/:id',
    method: 'put',
    action: adminDepositCtrl.update,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/deposits/:id/hash',
    method: 'put',
    action: adminDepositCtrl.updateTxId,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/deposits/:id/repend',
    method: 'put',
    action: adminDepositCtrl.rependDeposit,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  // Withdrawal
  {
    path: '/admin/withdrawals',
    method: 'get',
    action: adminWithdrawalCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/withdrawals/:id',
    method: 'put',
    action: adminWithdrawalCtrl.update,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  // Investment
  {
    path: '/admin/investments',
    method: 'get',
    action: adminInvestmentCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  // Plan
  {
    path: '/admin/plans',
    method: 'get',
    action: adminPlanCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/plans',
    method: 'post',
    action: adminPlanCtrl.store,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/plans/:id',
    method: 'get',
    action: adminPlanCtrl.show,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/plans/:id',
    method: 'put',
    action: adminPlanCtrl.update,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  },
  {
    path: '/admin/stats',
    method: 'get',
    action: adminStatCtrl.index,
    middleware: [authMw.checkAuth, authMw.isAdmin]
  }
]
