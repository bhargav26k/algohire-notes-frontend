import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL  // same as API base
const socket = io(SOCKET_URL!, { autoConnect: true })

export default socket
