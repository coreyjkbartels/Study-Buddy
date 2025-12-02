<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

let hasFriends = ref(true)
let userFriends = ref([])
let selectedFriends = ref([])
let groupName = ref()
let allGroups = ref([])
let userInvites = ref([])

let groupSelected = ref(true)
let messageCreated = ref()
let myUsername = localStorage.getItem('username')

let groupSelectedName = ref('')
let groupSelectedId = ref()
let groupMessages = ref([])
let activeGroup = ref()
let usersActive = ref([])
let addUsers = ref([])
let intervalId = setInterval(() => {}, 20000)

onMounted(() => {
  getAllGroups()
})

watch(groupSelected, (newVal) => {
  if (!newVal) {
    intervalId
  } else {
    clearInterval(intervalId)
  }
})

onUnmounted(() => {
  clearInterval(intervalId)
})

async function getAllGroups() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/groups'

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    allGroups.value = data

    console.log('value')
    console.log(allGroups.value)
  }
}

async function addToGroupMessages() {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${groupSelectedId.value}/messages`

  let options = {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let messageData = await response.json()
    console.log(messageData)

    let newMessageData = messageData.filter((msg) => {
      return !groupMessages.value.some((existing) => existing._id === msg._id)
    })

    console.log('working')
    console.log(groupSelected.value)

    createGroupMessages(newMessageData)
  }
}

async function grabSelectedUsers(data) {
  addUsers.value = []
  userFriends.value = []
  let id = data.chatId
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${id}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.ok) {
    console.log(response.status)
    let chatData = await response.json()
    await getFriends()

    console.log(userFriends.value)

    usersActive.value = chatData.users

    addUsers.value = userFriends.value.filter((friend) => {
      return !usersActive.value.some((sel) => sel.username === friend.username)
    })

    console.log('bam')
    console.log(userFriends.value)
    console.log(addUsers.value)
    console.log(usersActive.value)
    console.log('bam')
  } else {
    console.log(response.status)
  }
}

async function getGroupMessages(data) {
  let chatid = data['chatId']

  if (activeGroup.value === data) {
    addToGroupMessages()
  } else {
    activeGroup.value = data
    groupMessages.value = []
    addUsers.value = []

    let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${chatid}/messages`

    let options = {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }

    let response = await fetch(url, options)

    if (response.status === 200) {
      let messageData = await response.json()

      groupSelectedId.value = chatid
      groupSelectedName.value = data.groupName
      groupSelected.value = false

      createGroupMessages(messageData)
    }
  }
}

async function createGroupMessages(messageArr) {
  console.log(messageArr)
  let newArr = messageArr.filter((message) => 'content' in message)

  for (const message of newArr) {
    let user = await getUser(message.sender)
    groupMessages.value.push({
      content: message.content,
      senderName: user.user.username,
      _id: message._id,
    })
  }

  console.log(activeGroup.value)

  console.log(groupMessages.value)
}

async function sendMessage() {
  if (messageCreated.value == '') return

  let data = {
    content: messageCreated.value,
  }

  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${groupSelectedId.value}/message`

  let options = {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    console.log('message sent successful')

    addToGroupMessages()
    messageCreated.value = ''
  } else {
    console.log(response.status)
  }
}

async function getGroupInvites() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invites'

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    userInvites.value = data
    let inviteModal = document.querySelector('.invites-modal')
    inviteModal.style.display = 'flex'

    console.log(data)
  }
}

async function sendInvite(id) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invite/${groupSelectedId.value}/${id}`

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.ok) {
    console.log('successfull invite')
  } else {
    response.status
  }
}

async function getFriends() {
  let url = 'https://studdy-buddy-api-h7kw3.ondigitalocean.app/friends'

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    for (let i = 0; i < data.friends.length; i++) {
      console.log(data.friends[i])
      await getUsers(data.friends[i].friendId)
    }
  } else {
    console.log(response.status)
  }
}

async function getUser(id) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/${id}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let user = await response.json()

    return user
  }
}

async function getUsers(data) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/${data}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }

  let response = await fetch(url, options)

  if (response.status === 200) {
    let data = await response.json()

    userFriends.value.push(data.user)
    return data
  } else {
    console.log(response.status)
  }
}

async function createGroup() {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group`

  let data = {
    groupName: groupName.value,
    users: selectedFriends.value,
  }

  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)

  if (response.status === 201) {
    let d = await response.json()
    console.log(d)
    console.log('group created successfully')
    allGroups.value.push(d)
    getAllGroups()
    groupName.value = ''
  } else {
    console.log(response.status)
  }
}

function save() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'none'
  createGroup()
}

function add(id) {
  selectedFriends.value.push(id)
  console.log(selectedFriends.value)
}

function close() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'none'
  selectedFriends.value = []
}

async function open() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'flex'
  userFriends.value = []

  await getFriends()
}

function closeInvites() {
  let inviteModal = document.querySelector('.invites-modal')
  inviteModal.style.display = 'none'
}

function openAdd() {
  let modal = document.querySelector('.add-modal')
  modal.style.display = 'flex'
  grabSelectedUsers(activeGroup.value)
}

function closeAdd() {
  let modal = document.querySelector('.add-modal')
  modal.style.display = 'none'
  addUsers.value = []
}

async function acceptInvite(invite) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invite/${invite._id}`
  let data = {
    isAccepted: true,
  }

  let options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  }

  let response = await fetch(url, options)

  if (response.ok) {
    allGroups.value = []

    let index = userInvites.value.indexOf(invite)
    if (index !== -1) userInvites.value.splice(index, 1)
    getAllGroups()
  } else {
    console.log(response.status)
  }
}
</script>

<template>
  <div class="main-container">
    <div class="groupchat-container">
      <div class="sidebar-chats">
        <div class="sidebar-header">
          <span class="sidebar-title">Groupchats</span>

          <button class="add-group-button" @click="open()">+</button>
        </div>
        <div class="chatbox-container">
          <div
            class="chat-box"
            tabindex="0"
            v-for="group in allGroups.slice().reverse()"
            :key="group.id"
            @click="getGroupMessages(group)"
          >
            <span class="chat-box-name">{{ group.groupName }}</span>
          </div>
        </div>
        <div class="chatbox-footer">
          <button class="invites-button" @click="getGroupInvites()">Invites</button>
        </div>
      </div>
      <div class="chats-container">
        <div class="no-selection" v-if="groupSelected">Select a group</div>
        <div class="selected-group-container" v-else>
          <div class="selected-group-header">
            <span class="selected-group-name">{{ groupSelectedName }}</span>
            <button class="addPeople" @click="openAdd()">Add People</button>
          </div>
          <div class="selected-group-messages">
            <div class="users-messages">
              <div
                class="friends-messages"
                :class="{ self: message.senderName === myUsername }"
                v-for="message in groupMessages.slice().reverse()"
                :key="message.id"
              >
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message">{{ message.content }}</span>
              </div>
            </div>
          </div>

          <div class="selected-group-send-message">
            <textarea
              name=""
              id=""
              class="messageInput"
              v-model="messageCreated"
              placeholder="Send Message..."
            ></textarea>
            <button class="sendMessage" @click="sendMessage()">Send</button>
          </div>
        </div>
      </div>
    </div>
    <div class="group-modal">
      <div class="create-group-container">
        <span class="friends-header">Friends List</span>

        <div class="added-friends-container" v-show="hasFriends">
          <div class="friend-list" v-for="friend in userFriends" :key="friend.id">
            <div class="friend-name">{{ friend.username }}</div>
            <button class="addFriend" @click="add(friend['_id'])">ADD</button>
          </div>
        </div>

        <div class="create-name-container">
          <input
            type="text"
            class="group-name"
            v-model="groupName"
            placeholder="Enter Group Name"
          />
        </div>

        <div class="button-container">
          <button class="cancel-group-button" @click="close()">cancel</button>
          <button class="save-group-button" @click="save()">save</button>
        </div>
      </div>
    </div>

    <div class="invites-modal">
      <div class="invites-container">
        <div class="show-invites">
          <div class="invite-box" v-for="invite in userInvites" :key="invite.id">
            <span class="invite-from">{{ invite.sender[0].username }} sent you an invite</span>

            <span class="invite-group-name">{{ invite.group.name }}</span>

            <div class="invite-buttons-container">
              <button class="accept-invite" @click="acceptInvite(invite)">Accept</button>
              <button class="decline-invite">Decline</button>
            </div>
          </div>
        </div>

        <div class="invite-footer">
          <button class="cancel-invite" @click="closeInvites()">Cancel</button>
        </div>
      </div>
    </div>

    <div class="add-modal">
      <div class="add-people-container">
        <div class="user-add-options" v-for="user in addUsers" :key="user.id">
          <span class="user-add-name">{{ user.username }}</span>
          <button class="user-add-button" @click="sendInvite(user._id)">Add</button>
        </div>

        <button class="close-add-modal" @click="closeAdd()">Exit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #6366f1;
  --accent: #1976d2;
  --white: #ffffff;
  --error: #ef4444;
  --bg-gray: #f9fafb;
  --border-gray: #e5e7eb;
  --text-gray: #6b7280;
  --radius: 10px;
  --gap: 1rem;
}

* {
  box-sizing: border-box;
}

/* Main Container - Matching HomeView deep styles */
.main-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Groupchat Container - Using messages-container structure from HomeView */
.groupchat-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  height: calc(100vh - 150px);
  width: 100%;
  max-width: 100%;
  background: var(--white);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 0;
}

/* Sidebar Styles - Matching friends-sidebar from HomeView */
.sidebar-chats {
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.sidebar-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.add-group-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--white);
  color: var(--primary);
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-group-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.9);
}

/* Chatbox Container - Matching friends-list from HomeView */
.chatbox-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-box {
  width: 100%;
  min-height: 60px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;
  color: var(--white);
  font-weight: 600;
}

.chat-box:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-box:focus {
  outline: none;
  background: var(--white);
  color: var(--primary);
}

.chat-box.active {
  background: var(--white);
  color: var(--primary);
}

.chat-box-name {
  font-size: 1rem;
  font-weight: 600;
}

/* Chatbox Footer */
.chatbox-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.invites-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: var(--white);
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.invites-button:hover {
  opacity: 0.9;
}

/* Chat Area - Matching chat-area from HomeView */
.chats-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--white);
  overflow-y: auto;
  position: relative;
}

.no-selection {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.1rem;
  color: var(--text-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Selected Group Container - Matching chat-container from HomeView */
.selected-group-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.selected-group-header {
  width: 100%;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--border-gray);
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.selected-group-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.addPeople {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--white);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.addPeople:hover {
  opacity: 0.9;
}

/* Messages Area - Matching messages-list from HomeView */
.selected-group-messages {
  width: 100%;
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.users-messages {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  min-height: 100%;
}

/* Friends Messages - Matching message structure from HomeView */
.friends-messages {
  display: flex;
  margin-bottom: 0.5rem;
  min-width: 100px;
  max-width: 60%;
  align-self: flex-start;
}

.friends-messages.self {
  justify-content: flex-end;
  align-self: flex-end;
}

.friends-messages .sender-name,
.friends-messages .message {
  display: block;
}

/* Styling the message content wrapper */
.friends-messages {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
  background: var(--bg-gray);
  color: #333;
  border-bottom-left-radius: 4px;
}

.friends-messages.self {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 4px;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
  display: block;
  margin-bottom: 0.25rem;
}

.message {
  font-size: 1rem;
  display: block;
  color: white;
}

/* Message Input - Matching message-input-container from HomeView */
.selected-group-send-message {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 2px solid var(--border-gray);
  background: var(--white);
  flex-shrink: 0;
}

.messageInput {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--accent);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  resize: none;
  min-height: 50px;
}

.messageInput:focus {
  border-color: var(--primary);
}

.sendMessage {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: opacity 0.2s ease;
}

.sendMessage:hover {
  opacity: 0.9;
}

/* Modals - Matching modal styles */
.group-modal,
.invites-modal,
.add-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Create Group Modal */
.create-group-container {
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.friends-header {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  border-bottom: 2px solid var(--border-gray);
  padding-bottom: 0.75rem;
  margin: 0;
  text-decoration: none;
}

.added-friends-container {
  width: 100%;
  max-height: 300px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  padding: 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.friend-list {
  padding: 0.75rem 1rem;
  width: 100%;
  min-height: 50px;
  border: none;
  background: var(--bg-gray);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.friend-name {
  font-weight: 600;
  color: #333;
}

.addFriend {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: var(--white);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.addFriend:hover {
  opacity: 0.9;
}

.create-name-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.group-name {
  width: 100%;
  height: 50px;
  padding: 0.75rem;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.group-name:focus {
  border-color: var(--primary);
}

.button-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.cancel-group-button,
.save-group-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.cancel-group-button {
  background: var(--border-gray);
  color: #333;
}

.save-group-button {
  background: var(--primary);
  color: var(--white);
}

.cancel-group-button:hover,
.save-group-button:hover {
  opacity: 0.9;
}

/* Invites Modal */
.invites-container {
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.show-invites {
  width: 100%;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  margin-bottom: 1rem;
  overflow-y: auto;
}

.invite-box {
  width: 100%;
  min-height: 80px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  background: var(--bg-gray);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invite-from {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.invite-group-name {
  font-size: 0.9rem;
  color: var(--text-gray);
}

.invite-buttons-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.accept-invite,
.decline-invite {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.accept-invite {
  background: #10b981;
  color: var(--white);
}

.decline-invite {
  background: var(--error);
  color: var(--white);
}

.accept-invite:hover,
.decline-invite:hover {
  opacity: 0.9;
}

.invite-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 2px solid var(--border-gray);
}

.cancel-invite {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--border-gray);
  color: #333;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.cancel-invite:hover {
  opacity: 0.9;
}

/* Add People Modal */
.add-people-container {
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  background: var(--white);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.user-add-options {
  width: 100%;
  min-height: 60px;
  border: 2px solid var(--border-gray);
  border-radius: 8px;
  background: var(--bg-gray);
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.user-add-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.user-add-button {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: var(--white);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.user-add-button:hover {
  opacity: 0.9;
}

.close-add-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: var(--border-gray);
  color: #333;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.close-add-modal:hover {
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .groupchat-container {
    grid-template-columns: 1fr;
    height: calc(100vh - 120px);
  }

  .sidebar-chats {
    display: none;
  }

  .chats-container {
    width: 100%;
  }

  .friends-messages {
    max-width: 80%;
  }
}
</style>
