import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

let supabaseClient = null

// Only attempt to initialize if keys are valid and configured
if (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl) && supabaseUrl !== 'YOUR_SUPABASE_URL') {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
    console.log('☁️ Supabase Cloud Client initialized successfully.')
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
  }
}

// Resilient fallback: If Supabase is unconfigured or invalid, create a Local-First client
if (!supabaseClient) {
  console.log('💾 Running in Local-First Mode (LocalStorage Resilient Fallback).')
  
  supabaseClient = {
    auth: {
      async getSession() {
        let localUser = localStorage.getItem('discipline_local_user')
        if (!localUser) {
          localUser = JSON.stringify({ id: 'local-user', email: 'ca-nhan@local.com' })
          localStorage.setItem('discipline_local_user', localUser)
        }
        const userObj = JSON.parse(localUser)
        return { data: { session: { user: userObj } } }
      },
      onAuthStateChange(callback) {
        this.getSession().then(({ data: { session } }) => {
          callback('SIGNED_IN', session)
        })
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      async signOut() {
        console.log('Mock signed out. Clearing local session.')
        localStorage.removeItem('discipline_local_user')
        window.location.reload()
        return { error: null }
      }
    },
    from(tableName) {
      return {
        select(columns) {
          return {
            eq(field, value) {
              return {
                in(dateField, datesArray) {
                  const saved = localStorage.getItem('discipline_checkins')
                  let checkins = saved ? JSON.parse(saved) : []
                  // Filter local rows by requested date list
                  checkins = checkins.filter(c => datesArray.includes(c.date))
                  return Promise.resolve({ data: checkins, error: null })
                }
              }
            }
          }
        },
        insert(row) {
          return {
            select() {
              return {
                single() {
                  const saved = localStorage.getItem('discipline_checkins')
                  let checkins = saved ? JSON.parse(saved) : []
                  const newRow = {
                    id: Math.random().toString(36).substr(2, 9),
                    created_at: new Date().toISOString(),
                    ...row
                  }
                  checkins.push(newRow)
                  localStorage.setItem('discipline_checkins', JSON.stringify(checkins))
                  return Promise.resolve({ data: newRow, error: null })
                }
              }
            }
          }
        },
        update(rowUpdates) {
          return {
            eq(field, idValue) {
              const saved = localStorage.getItem('discipline_checkins')
              let checkins = saved ? JSON.parse(saved) : []
              checkins = checkins.map(c => {
                if (c.id === idValue) {
                  return { ...c, ...rowUpdates }
                }
                return c
              })
              localStorage.setItem('discipline_checkins', JSON.stringify(checkins))
              return Promise.resolve({ error: null })
            }
          }
        },
        delete() {
          return {
            eq(field, idValue) {
              const saved = localStorage.getItem('discipline_checkins')
              let checkins = saved ? JSON.parse(saved) : []
              checkins = checkins.filter(c => c.id !== idValue)
              localStorage.setItem('discipline_checkins', JSON.stringify(checkins))
              return Promise.resolve({ error: null })
            }
          }
        },
        upsert(rows, options) {
          const saved = localStorage.getItem('discipline_checkins')
          let checkins = saved ? JSON.parse(saved) : []
          
          rows.forEach(newRow => {
            const index = checkins.findIndex(c => c.slot_id === newRow.slot_id && c.date === newRow.date)
            if (index >= 0) {
              checkins[index] = { ...checkins[index], ...newRow }
            } else {
              checkins.push({
                id: Math.random().toString(36).substr(2, 9),
                created_at: new Date().toISOString(),
                ...newRow
              })
            }
          })
          localStorage.setItem('discipline_checkins', JSON.stringify(checkins))
          return Promise.resolve({ error: null })
        }
      }
    }
  }
}

export const supabase = supabaseClient
