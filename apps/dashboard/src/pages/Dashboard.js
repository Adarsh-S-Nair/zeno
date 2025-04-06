import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Modal from '../components/Modal'
import DashboardCard from '../components/dashboard/DashboardCard'
import './Dashboard.css'

export default function Dashboard({ business, fetchBusiness, loading }) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchBusiness()
  }, [])

  const handleCreateBusiness = async ({ name }) => {
    if (!name.trim()) return
  
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
  
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return
    }
  
    const { error: insertError } = await supabase
      .from('businesses')
      .insert({ name, owner_id: user.id })
  
    if (insertError) {
      console.error('Failed to create business:', insertError)
      return
    }
  
    setShowModal(false)
    fetchBusiness() // ✅ Refresh business state
  }  

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>
  }

  if (!business) {
    return (
      <div className="dashboard-empty">
        <img src="/images/get-started.svg" alt="Get started" />
        <p className="subtle-text">You haven’t set up your business yet. Let’s get started.</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create Business
        </button>

        <Modal
          title="Create a New Business"
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          actionLabel="Create"
          loadingLabel="Creating..."
          onSubmit={handleCreateBusiness}
          fields={[
            {
              name: 'name',
              label: 'Business Name',
              required: true,
              fullWidth: true,
            },
          ]}
        />
      </div>
    )
  }

  // 🎯 Placeholder dashboard view for users with a business
  return (
    <div className="dashboard">
      <div className="page-header">
        Dashboard
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Row 1 - 4 Cards, each 3 wide (12 total), 1 tall */}
          <DashboardCard
            title="Gross Revenue"
            value="$12,340"
            change={12.4}
            width={3}
            height={1}
            trend={[4, 6, 3, 7, 5, 8, 4, 9, 7, 10]}
          />

          <DashboardCard
            title="Income"
            value="$8,220"
            change={6.1}
            width={3}
            height={1}
            trend={[3, 5, 4, 6, 5, 7, 6, 8, 7, 9]}
          />

          <DashboardCard
            title="Expenses"
            value="$4,120"
            change={-5.2}
            width={3}
            height={1}
            trend={[6, 7, 6, 5, 7, 6, 5, 4, 5, 4]} // ↘️ trend
          />

          <DashboardCard
            title="Transactions"
            value="354"
            change={1.9}
            width={3}
            height={1}
            trend={[120, 130, 140, 110, 150, 160, 145, 170, 165, 180]}
          />

          {/* Row 2 - 2 Cards, each 6 wide, 2 tall */}
          <DashboardCard width={8} height={2}>
            <h3>Income vs Expenses</h3>
          </DashboardCard>

          <DashboardCard width={4} height={2}>
            <h3>Stock Alerts</h3>
          </DashboardCard>

          {/* Row 3 - 2 Cards, each 6 wide, 2 tall */}
          <DashboardCard width={4} height={2}>
            <h3>Top Selling Items</h3>
          </DashboardCard>

          <DashboardCard width={8} height={2}>
            <h3>Recent Transactions</h3>
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
