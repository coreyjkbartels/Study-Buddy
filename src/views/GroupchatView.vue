<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

let hasFriends = ref(true)
let userFriends = ref([])
let selectedFriends = ref([])
let groupName = ref()
let allGroups = ref([])
let userInvites = ref([]);

let groupSelected = ref(true);
let messageCreated = ref()
let myUsername = localStorage.getItem('username')

let groupSelectedName = ref('')
let groupSelectedId = ref()
let groupMessages = ref([])
let activeGroup = ref()
let usersActive = ref([])
let addUsers = ref([])
let intervalId = setInterval(() => {

  // addToGroupMessages()
}, 20000)





onMounted(() => {

 getAllGroups()
})

watch(groupSelected, (newVal) => {
  if(!newVal) {
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
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)

  if(response.status === 200) {
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
      'Content-type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)

  if(response.status === 200) {
    let messageData = await response.json()
    console.log(messageData)

    let newMessageData = messageData.filter(msg => {
      return !groupMessages.value.some(existing => existing._id === msg._id)
    })

    console.log("working")
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
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)


  if(response.ok) {
    console.log(response.status)
    let chatData = await response.json()
    await getFriends();

    console.log(userFriends.value)

    usersActive.value = chatData.users


    addUsers.value = userFriends.value.filter(friend => {
      return !usersActive.value.some(sel => sel.username === friend.username)
    })






    console.log("bam")
    console.log(userFriends.value)
    console.log(addUsers.value)
    console.log(usersActive.value)
    console.log("bam")


  } else {
    console.log(response.status)
  }
}



async function getGroupMessages(data) {
  let chatid = data['chatId']


  if(activeGroup.value === data) {
    addToGroupMessages()

  } else {
    activeGroup.value = data
    groupMessages.value = []
    addUsers.value = []







    let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${chatid}/messages`

    let options = {
      method: 'GET',
      headers: {
        'Content-type' : 'application/json',
        'Authorization' : `Bearer ${localStorage.getItem('token')}`
      }
    }


    let response = await fetch(url, options)

    if(response.status === 200) {
      let messageData = await response.json()

      groupSelectedId.value = chatid
      groupSelectedName.value = data.groupName
      groupSelected.value = false;



      createGroupMessages(messageData)
    }

  }

}

async function createGroupMessages(messageArr) {
  console.log(messageArr)
  let newArr = messageArr.filter(message => 'content' in message)

  for(const message of newArr){
    let user = await getUser(message.sender)
    groupMessages.value.push({
      content: message.content,
      senderName: user.user.username,
      "_id": message._id
    })



  }

  console.log(activeGroup.value);



  console.log(groupMessages.value)




}



async function sendMessage() {

  if(messageCreated.value == '') return

  let data = {
    'content' : messageCreated.value
  }

   let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/${groupSelectedId.value}/message`

  let options = {
    method: 'POST',
    headers: {
      'Content-type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }


  let response = await fetch(url, options)

  if(response.status === 200) {
    console.log("message sent successful")

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
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)

  if(response.status === 200) {
    let data = await response.json()

    userInvites.value = data
    let inviteModal = document.querySelector('.invites-modal');
    inviteModal.style.display = 'flex'

    console.log(data)
  }
}


async function sendInvite(id) {
  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invite/${groupSelectedId.value}/${id}`

  let options = {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)

  if(response.ok) {
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
      "Content-Type" : 'application/json',
      "Authorization" : `Bearer ${localStorage.getItem('token')}`
    }

  }

  let response = await fetch(url, options)

  if(response.status === 200) {
    let data = await response.json()

    for(let i = 0; i < data.friends.length; i++) {

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
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }

  let response = await fetch(url, options)

  if(response.status === 200) {
    let user = await response.json()

    return user
  }
}


async function getUsers(data) {

  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/user/${data}`

  let options = {
    method: 'GET',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    }
  }


  let response = await fetch(url, options)

  if(response.status === 200) {
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
    users: selectedFriends.value
  }

  let options = {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' : `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }

  let response = await fetch(url, options)

  if(response.status === 201) {
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
  modal.style.display = "none"
  createGroup()


}


function add(id) {
  selectedFriends.value.push(id)
  console.log(selectedFriends.value)
}

function close() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = "none"
  selectedFriends.value = []
}

async function open() {
  let modal = document.querySelector('.group-modal')
  modal.style.display = 'flex'
  userFriends.value = []

  await getFriends();
}

function openInvites() {
}

function closeInvites() {
  let inviteModal = document.querySelector('.invites-modal');
  inviteModal.style.display = 'none'

}



function openAdd() {
  let modal = document.querySelector('.add-modal');
  modal.style.display = 'flex'
  grabSelectedUsers(activeGroup.value)


}

function closeAdd() {
  let modal = document.querySelector('.add-modal');
  modal.style.display = 'none'
  addUsers.value = []

}

async function acceptInvite(invite) {

  let url = `https://studdy-buddy-api-h7kw3.ondigitalocean.app/group/invite/${invite._id}`
  let data = {
    "isAccepted": true
  }

  let options = {
    method: 'PATCH',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization' :  `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }


  let response = await fetch(url, options)

  if(response.ok) {
    allGroups.value = []


    let index = userInvites.value.indexOf(invite)
    if(index !== -1) userInvites.value.splice(index, 1)
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
          <div class="chat-box" tabindex="0" v-for="group in allGroups.slice().reverse()" :key="group.id" @click="getGroupMessages(group)">
            <span class="chat-box-name">{{ group.groupName }}</span>
          </div>






        </div>
        <div class="chatbox-footer">
          <button class="invites-button" @click="getGroupInvites()">invites</button>
        </div>
      </div>
      <div class="chats-container">
        <div class="no-selection" v-if="groupSelected"> Select a group </div>
        <div class="selected-group-container" v-else>
          <div class="selected-group-header">
            <span class="selected-group-name">{{ groupSelectedName }}</span>
            <button class="addPeople" @click="openAdd()">add people</button>

          </div>
          <div class="selected-group-messages">
            <div class="users-messages">
              <div class="friends-messages" :class="{ self: message.senderName === myUsername}" v-for="message in groupMessages.slice().reverse()" :key="message.id">
                <span class="sender-name">{{ message.senderName }}</span>
                <span class="message">{{ message.content }}</span>
              </div>


            </div>


          </div>

          <div class="selected-group-send-message">
            <textarea name="" id="" class="messageInput" v-model="messageCreated" placeholder="Send Message..."></textarea>
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
          <input type="text" class="group-name" v-model="groupName" placeholder="Enter Group Name">
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
            <span class="invite-from">{{ invite.sender[0].username }} sent you invite</span>

            <span class="invite-group-name">{{ invite.group.name}}</span>

            <div class="invite-buttons-container">
              <button class="accept-invite" @click="acceptInvite(invite)">accept</button>
              <button class="decline-invite">decline</button>
            </div>

          </div>

        </div>


        <div class="invite-footer">
          <button class="cancel-invite" @click="closeInvites()">cancel</button>

        </div>
      </div>

    </div>

    <div class="add-modal">
      <div class="add-people-container">
        <div class="user-add-options" v-for="user in addUsers" :key="user.id">
          <span class="user-add-name">{{ user.username }}</span>
          <button class="user-add-button" @click="sendInvite(user._id)">add</button>
        </div>

        <button class="close-add-modal" @click="closeAdd()">exit</button>
      </div>
    </div>

  </div>
</template>


<style scoped>

button {
  cursor: pointer;
}





.add-modal {
  display: none;
  justify-content: center;
  align-items: center;
  height: 850px;
  width: 1400px;
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.33);
  position: absolute;
  backdrop-filter: blur(10px);

}

.add-people-container {
  width: 600px;
  height: 500px;
  background: rgb(114, 114, 114);
  position: relative;
  padding-block: 3rem;
  overflow-y: auto;
}

.user-add-options {
  width: 600px;
  height: 70px;
  border: 1px solid black;
  margin-block: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 1rem;
}

.user-add-button {
  width: 100px;
  height: 30px;

}

.user-add-name {
  font-size: 20px;
}

.close-add-modal {
  position: absolute;
  width: 60px;
  height: 30px;
  background: rgb(103, 103, 111);
  top: 10px;
  left: 10px;
  border: none;
}

.button-container {
  width: 500px;
  height: 40px;
  display: flex;
  padding-inline: 1.5rem;
  justify-content: space-between;
  align-items: center;
}

.button-container button {
  width: 70px;
  height: 25px;
}



.create-name-container {
  width: 500px;
  height: 70px;

  display: flex;
  justify-content: center;
  align-items: center;
}

.group-name {
  width: 450px;
  height: 40px;
}

.added-friends-container {
  width: 500px;
  height: 300px;

  border-bottom: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  margin-top: 1rem;
  overflow-y: auto;

}


.friend-list {
  padding-inline: 1rem;
  width: 450px;
  min-height: 40px;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}








.main-container {
  height: calc(100vh - 84px);
  background: white;
  display: flex;
  justify-content: center;
  align-items: top;
  position: relative;

}

.sidebar-header {
  display: flex;
  justify-content: space-between;

  align-items: center;
  margin: 1rem;
  padding-bottom: 1rem;


}



.users-messages {

  height: 750px;
  display: flex;
  flex-direction: column-reverse;
  align-items: start;

  overflow-y: auto;
}

.friends-messages {
  min-width: 100px;
  max-width: 500px;
  min-height: 40px;
  box-sizing: border-box;
  padding: .5rem;
  margin-block: 1rem;
  font-size: 15px;
  background: rgba(0, 0, 255, 0.196);
  display: flex;
  flex-direction: column;

}


.sender-name {
  font-size: 10px;
}



.self {
  background: red;
  align-self: flex-end;
}

.add-group-button {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  border: none;
  cursor: pointer;
  font-size: 20px;

}

.add-group-button:hover {
  background: darkgrey;
}

.sidebar-chats {
  width: 400px;
  height: 850px;
  position: relative;

  background: white;
  display: flex;
  flex-direction: column;

}

.no-selection {
  position: absolute;
  left: 45%;
  top: 45%;
  font-size: 30px;
}


.chats-container {
  width: 1000px;
  height: 850px;
  display: flex;
  background: rgb(255, 255, 255);
  border-left: 1px solid black;
  position: relative;
}








.selected-group-container {
  width: 1000px;
  height: 850px;
  display: flex;
  flex-direction: column;
}

.selected-group-header {
  width: 1000px;
  height: 50px;
  border-bottom: 1px solid black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 1rem;
}

.addPeople {
  width: 100px;
  height: 30px;
  border: none;
}

.selected-group-name {
  font-size: 20px;
}



.selected-group-messages {
  width: 1000px;
  height: 740px;

}

.selected-group-send-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  position: relative;
}

.messageInput {
  resize: none;
  min-width: 1000px;
  min-height: 50px;
  margin-top: 1rem;
  font-size: 15px;
  padding-left: .5rem;
  padding-top: .5rem;
  border: none;
}




.sendMessage {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 60px;
  height: 25px;
  border: none;
}












.groupchat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 850px;
  margin-top: 1rem;
  box-shadow: 0 0 5px 5px rgb(243, 243, 243);

}




.sidebar-title {
  font-size: 23px;
  font-weight: 700;
}

.chatbox-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;




}

.chatbox-footer {
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 1rem;

  width: 400px;

  height: 50px;

}

.chat-box {
  width: 400px;
  min-height: 80px;
  background: rgb(255, 255, 255);
  border-top: 1px solid black;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  cursor: pointer;
}

.invites-button {
  width: 70px;
  height: 30px;
  border: none;
  cursor: pointer;
}

.chat-box:hover {
  background: grey;
}

.chat-box-name {
  font-size: 20px;
}







.invites-modal {
  position: absolute;
  background: rgba(0, 0, 0, 0.335);
  width: 1400px;
  height: 850px;
  bottom: 10px;
  backdrop-filter: blur(10px);
  display: none;
  justify-content: center;
  align-items: center;
}


.invites-container {
  width: 600px;
  height: 500px;
  background: rgb(224, 224, 227);
  display: flex;
  flex-direction: column;

}

.invite-footer {
  width: 600px;
  height: 50px;
  display: flex;
  justify-content: start;
  padding-left: 1rem;
  align-items: center;
}

.invite-box {
  width: 550px;
  min-height: 60px;
  margin-bottom: 0.25rem;
  border: 1px solid black;
  display: flex;
  justify-content: space-between;
  padding-inline: 1rem;
  align-items: center;
}

.show-invites {
  width: 600px;
  height: 450px;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: 1rem;
  overflow-y: auto;

}

.invite-buttons-container {
  display: flex;
  gap: 1rem;
}

.invite-buttons-container button {
  cursor: pointer;
}






.group-modal {
  display: none;
  justify-content: center;
  align-items: center;
  height: 850px;
  width: 1400px;
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.33);
  position: absolute;
  backdrop-filter: blur(10px);


}

.create-group-container {
  width: 500px;
  height: 500px;
  background: rgb(207, 207, 207);
  padding-top: 1rem;

}

.friends-header {

  font-size: 20px;
  margin-left: 1rem;
  text-decoration: underline;
  text-underline-offset: .5rem;
}



</style>
