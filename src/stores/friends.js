// import { defineStore } from 'pinia'
// import { ref } from 'vue'

// export const useFriendsStore = defineStore('friends', () => {
//   const friends = ref([])
//   const requests = ref([])
//   const loading = ref(false)
//   const error = ref('')

//   const API_BASE = 'https://placeholder-api.studybuddy.com/api' // replace later

//   async function fetchFriends() {
//     loading.value = true
//     try {
//       const res = await fetch(`${API_BASE}/friends`)
//       if (!res.ok) throw new Error('Failed to fetch friends')
//       friends.value = await res.json()
//     } catch (err) {
//       error.value = err.message
//     } finally {
//       loading.value = false
//     }
//   }

//   async function fetchRequests() {
//     try {
//       const res = await fetch(`${API_BASE}/friend-requests`)
//       if (!res.ok) throw new Error('Failed to fetch requests')
//       requests.value = await res.json()
//     } catch (err) {
//       error.value = err.message
//     }
//   }

//   async function sendRequest(username) {
//     try {
//       const res = await fetch(`${API_BASE}/friend-requests`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username }),
//       })
//       if (!res.ok) throw new Error('Could not send request')
//       await fetchRequests()
//     } catch (err) {
//       error.value = err.message
//     }
//   }

//   async function acceptRequest(id) {
//     try {
//       const res = await fetch(`${API_BASE}/friend-requests/${id}/accept`, {
//         method: 'POST',
//       })
//       if (!res.ok) throw new Error('Could not accept request')
//       await fetchFriends()
//       await fetchRequests()
//     } catch (err) {
//       error.value = err.message
//     }
//   }

//   return {
//     friends,
//     requests,
//     loading,
//     error,
//     fetchFriends,
//     fetchRequests,
//     sendRequest,
//     acceptRequest,
//   }
// })
