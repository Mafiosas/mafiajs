import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {addNewGame, joinExistingGame} from '../store'

const RoomForm = (props) => {
  const {name, displayName, handleSubmit, error} = props
  return (
    <div>
      <form onSubmit={handleSubmit} name={name}>
        <div>
          <label>Room Name:</label>
          <input name="roomName" type="text" />
        </div>
        <div>
          <label>Password:</label>
          <input name="password" type="text" />
        </div>
        <div>
          <button type="submit">{displayName}</button>
        </div>
        {error && error.response && <div> {error.response.data} </div>}
      </form>
    </div>
  )
}

const mapJoin = (state) => {
  return {
    name: 'join-game',
    displayName: 'Join Game',
    error: state.player.error
  }
}

const mapCreate = (state) => {
  return {
    name: 'create-game',
    displayName: 'Create Game',
    error: state.player.error
  }
}

const mapJoinDispatch = (dispatch) => {
  return {
    handleSubmit (evt) {
      evt.preventDefault()
      const formName = evt.target.name
      const roomName = evt.target.roomName.value
      const password = evt.target.password.value
      dispatch(joinExistingGame(roomName, password))
    }
  }
}

const mapCreateDispatch = (dispatch) => {
  return {
    handleSubmit (evt) {
      evt.preventDefault()
      const formName = evt.target.name
      const roomName = evt.target.roomName.value
      const password = evt.target.password.value
      dispatch(addNewGame(roomName, password))
    }
  }
}

export const JoinAGame = connect(mapJoin, mapJoinDispatch)(RoomForm)
export const CreateAGame = connect(mapCreate, mapCreateDispatch)(RoomForm)

/* PROP TYPES */
AuthForm.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.object
}
