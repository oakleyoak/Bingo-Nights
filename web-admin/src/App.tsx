import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, Gamepad2, Trophy, Settings } from 'lucide-react'

// Initialize Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://oluqgthjdyqffrrbnrls.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdXFndGhqZHlxZmZycmJucmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjU1OTksImV4cCI6MjA3Mzk0MTU5OX0.sfYjHwq9zLb3u8wpX-TiA596q3z0tGRLu66hFJ_cUj4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGames: 0,
    totalGamesPlayed: 0,
    totalPointsAwarded: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get active games
      const { count: gameCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'running')

      // Get total games played (from game_results)
      const { count: totalGamesCount } = await supabase
        .from('game_results')
        .select('*', { count: 'exact', head: true })

      // Get total points awarded
      const { data: pointsData } = await supabase
        .from('profiles')
        .select('points')

      const totalPoints = pointsData?.reduce((sum, profile) => sum + (profile.points || 0), 0) || 0

      setStats({
        totalUsers: userCount || 0,
        activeGames: gameCount || 0,
        totalGamesPlayed: totalGamesCount || 0,
        totalPointsAwarded: totalPoints
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Bingo Nights Admin</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('games')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'games'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Games
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Users
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Users
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalUsers}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Gamepad2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Games
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.activeGames}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Trophy className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Games Played
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalGamesPlayed}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Settings className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Points
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalPointsAwarded.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Create New Game
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  View Recent Games
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                  User Management
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Games Management</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">Games management features coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">User Management</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-gray-500">User management features coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App