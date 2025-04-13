import { useEffect, useState } from 'react'
import { supabase } from '@zeno/core'
import AccountCard from '../components/AccountCard'
import Modal from '../components/Modal'
import { MdErrorOutline } from "react-icons/md";
import { FaFile } from "react-icons/fa6";
import { MdEdit, MdDelete, MdMoreVert, MdClose } from "react-icons/md";
import NoAccountsSVG from '../assets/no_accounts.svg'
import { parseCsv } from '../utils/csvParsers';
import INSTITUTIONS from '../constants/institutions';
import generateTransactionHash from '../utils/generateTransactionHash';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false)
  
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountToImportTo, setAccountToImportTo] = useState(null)

  const [csvFile, setCsvFile] = useState(null)
  const [importError, setImportError] = useState(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    setLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Not logged in')
      return
    }

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching accounts:', error)
    } else {
      setAccounts(data)
    }

    setLoading(false)
  }

  async function handleCreateAccount(formData) {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) throw new Error('Not logged in')

    const { error } = await supabase.from('accounts').insert([
      {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        institution: formData.institution,
        balance: 0.0,
      },
    ])

    if (error) throw error

    await fetchAccounts()
  }

  async function handleEditAccount(updatedData) {
    if (!accountToEdit) return
  
    const { error } = await supabase
      .from('accounts')
      .update({ name: updatedData.name })
      .eq('id', accountToEdit.id)
  
    if (error) throw error
  
    setShowEditAccountModal(false)
    setAccountToEdit(null)
    fetchAccounts() 
  }

  async function handleDeleteAccount() {
    if (!accountToDelete) return
  
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountToDelete.id)
  
    if (error) throw error
  
    setShowDeleteModal(false)
    setAccountToDelete(null)
    fetchAccounts()
  }

  async function handleCsvUpload() {
    if (!csvFile || !accountToImportTo) return
    setUploading(true)
  
    try {
      const text = await csvFile.text()
      const institution = accountToImportTo.institution
      const accountType = accountToImportTo.type
  
      const { transactions, endingBalance } = parseCsv(text, institution, accountType)
  
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
  
      if (authError || !user) throw new Error('Not logged in')
  
      const withHashes = await Promise.all(
        transactions.map(async (t) => {
          const tx = {
            ...t,
            account_id: accountToImportTo.id,
            user_id: user.id,
          }
      
          const hash = await generateTransactionHash(tx)
          return { ...tx, hash }
        })
      )
  
      // 🚫 Remove already existing hashes
      const hashes = withHashes.map(t => t.hash)
      const { data: existing, error: selectError } = await supabase
        .from('transactions')
        .select('hash')
        .in('hash', hashes)
  
      const existingHashes = new Set(existing?.map(t => t.hash) || [])
      const newTransactions = withHashes.filter(t => !existingHashes.has(t.hash))
  
      if (newTransactions.length > 0) {
        const { error: insertError } = await supabase.from('transactions').insert(newTransactions)
        if (insertError) throw insertError
      }
  
      if (endingBalance !== null) {
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ balance: endingBalance })
          .eq('id', accountToImportTo.id)
  
        if (updateError) throw updateError
      }
  
      await fetchAccounts()
    } catch (err) {
      console.error('Failed to import CSV:', err)
      setImportError('Invalid CSV format or upload failed')
    } finally {
      setUploading(false)
      setCsvFile(null)
      setShowImportModal(false)
      setAccountToImportTo(null)
    }
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

      {!loading && accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-[20px] min-h-[60vh]">
          <img
            src={NoAccountsSVG}
            alt="No accounts illustration"
            className="w-[160px] h-auto mb-[20px] opacity-70"
          />
          <h2 className="text-[18px] font-semibold text-[var(--color-text)] mb-[6px]">
            No Accounts Yet
          </h2>
          <p className="m-[0px] text-[13px] text-[var(--color-text-hover)] max-w-[300px]">
            {`Get started by adding your first account!`}
          </p>
        </div>
      ) : (
        <div className="grid gap-[20px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              name={account.name}
              type={account.type}
              balance={account.balance}
              lastUpdated={account.lastUpdated}
              onEdit={() => {
                setAccountToEdit(account)
                setShowEditAccountModal(true)
              }}
              onDelete={() => {
                setAccountToDelete(account)
                setShowDeleteModal(true)
              }}
              onUpload={() => {
                setAccountToImportTo(account)
                setShowImportModal(true)
              }}
            />
          ))}
        </div>
      )}


      <Modal
        title="Add Account"
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        actionLabel="Create"
        loadingLabel="Creating..."
        onSubmit={(formData) => handleCreateAccount(formData)}
        fields={[
          { name: 'name', label: 'Account Name', required: true, fullWidth: true },
          {
            name: 'type',
            label: 'Account Type',
            type: 'select',
            required: true,
            fullWidth: false,
            options: [
              { label: 'Checking', value: 'checking' },
              { label: 'Savings', value: 'savings' },
              { label: 'Credit Card', value: 'credit_card' },
              { label: 'Investment', value: 'investment' },
            ],
          },
          {
            name: 'institution',
            label: 'Institution',
            type: 'select',
            required: true,
            fullWidth: false,
            options: INSTITUTIONS,
          },
        ]}
      />

      <Modal
        title="Edit Account"
        isOpen={showEditAccountModal}
        onClose={() => {
          setShowEditAccountModal(false)
          setAccountToEdit(null)
        }}
        actionLabel="Save"
        loadingLabel="Saving..."
        onSubmit={(updatedData) => handleEditAccount(updatedData)}
        fields={[
          {
            name: 'name',
            label: 'Account Name',
            required: true,
            fullWidth: true,
            defaultValue: accountToEdit?.name,
          },
        ]}
      />

      <Modal
        title={
          <div className="flex items-center gap-[10px]">
            <MdErrorOutline className="text-[var(--color-error-darker)]" size={30} />
            <span>Delete Account</span>
          </div>
        }
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setAccountToDelete(null)
        }}
        actionLabel="Delete"
        actionType="danger"
        loadingLabel="Deleting..."
        onSubmit={handleDeleteAccount}
      >
        <p className="text-[14px] leading-snug text-[var(--color-text)]">
          Are you sure you want to delete this account? This will also permanently remove all associated transactions.
        </p>
      </Modal>

      <Modal
        title="Import CSV"
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false)
          setCsvFile(null)
          setImportError(null)
          setAccountToImportTo(null)
        }}
        onSubmit={handleCsvUpload}
        actionLabel="Import"
        loadingLabel="Importing..."
        loading={uploading}
        actionType="primary"
        disableSubmit={!csvFile}
        error={importError}
      >
        <div className="csv-import-body">
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                if (!file.name.toLowerCase().endsWith('.csv')) {
                  setImportError('Invalid file format. Please upload a .csv file')
                  e.target.value = ''
                  return
                }
                setImportError(null)
                setCsvFile(file)
              }
            }}
            style={{ display: 'none' }}
          />

          {!csvFile ? (
            <div
              className="w-full min-h-[140px] rounded-[10px] border-[2px] border-dashed border-[var(--color-muted-border)] bg-[var(--color-inner-card)] flex items-center justify-center text-[13px] text-[var(--color-text-hover)] px-[20px] py-[24px] text-center cursor-pointer hover:border-[var(--color-text-hover-darker)] transition"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <p className="text-[13px] text-[var(--color-text-hover)] text-center">
                Drag and drop a CSV file here, or click to upload
              </p>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between gap-[16px] px-[16px] py-[12px] rounded-[10px] bg-[var(--color-inner-card)] ">
              <div className="flex items-center gap-[12px]">
                <FaFile size={24} className="text-[var(--color-text-hover)]" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[var(--color-text)] leading-tight">{csvFile.name}</span>
                  <span className="text-[12px] text-[var(--color-text-hover)]">
                    {(csvFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation()
                  setCsvFile(null)
                  const fileInput = document.getElementById('csv-upload')
                  if (fileInput) fileInput.value = ''
                }}
                className="w-[28px] h-[28px] rounded-full bg-[var(--color-error-darker)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                aria-label="Remove file"
              >
                <MdClose size={14} className="translate-x-[0.5px]"/>
              </div>
            </div>

          )}
        </div>
      </Modal>
    </>
  )
}
