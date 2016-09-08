import {
    createUser,
    updateUser,
    markUserAsOnline,
    markUserAsOffline
} from '../../../api/db/user'
import userMutations from './mutations'
import authMutations from '../auth/mutations'
import { getCurrentUserObject } from './getters'
import { ValueChangedObserver } from '../../../services/observers'
import * as paths from '../../../api/db/paths'

const observers = {
    user: new ValueChangedObserver()
}

let currentUserId = null

const subscriptions = {
    [userMutations.CHANGED]: ({state}) => {
        const user = getCurrentUserObject(state)
        createUser(user.uid, user).then(() => {
            updateUser(user.uid, user)
        }).catch(error => {
            console.log(`Error while creating/updating user on ${userMutations.CHANGED}: ${error.message}`)
        })
    },
    [authMutations.USER_CHANGED]: ({dispatch}, mutation) => {
        const user = mutation.payload[0]
        if (user) {
            const path = paths.user(user.uid)
            observers.user.start(path, data => {
                if (data) {
                    // Append uid as it's not stored in the node content.
                    data.uid = user.uid
                    dispatch(userMutations.CHANGED, data)
                } else {
                    createUser(user.uid, user)
                }
            })
            if (currentUserId) {
                markUserAsOffline(currentUserId)
            }
            currentUserId = user.uid
            markUserAsOnline(user.uid)
        } else {
            observers.user.stop()
            dispatch(userMutations.RESET)
            // Don't mark user as offline here as the database is write-protected
        }
    }
}

export default function createPlugin(store) {
    store.subscribe((mutation, state) => {
        const type = mutation.type
        if (type in subscriptions) {
            subscriptions[type](store, mutation)
        }
    })
}
