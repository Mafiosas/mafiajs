import axios from 'axios'

/* ACTION TYPES */
const GET_GAME = 'GET_GAME'
const JOIN_GAME = 'JOIN_GAME'
const CREATE_GAME = 'CREATE_GAME'

/* INITIAL STATE */
const defaultGame = {}

/* ACTION CREATORS */
const getGame = game => ({ type: GET_GAME, game })
const joinGame = game => ({ type: JOIN_GAME, game })
const createGame = game => ({ type: CREATE_GAME, game })

/* THUNK CREATORS */
export const fetchGame = () =>
  dispatch =>
    axios.get('/api/game')
      .then(res =>
        dispatch(getGame(res.data)))
      .catch(err => console.log(err))

export const addNewGame = (roomName, password) =>
  dispatch =>
    axios.post('/api/game/new', {roomName, password})
      .then(res => 
        dispatch(createGame(res.data)))
      .catch(err => console.log(err))

export const joinExistingGame = (roomName, password) =>
  dispatch => 
    axios.post('/api/game/join', {roomName, password}) // back route needs to post to Player and associate the gameId
      .then(res => 
        dispatch(joinGame(res.data)))
      .catch(err => console.log(err))

/* REDUCER */
export default function (state = defaultGame, action) {
  switch (action.type) {
    case GET_GAME:
      return action.game
    default:
      return state
  }
}