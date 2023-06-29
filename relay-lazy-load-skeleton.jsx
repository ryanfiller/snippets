import React, { Children, Suspense, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLazyLoadQuery } from 'react-relay'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function useLazyLoadQuerySkeleton({ query, variables = {}, options = {} }) {
  const [data, setData] = useState(null)

  const LazyLoadSkeleton = (props) => {
    const QueryRunner = ({ children }) => {
      const relayData = useLazyLoadQuery(query, variables, options)
      useEffect(() => setData(relayData), [relayData])

      return children
    }

    return (
      <Suspense fallback={props.children}>
        <QueryRunner>
          {props.children}
        </QueryRunner>
      </Suspense>
    )
  }

  return { data, LazyLoadSkeleton }
}

const Lines = ({ children, className, loading }) => {
  return (
    <div className={className}>
      {loading ? <Skeleton count={Children.toArray(children).length} /> : children}
    </div>
  )
}

Lines.propTypes = {
  loading: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  className: PropTypes.string
}

import cx from 'classnames'
import Link from 'next/link'
import moment from 'moment'

import { ToolTip, Icons } from 'lensrentals-components'

import useLazyLoadQuerySkeleton from 'lib/hooks/use-lazy-load-query-skeleton'
import SkeletonLines from 'components/public/loading-indicators/skeletons/lines'
import { formatUSD } from 'lib/helpers/currency-formats'

import styles from './account-sidebar.module.scss'

const AccountSidebar = (props) => {
  const { data, LazyLoadSkeleton } = useLazyLoadQuerySkeleton({
    query: graphql`
      query accountSidebarQuery {
        currentStorefrontUser {
          account {
            firstName
            lastName
            email
            hd {
              eligible
              expiration
            }
            creditBalance
            rentalCreditBalance
          }
        }
      }
    `,
    variables: {},
    options: { fetchPolicy: 'store-or-network' }
  })

  const account = data?.currentStorefrontUser?.account

  return (
    <LazyLoadSkeleton>
      <section className={cx(props.className, styles['account-sidebar'])}>
        <SkeletonLines
          loading={!data}
          className='user-info'
        >
          <p className='name'>
            {`${account?.firstName} ${account?.lastName}`}
          </p>
          <p className='email'>
            {account?.email}
          </p>
          <Link href='/users/edit'>
            Edit Info
          </Link>
        </SkeletonLines>

        <hr />

        <SkeletonLines
          loading={!data}
          className='lrhd'
        >
          <p className={styles['label']}>
            LensRentals HD
          </p>
          {
            account?.hd.eligible
              ? <p className='active'>
                  {/* TODO - should we standardize a date format somewhere? */}
                  Active Until: {moment(account?.hd.expiration).format('MM/DD/YY')}
                </p>
              : <p className='sign-up'>
                  <Link href='/lrhd'>
                    Sign Up?
                  </Link>
                </p>
          }
        </SkeletonLines>

        <hr />

        <SkeletonLines
          loading={!data}
          className='account-balance'
        >
          <p
            className={cx(styles['label'], styles['info'])}
            data-icon={Icons['QuestionMark']}
          >
            Available Credit
            <ToolTip
              id='available-credit-info'
              content='<b>Cash credits</b> can be used for either sale or rental orders, while <b>rental credits</b> can only be used for rental orders.'
              anchor='top'
              color='primary'
              size='small'
            >
              <img height='12px' width='12px' src={Icons['QuestionMark']} alt='info icon' />
            </ToolTip>
          </p>
          <p className='cash'>
            Cash: {formatUSD(account?.creditBalance)}
          </p>
          <p className='rental'>
            Rental: {formatUSD(account?.rentalCreditBalance)}
          </p>
        </SkeletonLines>
      </section>
    </LazyLoadSkeleton>
  )
}

AccountSidebar.propTypes = {
  account: PropTypes.object,
  className: PropTypes.string
}
