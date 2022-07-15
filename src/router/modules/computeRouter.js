/** When your routing dmdb is too long, you can split it into small modules **/

import Layout from '@/layout'

const computeRouter = {
  path: '/compute',
  component: Layout,
  redirect: '/compute/account',
  name: 'Compute',
  meta: {
    title: 'Compute',
    icon: 'nested'
  },
  children: [
    {
      path: 'account',
      component: () => import('@/views/compute/account'),
      name: 'Account',
      meta: { title: '账户' },
      children: [
        {
          path: 'query',
          component: () => import('@/views/compute/account/query'),
          name: 'Query',
          meta: {
            title: '转账记录查询',
            icon: 'search'
          }
        }
      ]
    }
  ]
}

export default computeRouter
