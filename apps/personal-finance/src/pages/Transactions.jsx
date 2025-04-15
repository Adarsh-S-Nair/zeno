import { useEffect, useRef, useState } from 'react';
import { supabase } from '@zeno/core';
import TableFilters from '../components/TableFilters';
import Table from '../components/Table';
import { MdOutlineRefresh } from "react-icons/md";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [filterHeight, setFilterHeight] = useState(0);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!filterRef.current) return;

    const observer = new ResizeObserver(() => {
      if (filterRef.current) {
        setFilterHeight(filterRef.current.offsetHeight);
      }
    });

    observer.observe(filterRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Not logged in');
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        description,
        amount,
        balance,
        category,
        category_override,
        account_id,
        accounts (name)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      const formatted = data.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        account: tx.accounts?.name || 'Unknown',
        category: tx.category || 'Uncategorized',
        category_override: tx.category_override || null,
      }));
      setTransactions(formatted);
    }

    setLoading(false);
  }

  async function reapplyCategoriesAndRefresh() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
  
    if (authError || !user) {
      console.error('Not logged in');
      return;
    }
  
    // Fetch all transactions for the user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, description, category, category_override')
      .eq('user_id', user.id);
  
    if (error) {
      console.error('Error fetching transactions for recategorization:', error);
      return;
    }

    const { default: categorizeWithRules } = await import('../utils/categorizer/ruleCategorizer.js');
  
    const updates = transactions
      .filter((tx) => !tx.category_override) // skip manually overridden ones
      .map((tx) => {
        const newCategory = categorizeWithRules(tx.description);
        return (newCategory !== tx.category) ? { id: tx.id, category: newCategory } : null;
      })
      .filter(Boolean);
  
    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('transactions')
        .upsert(updates, { onConflict: 'id' });
  
      if (updateError) {
        console.error('Error updating categories:', updateError);
        return;
      }
  
      console.log(`✅ Updated ${updates.length} transaction categories`);
    } else {
      console.log('✅ All categories are up to date');
    }
  
    // Finally, refetch transactions to update the table
    await fetchTransactions();
  }  

  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginatedRows = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    { label: 'Date', key: 'date' },
    { label: 'Account', key: 'account' },
    { label: 'Description', key: 'description' },
    { label: 'Amount', key: 'amount', align: 'center' },
    { label: 'Category', key: 'category', align: 'center' },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-[32px]">
        <h1 className="text-[24px] font-bold leading-tight">Transactions</h1>
      </div>

      <div ref={filterRef}>
        <TableFilters
          filters={[
            { type: 'dateRange', label: 'Date Range' },
            { type: 'dropdown', label: 'Account', options: ['All'] },
            { type: 'amountRange', label: 'Amount Range' },
            { type: 'search', placeholder: 'Search transactions' },
          ]}
        />
      </div>

      <div className="overflow-y-auto" style={{ height: `calc(100vh - ${filterHeight + 200}px)` }}>
        <Table
          columns={columns}
          rows={paginatedRows}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          onRefresh={reapplyCategoriesAndRefresh}
          setTransactions={setTransactions}
        />
      </div>
    </>
  );
}
