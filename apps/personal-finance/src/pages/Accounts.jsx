import { useState } from 'react'
import AccountCard from '../components/AccountCard'
import Modal from '../components/Modal'

export default function Accounts() {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)

  const fakeAccounts = [
    {
      id: 1,
      name: 'Chase Checking',
      type: 'checking',
      balance: 4213.24,
      lastUpdated: '2025-04-09',
    },
    {
      id: 2,
      name: 'BofA Credit Card',
      type: 'credit card',
      balance: -423.0,
      lastUpdated: null,
    },
    {
      id: 3,
      name: 'Vanguard IRA',
      type: 'investment',
      balance: 12183.52,
      lastUpdated: '2025-04-08',
    },
  ]

  const handleCreateAccount = (formData) => {
    console.log('Creating account with data:', formData)
    setShowAddAccountModal(false)
  }

  return (
    <>      
      <div className="flex justify-between items-center mb-[32px]">
        <div>
          <h1 className="text-[24px] font-bold leading-tight mb-[4px]">Accounts</h1>
        </div>
        <button className="btn btn-primary h-[40px] px-[16px] text-[14px]" onClick={() => setShowAddAccountModal(true)}>
          Add Account
        </button>
      </div>

      <div className="grid gap-[20px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {fakeAccounts.map((account) => (
          <AccountCard
            key={account.id}
            name={account.name}
            type={account.type}
            balance={account.balance}
            lastUpdated={account.lastUpdated}
          />
        ))}
      </div>

      <Modal
        title="Add Account"
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        actionLabel="Create"
        loadingLabel="Creating..."
        onSubmit={(formData) => console.log(formData)}
        fields={[
          { name: 'name', label: 'Account Name', required: true, fullWidth: true },
          {
            name: 'type',
            label: 'Account Type',
            type: 'select',
            required: true,
            fullWidth: true,
            options: [
              { label: 'Checking', value: 'checking' },
              { label: 'Savings', value: 'savings' },
              { label: 'Credit Card', value: 'credit_card' },
              { label: 'Investment', value: 'investment' },
            ],
          }
        ]}
      />
    </>
  )
}
